import { Text, View } from '@react-pdf/renderer'
import type { PdfCopy } from '../pdfCopy'
import type { PdfSellLine } from './buildCyclePdfModel'
import { pdfStyles as s } from './styles'

function sellLineText(line: PdfSellLine, labels: PdfCopy): string {
  if (line.disposition === 'fusionHold') {
    return `${line.label} (${labels.fusionHoldShort})`
  }
  if (line.disposition === 'fusionCaution') {
    return `${line.label} (${labels.fusionCautionShort})`
  }
  return line.label
}

export function PdfSellChipLine({ line, labels }: { line: PdfSellLine; labels: PdfCopy }) {
  return <Text style={s.chipLine}>{sellLineText(line, labels)}</Text>
}

export function PdfSellCompactLines({
  lines,
  labels,
  emptyLabel,
}: {
  lines: PdfSellLine[]
  labels: PdfCopy
  emptyLabel: string
}) {
  if (lines.length === 0) {
    return <Text style={s.soft}>{emptyLabel}</Text>
  }
  return (
    <View>
      {lines.map((line) => (
        <Text key={`${line.label}-${line.disposition}`} style={s.sellCompactLine}>
          {sellLineText(line, labels)}
        </Text>
      ))}
    </View>
  )
}

export function PdfSellSummarySection({
  title,
  hint,
  blocks,
  labels,
  rebirthLabel,
}: {
  title: string
  hint: string
  blocks: Array<{ rebirth: number; sellLines: PdfSellLine[] }>
  labels: PdfCopy
  rebirthLabel: string
}) {
  if (blocks.length === 0) {
    return (
      <View style={[s.card, { marginBottom: 6 }]} wrap={false}>
        <Text style={[s.h2, { fontSize: 10, marginBottom: 4 }]}>{title}</Text>
        <Text style={s.soft}>{labels.sellSummaryEmpty}</Text>
      </View>
    )
  }

  return (
    <View style={[s.card, { marginBottom: 6 }]} wrap={false}>
      <Text style={[s.h2, { fontSize: 10, marginBottom: 2 }]}>{title}</Text>
      <Text style={[s.soft, { marginBottom: 4 }]}>{hint}</Text>
      {blocks.map((block) => (
        <View key={block.rebirth} style={{ marginBottom: 3 }} wrap={false}>
          <Text style={s.sellSummaryStep}>
            {`${rebirthLabel} ${block.rebirth}`}
          </Text>
          {block.sellLines.map((line) => (
            <PdfSellChipLine key={`${block.rebirth}-${line.label}`} line={line} labels={labels} />
          ))}
        </View>
      ))}
    </View>
  )
}
