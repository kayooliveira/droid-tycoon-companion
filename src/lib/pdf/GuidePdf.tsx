import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import type { CyclePdfModel, PdfRebirthRow } from './buildCyclePdfModel'
import { guideFactsLine } from './buildCyclePdfModel'
import { DroidThumb } from './DroidThumb'
import { PdfFooter } from './PdfFooter'
import { PdfSellCompactLines, PdfSellSummarySection } from './PdfSellSection'
import { pdfStyles as s } from './styles'
import { SUPER_REBIRTH_UNLOCK_AFTER } from '../../domain/progress'

function GuideHeader({ model }: { model: CyclePdfModel }) {
  const L = model.labels
  const title = L.guideCoverHeading.replace('{{cycle}}', model.cycleName)
  return (
    <View style={s.guideFirstPagePullUp}>
      <View style={s.headerRow}>
        <Image src={`${model.origin}/pwa-512.png`} style={s.logo} />
        <View style={s.headerMain}>
          <Text style={s.h1}>{model.brand}</Text>
          <Text style={s.accent}>{title}</Text>
          <Text style={[s.muted, { marginTop: 3, fontSize: 8 }]}>{guideFactsLine(model)}</Text>
          <Text style={s.soft}>{model.dataVersionLine}</Text>
          <Text style={[s.muted, { marginTop: 4, fontSize: 8 }]}>{L.guideIntro}</Text>
          <Text style={[s.h2, { marginTop: 4, fontSize: 9 }]}>{L.guideHowToTitle}</Text>
          <Text style={s.bullet}>{`• ${L.guideHowTo1}`}</Text>
          <Text style={s.bullet}>{`• ${L.guideHowTo2}`}</Text>
          <Text style={s.bullet}>{`• ${L.guideHowTo3}`}</Text>
          <Text style={s.bullet}>{`• ${L.guideHowTo4}`}</Text>
          <Text style={[s.soft, { marginTop: 2 }]}>{model.generatedLine}</Text>
        </View>
      </View>
    </View>
  )
}

function TableHeader({ model }: { model: CyclePdfModel }) {
  const L = model.labels
  return (
    <View style={s.tableHead}>
      <Text style={{ width: 32 }}>#</Text>
      <Text style={{ width: 68 }}>{L.credits}</Text>
      <Text style={{ flex: 1 }}>{L.requirements}</Text>
      <Text style={{ width: 92 }}>{L.canSell}</Text>
    </View>
  )
}

/** Repeats column headers on pages 2+ inside the reserved top padding band. */
function GuideFixedTableHead({ model }: { model: CyclePdfModel }) {
  return (
    <View
      fixed
      style={s.guideFixedTableHead}
      render={({ pageNumber }) => (pageNumber > 1 ? <TableHeader model={model} /> : null)}
    />
  )
}

function DroidCell({ req }: { req: PdfRebirthRow['requirements'][0] }) {
  return (
    <View style={s.droidCell}>
      <DroidThumb req={req} style={s.thumb} />
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
  const L = model.labels
  const isSuper = row.rebirth === SUPER_REBIRTH_UNLOCK_AFTER
  return (
    <View
      wrap={false}
      style={[s.row, zebra && !isSuper ? s.rowZebra : undefined, isSuper ? s.rowSuper : undefined]}
    >
      <View style={s.colNum}>
        <Text style={{ fontWeight: 700, fontSize: 9 }}>{row.rebirth}</Text>
        {row.unconfirmed ? <Text style={s.unconfirmedBadge}>{L.unconfirmed}</Text> : null}
        {isSuper ? <Text style={s.colSuperLabel}>{L.guideSuperRow}</Text> : null}
      </View>
      <View style={s.colCred}>
        <Text style={{ fontSize: 8 }}>{row.credits}</Text>
      </View>
      <View style={s.colReq}>
        {row.requirements.map((req) => (
          <DroidCell key={`${row.rebirth}-${req.droidId}`} req={req} />
        ))}
      </View>
      <View style={s.colSell}>
        <PdfSellCompactLines lines={row.sellLines} labels={L} emptyLabel={L.sellStepNone} />
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
  const L = model.labels
  return (
    <Document>
      <Page size="A4" style={s.guidePage}>
        <PdfFooter brand={model.brand} cycle={model.cycleShort} />
        <GuideFixedTableHead model={model} />
        <View wrap={false}>
          <GuideHeader model={model} />
          <PdfSellSummarySection
            title={L.sellSummaryTitle}
            hint={L.sellSummaryHint}
            blocks={model.guideSellSummary ?? []}
            labels={L}
            rebirthLabel={L.rebirth}
          />
          <TableHeader model={model} />
        </View>
        {model.rebirths.map((row) => (
          <GuideRebirthRow
            key={row.rebirth}
            row={row}
            model={model}
            zebra={row.rebirth % 2 === 0}
          />
        ))}
        <GuideNotes model={model} />
      </Page>
    </Document>
  )
}
