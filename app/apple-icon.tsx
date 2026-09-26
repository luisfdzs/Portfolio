import { monogramImage } from '@/components/brand/monogram'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return monogramImage(size.width)
}
