import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import { DroidThumb } from './DroidThumb'
import type { CyclePdfModel } from './buildCyclePdfModel'
import type { progressRebirthCards } from './buildCyclePdfModel'
import { REBIRTHS_PER_PATH, SUPER_REBIRTH_UNLOCK_AFTER } from '../../domain/progress'
import { PdfFooter } from './PdfFooter'
import { PdfSellChipLine } from './PdfSellSection'
import { pdfTheme as c } from '../pdfTheme'
import { pdfStyles as s } from './styles'

function ProgressHeader({ model }: { model: CyclePdfModel }) {
  const L = model.labels
  const title = L.progressCoverHeading.replace('{{cycle}}', model.cycleName)
  return (
    <View style={s.headerRow}>
      <Image src={`${model.origin}/pwa-512.png`} style={s.logo} />
      <View style={s.headerMain}>
        <Text style={s.h1}>{model.brand}</Text>
        <Text style={s.accent}>{title}</Text>
        <Text style={[s.soft, { marginTop: 4 }]}>{model.generatedLine}</Text>
      </View>
    </View>
  )
}

function StatCards({ model }: { model: CyclePdfModel }) {
  const L = model.labels
  const p = model.progress!
  return (
    <View style={s.statGrid}>
      <View style={s.statBox}>
        <Text style={s.statLabel}>{L.rebirthsDone}</Text>
        <Text style={s.statValue}>{`${p.completedOnPath}/${REBIRTHS_PER_PATH}`}</Text>
      </View>
      <View style={s.statBox}>
        <Text style={s.statLabel}>{L.pathPct}</Text>
        <Text style={s.statValue}>{`${p.pct.toFixed(0)}%`}</Text>
      </View>
      <View style={s.statBox}>
        <Text style={s.statLabel}>{L.nextRebirth}</Text>
        <Text style={s.statValue}>{`#${Math.min(p.nextRebirth, REBIRTHS_PER_PATH)}`}</Text>
      </View>
      <View style={s.statBox}>
        <Text style={s.statLabel}>{L.inventory}</Text>
        <Text style={s.statValue}>{String(p.invCount)}</Text>
      </View>
    </View>
  )
}

function ProgressNotes({ model }: { model: CyclePdfModel }) {
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

function RebirthCard({
  card,
  labels,
}: {
  card: ReturnType<typeof progressRebirthCards>[0]
  labels: CyclePdfModel['labels']
}) {
  const statusLabel =
    card.status === 'done' ? labels.done : card.status === 'next' ? labels.next : labels.pending
  return (
    <View wrap={false} style={s.rebirthCard}>
      <Text style={{ fontWeight: 700, fontSize: 10 }}>
        {`${labels.rebirth} ${card.rebirth}`}{' '}
        <Text style={{ fontSize: 8, color: c.textMuted }}>({statusLabel})</Text>
      </Text>
      <Text style={s.muted}>{`${labels.credits}: ${card.credits}`}</Text>
      {card.requirements.map((req) => (
        <View key={req.droidId} style={{ flexDirection: 'row', marginTop: 3 }}>
          <DroidThumb req={req} style={{ width: 14, height: 14, marginRight: 4 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8 }}>{req.name}</Text>
            <Text style={s.tierText}>{req.tier}</Text>
          </View>
        </View>
      ))}
      {card.sellLines.length > 0 ? (
        <View style={{ marginTop: 3 }}>
          <Text style={{ fontSize: 8, color: c.accent, fontWeight: 700 }}>{labels.sellAfter}</Text>
          {card.sellLines.map((line) => (
            <PdfSellChipLine key={`${line.label}-${line.disposition}`} line={line} labels={labels} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

export function ProgressPdf({
  model,
  progressCards,
}: {
  model: CyclePdfModel
  progressCards: ReturnType<typeof progressRebirthCards>
}) {
  const L = model.labels
  const p = model.progress!
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfFooter brand={model.brand} cycle={model.cycleShort} />
        <View wrap={false}>
          <ProgressHeader model={model} />
          <StatCards model={model} />
          <View style={s.twoCol}>
            <View style={[s.halfCol, s.card]}>
              <Text style={[s.h2, { fontSize: 10, marginBottom: 4 }]}>{L.sellNow}</Text>
              {p.sellNowLabels.length === 0 && p.keepUpgradeLabels.length === 0 ? (
                <Text style={s.soft}>{L.noneSellNow}</Text>
              ) : (
                <>
                  {p.sellNowLabels.map((line) => (
                    <Text key={line} style={s.chipLine}>
                      {line}
                    </Text>
                  ))}
                  {p.keepUpgradeLabels.map((line) => (
                    <Text key={line} style={[s.chipLine, { color: c.textMuted }]}>
                      {line}
                    </Text>
                  ))}
                </>
              )}
            </View>
            <View style={[s.halfCol, s.card]}>
              <Text style={[s.h2, { fontSize: 10, marginBottom: 4 }]}>{L.upcomingRebirths}</Text>
              {p.upcoming.map((block) => (
                <View key={block.rebirth} style={{ marginBottom: 4 }} wrap={false}>
                  <Text style={{ fontWeight: 700, fontSize: 8, color: c.textMuted }}>
                    {`${L.rebirth} ${block.rebirth} · ${block.credits}`}
                  </Text>
                  {block.droids.map((line) => (
                    <Text key={line} style={{ fontSize: 8, marginTop: 1 }}>
                      {line}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
        <Text style={[s.h2, { fontSize: 11, marginTop: 8, marginBottom: 4 }]}>{L.rebirth}</Text>
        <View style={s.cardGrid}>
          {progressCards.map((card) => (
            <RebirthCard key={card.rebirth} card={card} labels={L} />
          ))}
        </View>
        <ProgressNotes model={model} />
      </Page>
    </Document>
  )
}
