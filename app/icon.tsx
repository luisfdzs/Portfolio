import { monogramImage } from '@/components/brand/monogram'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return monogramImage(size.width)
}
