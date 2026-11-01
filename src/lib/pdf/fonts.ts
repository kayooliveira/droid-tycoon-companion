import { Font } from '@react-pdf/renderer'
import notoRegular from '../../../public/fonts/NotoSans-Regular.ttf?url'
import notoBold from '../../../public/fonts/NotoSans-Bold.ttf?url'

let registered = false

/** Map react-pdf default families (Helvetica) to Noto Sans with full Latin coverage. */
export function registerPdfFonts() {
  if (registered) return
  Font.register({
    family: 'Helvetica',
    fonts: [
      { src: notoRegular, fontWeight: 400 },
      { src: notoBold, fontWeight: 700 },
    ],
  })
  Font.register({
    family: 'NotoSans',
    fonts: [
      { src: notoRegular, fontWeight: 400 },
      { src: notoBold, fontWeight: 700 },
    ],
  })
  // Browser react-pdf build defaults to CSS system font stack.
  Font.register({
    family: 'system-ui,sans-serif',
    fonts: [
      { src: notoRegular, fontWeight: 400 },
      { src: notoBold, fontWeight: 700 },
    ],
  })
  registered = true
}
