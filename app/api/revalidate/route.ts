import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { parseBody } from 'next-sanity/webhook'
import { CONTENT_TAG } from '@/lib/content'

const SIGNATURE_HEADER = 'sanity-webhook-signature'
const MAX_AGE_MS = 5 * 60 * 1000

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return new Response('SANITY_REVALIDATE_SECRET is missing from the environment', { status: 500 })
  }

  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret)

    if (!isValidSignature) {
      return new Response('Invalid signature', { status: 401 })
    }

    const timestamp = Number(/t=(\d+)/.exec(request.headers.get(SIGNATURE_HEADER) ?? '')?.[1])
    if (Number.isFinite(timestamp) && Math.abs(Date.now() - timestamp) > MAX_AGE_MS) {
      return new Response('Expired signature', { status: 401 })
    }

    revalidateTag(CONTENT_TAG, 'max')

    return Response.json({
      revalidated: true,
      tag: CONTENT_TAG,
      type: body?._type ?? null,
    })
  } catch (error) {
    console.error('[revalidate] Error processing the Sanity webhook', error)
    return new Response('Could not process the webhook', { status: 400 })
  }
}
