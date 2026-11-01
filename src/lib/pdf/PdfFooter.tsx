import { Text } from '@react-pdf/renderer'
import { pdfStyles } from './styles'

export function PdfFooter({ brand, cycle }: { brand: string; cycle: string }) {
  return (
    <Text
      style={pdfStyles.footer}
      fixed
      render={({ pageNumber, totalPages }) =>
        `${brand} · ${cycle} · p. ${pageNumber}/${totalPages}`
      }
    />
  )
}
