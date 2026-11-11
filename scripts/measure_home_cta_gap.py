#!/usr/bin/env python3
"""Item 2: Oficina Início VER PROGRESSO layout at scrollTop=0 (+ scroll-end CTA vs tab)."""
from __future__ import annotations

import json
import sys

from measure_cta_tabbar import apply_seed

JS = """() => {
  const scroll = document.querySelector('[data-testid="app-scroll"]');
  const cta = document.querySelector('.home-primary-cta');
  const btn = cta?.querySelector('.btn, a.btn, button.btn');
  const tab = document.querySelector('.tabbar');
  const sellSec = cta?.previousElementSibling;
  const sellRow = sellSec?.querySelector?.('.row');
  const creditsRow = document.querySelector('.dashboard-compact .hero + .row');
  if (!scroll || !btn || !tab || !cta) return { error: 'missing shell' };

  const measureAtTop = () => {
    scroll.scrollTop = 0;
    const br = btn.getBoundingClientRect();
    const tabTop = tab.getBoundingClientRect().top;
    const tabGap = tabTop - br.bottom;
    const prev = sellSec;
    const prevBottom = prev ? prev.getBoundingClientRect().bottom : null;
    const upperGap = prevBottom != null ? br.top - prevBottom : null;
    let rowOverlap = false;
    let sellRowGap = null;
    if (sellRow) {
      const rr = sellRow.getBoundingClientRect();
      sellRowGap = br.top - rr.bottom;
      rowOverlap =
        br.left < rr.right &&
        br.right > rr.left &&
        br.top < rr.bottom - 0.01 &&
        br.bottom > rr.top + 0.01;
    }
    const cx = (br.left + br.right) / 2;
    const cy = (br.top + br.bottom) / 2;
    const hit = document.elementFromPoint(cx, cy);
    const hitBtn =
      hit === btn ||
      btn.contains(hit) ||
      (hit != null && btn.contains(hit.closest?.('.home-primary-cta .btn') ?? null));
    const touchOk = br.width >= 44 && br.height >= 44;

    const hub = document.querySelector('[data-testid="home-hub"]');
    let pairOverlaps = 0;
    if (hub) {
      const blocks = [...hub.querySelectorAll(
        '.hero, .trio, .row, .sec, .home-primary-cta, .cm, .btn'
      )].filter((el) => {
        const cs = getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0;
      });
      for (let i = 0; i < blocks.length; i++) {
        const elA = blocks[i];
        const a = elA.getBoundingClientRect();
        if (a.bottom <= 0 || a.top >= tabTop) continue;
        for (let j = i + 1; j < blocks.length; j++) {
          const elB = blocks[j];
          if (elA.contains(elB) || elB.contains(elA)) continue;
          const b = elB.getBoundingClientRect();
          if (b.bottom <= 0 || b.top >= tabTop) continue;
          const overlap =
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom - 0.5 &&
            a.bottom > b.top + 0.5;
          if (overlap) pairOverlaps += 1;
        }
      }
    }

    return {
      btnBottom: Math.round((br.bottom + Number.EPSILON) * 100) / 100,
      tabTop: Math.round((tabTop + Number.EPSILON) * 100) / 100,
      tabGap: Math.round((tabGap + Number.EPSILON) * 100) / 100,
      upperGap: upperGap != null ? Math.round((upperGap + Number.EPSILON) * 100) / 100 : null,
      sellRowGap:
        sellRowGap != null ? Math.round((sellRowGap + Number.EPSILON) * 100) / 100 : null,
      rowOverlap,
      elementFromPointOk: hitBtn,
      touchOk,
      pairOverlaps,
      btnW: Math.round(br.width * 100) / 100,
      btnH: Math.round(br.height * 100) / 100,
    };
  };

  const top = measureAtTop();
  scroll.scrollTop = scroll.scrollHeight;
  const brEnd = btn.getBoundingClientRect();
  const tabTopEnd = tab.getBoundingClientRect().top;
  const scrollEndTabGap = tabTopEnd - brEnd.bottom;
  const scrollEndClear = brEnd.bottom <= tabTopEnd + 0.5;

  return {
    ...top,
    scrollEndTabGap: Math.round((scrollEndTabGap + Number.EPSILON) * 100) / 100,
    scrollEndClear,
  };
}"""


def oficina_ok(data: dict) -> tuple[bool, list[str]]:
    reasons: list[str] = []
    if data.get("error"):
        return False, [data["error"]]
    g = data.get("tabGap", -999)
    if not (8 <= g <= 16):
        reasons.append(f"tabGap {g} not in [8,16]")
    ug = data.get("upperGap")
    if ug is not None and ug < 8:
        reasons.append(f"upperGap {ug} < 8")
    sg = data.get("sellRowGap")
    if sg is not None and sg < 8:
        reasons.append(f"sellRowGap {sg} < 8")
    if data.get("rowOverlap"):
        reasons.append("row rect overlap")
    if not data.get("elementFromPointOk"):
        reasons.append("elementFromPoint missed button")
    if not data.get("touchOk"):
        reasons.append("touch target < 44px")
    if data.get("pairOverlaps", 0) > 0:
        reasons.append(f"home block overlaps: {data['pairOverlaps']}")
    if not data.get("scrollEndClear"):
        reasons.append(f"scroll-end not clear (gap {data.get('scrollEndTabGap')})")
    return (len(reasons) == 0, reasons)


def main() -> int:
    from playwright.sync_api import sync_playwright

    app = "http://127.0.0.1:4173"
    rows = []
    failures = 0
    fail_details: list[dict] = []

    for theme in ("oficina", "figurinhas", "cartaz"):
        for mode in ("dark", "light"):
            for width in (360, 390):
                with sync_playwright() as p:
                    b = p.chromium.launch(
                        executable_path="/usr/bin/google-chrome",
                        args=["--no-sandbox", "--disable-dev-shm-usage"],
                    )
                    ctx = b.new_context(
                        viewport={"width": width, "height": 844},
                        device_scale_factor=2,
                        is_mobile=True,
                        color_scheme="dark" if mode == "dark" else "light",
                        locale="pt-BR",
                    )
                    page = ctx.new_page()
                    page.goto(f"{app}/?onboarding=skip", wait_until="domcontentloaded")
                    apply_seed(page, theme, mode)
                    page.goto(f"{app}/?theme={theme}&mode={mode}", wait_until="load")
                    page.wait_for_selector('[data-testid="home-hub"]', timeout=15_000)
                    data = page.evaluate(JS)
                    ok = True
                    reasons: list[str] = []
                    if theme == "oficina":
                        ok, reasons = oficina_ok(data)
                        if not ok:
                            failures += 1
                            fail_details.append(
                                {"theme": theme, "mode": mode, "width": width, "reasons": reasons}
                            )
                    rows.append(
                        {
                            "theme": theme,
                            "mode": mode,
                            "width": width,
                            **{k: v for k, v in data.items() if k != "error"},
                            "ok": ok if theme == "oficina" else None,
                            "reasons": reasons if theme == "oficina" and reasons else None,
                        }
                    )
                    ctx.close()
                    b.close()

    print(json.dumps({"rows": rows, "n_fail": failures, "fail_details": fail_details}, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
