import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import type { CyclePdfModel, PdfRebirthRow } from './buildCyclePdfModel'
import { guideFactsLine } from './buildCyclePdfModel'
import { PdfFooter } from './PdfFooter'
import { pdfStyles as s } from './styles'
import { SUPER_REBIRTH_UNLOCK_AFTER } from '../../domain/progress'

function chunkGuideRows(rows: PdfRebirthRow[]): PdfRebirthRow[][] {
  const first = 11
  const rest = 14
  if (rows.length === 0) return [[]]
  const out: PdfRebirthRow[][] = [rows.slice(0, first)]
  let i = first
  while (i < rows.length) {
    out.push(rows.slice(i, i + rest))
    i += rest
  }
  return out
}

function GuideHeader({ model }: { model: CyclePdfModel }) {
  const L = model.labels
  const title = L.guideCoverHeading.replace('{{cycle}}', model.cycleName)
  return (
    <View style={s.headerRow} wrap={false}>
      <Image src={`${model.origin}/pwa-512.png`} style={s.logo} />
      <View style={s.headerMain}>
        <Text style={s.h1}>{model.brand}</Text>
        <Text style={s.accent}>{title}</Text>
        <Text style={[s.muted, { marginTop: 4, fontSize: 8 }]}>{guideFactsLine(model)}</Text>
        <Text style={s.soft}>{model.dataVersionLine}</Text>
        <Text style={[s.muted, { marginTop: 6, fontSize: 8 }]}>{L.guideIntro}</Text>
        <Text style={[s.h2, { marginTop: 6, fontSize: 9 }]}>{L.guideHowToTitle}</Text>
        <Text style={s.bullet}>{`• ${L.guideHowTo1}`}</Text>
        <Text style={s.bullet}>{`• ${L.guideHowTo2}`}</Text>
        <Text style={s.bullet}>{`• ${L.guideHowTo3}`}</Text>
        <Text style={[s.soft, { marginTop: 4 }]}>{model.generatedLine}</Text>
      </View>
    </View>
  )
}

function TableHeader({ model }: { model: CyclePdfModel }) {
  const L = model.labels
  return (
    <View style={s.tableHead} wrap={false}>
      <Text style={{ width: 36 }}>#</Text>
      <Text style={{ width: 72 }}>{L.credits}</Text>
      <Text style={{ flex: 1 }}>{L.requirements}</Text>
    </View>
  )
}

function DroidCell({ req }: { req: PdfRebirthRow['requirements'][0] }) {
  return (
    <View style={s.droidCell}>
      <Image src={req.imageSrc} style={s.thumb} />
      <Text style={s.droidName}>{req.name}</Text>
      <View style={s.tierChip}>
        <Text style={s.tierText}>{req.tier}</Text>
      </View>
    </View>
  )
}

function GuideRebirthRow({
  row,
  model,
  zebra,
}: {
  row: PdfRebirthRow
  model: CyclePdfModel
  zebra: boolean
}) {
  const isSuper = row.rebirth === SUPER_REBIRTH_UNLOCK_AFTER
  return (
    <View
      wrap={false}
      style={[s.row, zebra && !isSuper ? s.rowZebra : undefined, isSuper ? s.rowSuper : undefined]}
    >
      <View style={s.colNum}>
        <Text style={{ fontWeight: 700 }}>{row.rebirth}</Text>
        {isSuper ? <Text style={s.colSuperLabel}>{model.labels.guideSuperRow}</Text> : null}
      </View>
      <View style={s.colCred}>
        <Text>{row.credits}</Text>
      </View>
      <View style={s.colDroids}>
        {row.requirements.map((req) => (
          <DroidCell key={`${row.rebirth}-${req.droidId}`} req={req} />
        ))}
      </View>
    </View>
  )
}

function GuideNotes({ model }: { model: CyclePdfModel }) {
  const L = model.labels
  return (
    <View style={s.notesBlock} wrap={false}>
      <Text style={s.h2}>{L.closingTitle}</Text>
      <Text style={[s.muted, { fontWeight: 700, marginTop: 6 }]}>{L.superTitle}</Text>
      <Text style={{ marginTop: 4, fontSize: 9 }}>
        {L.superBody.replace('{{n}}', String(SUPER_REBIRTH_UNLOCK_AFTER))}
      </Text>
      <Text style={[s.soft, { marginTop: 8 }]}>{L.disclaimer}</Text>
      <Text style={[s.soft, { marginTop: 4 }]}>{L.sources}</Text>
    </View>
  )
}

export function GuidePdf({ model }: { model: CyclePdfModel }) {
  const chunks = chunkGuideRows(model.rebirths)
  const L = model.labels
  return (
    <Document>
      {chunks.map((rows, idx) => (
        <Page key={idx} size="A4" style={s.page}>
          <PdfFooter brand={model.brand} cycle={model.cycleShort} />
          {idx === 0 ? <GuideHeader model={model} /> : null}
          {idx > 0 ? (
            <Text style={[s.muted, { marginBottom: 6, fontWeight: 700 }]}>{L.guideContinued}</Text>
          ) : null}
          <TableHeader model={model} />
          {rows.map((row) => (
            <GuideRebirthRow
              key={row.rebirth}
              row={row}
              model={model}
              zebra={row.rebirth % 2 === 0}
            />
          ))}
          {idx === chunks.length - 1 ? <GuideNotes model={model} /> : null}
        </Page>
      ))}
    </Document>
  )
}
