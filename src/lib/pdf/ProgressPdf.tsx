import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import type { CyclePdfModel } from './buildCyclePdfModel'
import type { progressRebirthCards } from './buildCyclePdfModel'
import { REBIRTHS_PER_PATH, SUPER_REBIRTH_UNLOCK_AFTER } from '../../domain/progress'
import { PdfFooter } from './PdfFooter'
import { pdfStyles as s } from './styles'

function ProgressHeader({ model }: { model: CyclePdfModel }) {
  const L = model.labels
  const title = L.progressCoverHeading.replace('{{cycle}}', model.cycleName)
  return (
    <View style={s.headerRow} wrap={false}>
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
    <View style={s.statGrid} wrap={false}>
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

function ProgressSummaryPage({ model }: { model: CyclePdfModel }) {
  const L = model.labels
  const p = model.progress!
  return (
    <Page size="A4" style={s.page}>
      <PdfFooter brand={model.brand} cycle={model.cycleShort} />
      <ProgressHeader model={model} />
      <StatCards model={model} />
      <View style={s.twoCol} wrap={false}>
        <View style={[s.halfCol, s.card]}>
          <Text style={[s.h2, { fontSize: 10, marginBottom: 4 }]}>{L.sellNow}</Text>
          {p.sellNowLabels.length === 0 ? (
            <Text style={s.soft}>{L.noneSellNow}</Text>
          ) : (
            p.sellNowLabels.map((line) => (
              <Text key={line} style={s.chipLine}>
                {line}
              </Text>
            ))
          )}
        </View>
        <View style={[s.halfCol, s.card]}>
          <Text style={[s.h2, { fontSize: 10, marginBottom: 4 }]}>{L.upcomingRebirths}</Text>
          {p.upcoming.map((block) => (
            <View key={block.rebirth} style={{ marginBottom: 6 }} wrap={false}>
              <Text style={{ fontWeight: 700, fontSize: 8, color: '#475569' }}>
                {`${L.rebirth} ${block.rebirth} · ${block.credits}`}
              </Text>
              {block.droids.map((line) => (
                <Text key={line} style={{ fontSize: 8, marginTop: 2 }}>
                  {line}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </View>
    </Page>
  )
}

function RemainingRow({
  rebirth,
  credits,
  droids,
  zebra,
}: {
  rebirth: number
  credits: string
  droids: string[]
  zebra: boolean
}) {
  return (
    <View wrap={false} style={[s.row, zebra ? s.rowZebra : undefined, { minHeight: 32 }]}>
      <Text style={{ width: 28, fontWeight: 700 }}>{`#${rebirth}`}</Text>
      <Text style={{ width: 64, fontSize: 8 }}>{credits}</Text>
      <View style={{ flex: 1 }}>
        {droids.map((line) => (
          <Text key={line} style={{ fontSize: 8, marginBottom: 2 }}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  )
}

function RemainingPages({ model }: { model: CyclePdfModel }) {
  const L = model.labels
  const rows = model.progress!.remaining
  if (rows.length === 0) return null
  const perPage = 16
  const chunks: typeof rows[] = []
  for (let i = 0; i < rows.length; i += perPage) {
    chunks.push(rows.slice(i, i + perPage))
  }
  return (
    <>
      {chunks.map((chunk, idx) => (
        <Page key={idx} size="A4" style={s.page}>
          <PdfFooter brand={model.brand} cycle={model.cycleShort} />
          <Text style={[s.h2, { marginBottom: 6 }]}>
            {idx === 0 ? L.remainingRebirths : L.guideContinued}
          </Text>
          {chunk.map((row) => (
            <RemainingRow
              key={row.rebirth}
              rebirth={row.rebirth}
              credits={row.credits}
              droids={row.droids}
              zebra={row.rebirth % 2 === 0}
            />
          ))}
        </Page>
      ))}
    </>
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
        <Text style={{ fontSize: 8, color: '#475569' }}>({statusLabel})</Text>
      </Text>
      <Text style={s.muted}>{`${labels.credits}: ${card.credits}`}</Text>
      {card.requirements.map((req) => (
        <View key={req.droidId} style={{ flexDirection: 'row', marginTop: 4, gap: 4 }}>
          <Image src={req.imageSrc} style={{ width: 16, height: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8 }}>{req.name}</Text>
            <Text style={s.tierText}>{req.tier}</Text>
          </View>
        </View>
      ))}
      {card.sellLabels.length > 0 ? (
        <View style={{ marginTop: 4 }}>
          <Text style={{ fontSize: 8, color: '#1d5ff5', fontWeight: 700 }}>{labels.sellAfter}</Text>
          {card.sellLabels.map((line) => (
            <Text key={line} style={{ fontSize: 7, marginTop: 1 }}>
              {line}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  )
}

function RebirthCardPages({
  model,
  progressCards,
}: {
  model: CyclePdfModel
  progressCards: ReturnType<typeof progressRebirthCards>
}) {
  const cards = progressCards
  const perPage = 10
  const chunks: (typeof cards)[] = []
  for (let i = 0; i < cards.length; i += perPage) {
    chunks.push(cards.slice(i, i + perPage))
  }
  return (
    <>
      {chunks.map((chunk, idx) => (
        <Page key={idx} size="A4" style={s.page}>
          <PdfFooter brand={model.brand} cycle={model.cycleShort} />
          <View style={s.cardGrid}>
            {chunk.map((card) => (
              <RebirthCard key={card.rebirth} card={card} labels={model.labels} />
            ))}
          </View>
        </Page>
      ))}
    </>
  )
}

function ClosingPage({ model }: { model: CyclePdfModel }) {
  const L = model.labels
  return (
    <Page size="A4" style={s.page}>
      <PdfFooter brand={model.brand} cycle={model.cycleShort} />
      <Text style={s.h2}>{L.closingTitle}</Text>
      <Text style={[s.muted, { fontWeight: 700, marginTop: 8 }]}>{L.superTitle}</Text>
      <Text style={{ marginTop: 4 }}>
        {L.superBody.replace('{{n}}', String(SUPER_REBIRTH_UNLOCK_AFTER))}
      </Text>
      <Text style={[s.soft, { marginTop: 10 }]}>{L.disclaimer}</Text>
      <Text style={[s.soft, { marginTop: 4 }]}>{L.sources}</Text>
    </Page>
  )
}

export function ProgressPdf({
  model,
  progressCards,
}: {
  model: CyclePdfModel
  progressCards: ReturnType<typeof progressRebirthCards>
}) {
  return (
    <Document>
      <ProgressSummaryPage model={model} />
      <RemainingPages model={model} />
      <RebirthCardPages model={model} progressCards={progressCards} />
      <ClosingPage model={model} />
    </Document>
  )
}
