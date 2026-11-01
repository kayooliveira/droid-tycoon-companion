import { Image } from '@react-pdf/renderer'
import type { PdfDroidReq } from './buildCyclePdfModel'

export function DroidThumb({
  req,
  style,
}: {
  req: PdfDroidReq
  style: React.ComponentProps<typeof Image>['style']
}) {
  return <Image src={req.imageSrc} style={style} />
}
