import fs from 'node:fs'
import path from 'node:path'

const root = path.join(process.cwd(), 'src')

const replacements = [
  ['dc-section-header-row', 'sec-h'],
  ['dc-section-header-action', 'btn btn--ghost btn--sm'],
  ['dc-section-header', 'sec-h'],
  ['dc-screen-stack-item', 'stack'],
  ['dc-screen-stack', 'stack'],
  ['dc-screen-summary', 'panel'],
  ['dc-scroll-spacer', ''],
  ['dc-scroll-view', 'stack'],
  ['dc-row-droid--split', 'item'],
  ['dc-row-sub--badge', ''],
  ['dc-row-sub-meta', 't-meta'],
  ['dc-row-sub', 'hint'],
  ['dc-row-trail--acts', 'row2'],
  ['dc-row-trail', 'row-val'],
  ['dc-row-chevron', 'row row--link'],
  ['dc-row-hit', 'item-open'],
  ['dc-row-droid', 'item'],
  ['dc-row-main', 'row-main'],
  ['dc-droid-name', 'dname'],
  ['dc-row-label', 'row-title'],
  ['dc-row', 'row'],
  ['dc-section', 'sec'],
  ['dc-card-list', 'stack'],
  ['dc-action-stack', 'stack'],
  ['dc-search-wrap', 'field-wrap'],
  ['dc-inv-pin', 'inv-pin'],
  ['dc-inv-toolbar', 'grid2'],
  ['dc-view-toggle', 'seg'],
  ['dc-view-btn-on', ''],
  ['dc-view-btn', ''],
  ['btn-filled btn-wide', 'btn btn--primary'],
  ['btn-filled', 'btn btn--primary'],
  ['rebirth-hero', 'hero'],
  ['rebirth-kicker', 'hr-kicker'],
  ['hero-droid-row', 'trio'],
  ['hero-droid', 'req-col'],
  ['hero-tier', 't-meta'],
  ['status-mark status-ok', 'tag tag--ok'],
  ['status-mark status-miss', 'tag tag--bad'],
  ['status-ok', 'tag tag--ok'],
  ['status-miss', 'tag tag--bad'],
]

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p)
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let text = fs.readFileSync(p, 'utf8')
      let orig = text
      for (const [from, to] of replacements) {
        if (!from) continue
        text = text.split(from).join(to)
      }
      text = text.replace(/\s{2,}/g, (m) => (m.includes('\n') ? m : ' '))
      text = text.replace(/className=""\s*/g, '')
      text = text.replace(/className=\{cn\(\s*''\s*,/g, 'className={cn(')
      if (text !== orig) fs.writeFileSync(p, text)
    }
  }
}

walk(root)
console.log('dc class migration pass done')
