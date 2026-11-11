#!/usr/bin/env python3
"""Measure bottom CTAs vs sticky tab bar top (real app, INV10 seed). Exit 1 if any CTA overlaps tab."""
from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any

STORE_KEY = "droid-tycoon-companion-store"
MOCK_INVENTORY = [
    {"id": "m1", "droidId": "lep", "tier": "kyber", "quantity": 1},
    {"id": "m2", "droidId": "r7", "tier": "galactic", "quantity": 2},
    {"id": "m3", "droidId": "lep", "tier": "beskar", "quantity": 1},
    {"id": "m4", "droidId": "mecha-droid", "tier": "stellar", "quantity": 1},
    {"id": "m5", "droidId": "util-tec-ulti-tech", "tier": "gold", "quantity": 1},
    {"id": "m6", "droidId": "mouse", "tier": "default", "quantity": 2},
    {"id": "m7", "droidId": "kx", "tier": "beskar", "quantity": 1},
    {"id": "m8", "droidId": "orb-walker", "tier": "diamond", "quantity": 1},
    {"id": "m9", "droidId": "bb-8", "tier": "rainbow", "quantity": 1},
    {"id": "m10", "droidId": "c-3po", "tier": "scourge", "quantity": 1},
]

PAGES = [
    ("inicio", "/", "home-hub"),
    ("progresso", "/progress", "progress-page"),
    ("vender", "/sell", "sell-page"),
    ("ajustes", "/settings", "settings-page"),
    ("inventario", "/inventory", "inventory-page"),
]

JS_MEASURE = """
({ pageName, extraSelectors, keySelectors }) => {
  const scroll = document.querySelector('[data-testid="app-scroll"]');
  const tab = document.querySelector('[data-testid="mobile-floating-nav"], .tabbar');
  if (!scroll || !tab) return { error: 'missing shell' };
  if (document.documentElement.classList.contains('e2e-safe-area')) {
    return { error: 'e2e-safe-area active' };
  }
  scroll.scrollTop = scroll.scrollHeight;
  const tabR = tab.getBoundingClientRect();
  const tabTop = tabR.top;
  const overflowX = scroll.scrollWidth > scroll.clientWidth + 1;
  const docOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  const root = scroll;
  const base = [
    ...root.querySelectorAll('.btn, a.btn, button.btn, a.row--link, .row.row--link, .dtile'),
  ];
  const extra = (extraSelectors || []).flatMap((sel) => [...document.querySelectorAll(sel)]);
  const seen = new Set();
  const rows = [];
  for (const el of [...base, ...extra]) {
    if (seen.has(el)) continue;
    seen.add(el);
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
    if (r.width < 8 || r.height < 8) continue;
    if (r.bottom <= 0 || r.top >= tabTop) continue;
  const text = (el.innerText || el.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').trim().slice(0, 48);
    rows.push({
      page: pageName,
      text: text || el.className,
      bottom: Math.round((r.bottom + Number.EPSILON) * 100) / 100,
      tabTop: Math.round((tabTop + Number.EPSILON) * 100) / 100,
      gap: Math.round((tabTop - r.bottom + Number.EPSILON) * 100) / 100,
      ok: r.bottom <= tabTop + 0.5,
    });
  }
  rows.sort((a, b) => b.bottom - a.bottom);
  const keyRows = [];
  for (const sel of keySelectors || []) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    el.scrollIntoView({ block: 'end', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    const text = (el.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 48);
    keyRows.push({
      text: text || sel,
      bottom: Math.round((r.bottom + Number.EPSILON) * 100) / 100,
      tabTop: Math.round((tabTop + Number.EPSILON) * 100) / 100,
      gap: Math.round((tabTop - r.bottom + Number.EPSILON) * 100) / 100,
      ok: r.bottom <= tabTop + 0.5,
    });
  }
  scroll.scrollTop = scroll.scrollHeight;
  return {
    tabTop,
    tabH: tabR.height,
    scrollPadBottom: getComputedStyle(scroll).paddingBottom,
    overflowX: overflowX || docOverflowX,
    rows,
    keyRows,
  };
}
"""


def seed_state(theme: str, mode: str) -> dict[str, Any]:
    return {
        "schemaVersion": 3,
        "onboardingComplete": True,
        "progress": {"pathId": "path-5", "nextRebirth": 30, "completedOnPath": 29},
        "inventory": list(MOCK_INVENTORY),
        "settings": {
            "locale": "pt-BR",
            "localeSource": "user",
            "theme": mode,
            "appearanceTheme": theme,
            "appearanceMode": "system",
            "trackInventory": True,
            "animationsEnabled": False,
            "disputedPreference": {},
            "installBannerDismissed": True,
            "iosInstallHintDismissed": True,
            "progressListAllExpanded": True,
        },
        "lastSavedAt": "2026-01-01T00:00:00.000Z",
    }


def apply_seed(page: Any, theme: str, mode: str) -> None:
    state = seed_state(theme, mode)
    page.evaluate(
        """([key, state, theme, mode]) => {
          localStorage.clear();
          try { sessionStorage.clear(); } catch (e) {}
          sessionStorage.setItem('dd-e2e-skip-onboarding', '1');
          localStorage.setItem(key, JSON.stringify({ state, version: 0 }));
          localStorage.setItem('dd-theme', theme);
          localStorage.setItem('dd-mode', mode);
        }""",
        [STORE_KEY, state, theme, mode],
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-base", default=os.environ.get("DD_APP_BASE", "http://127.0.0.1:4173"))
    parser.add_argument("--chrome", default=os.environ.get("CHROME_PATH", "/usr/bin/google-chrome"))
    args = parser.parse_args()

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("playwright not installed", file=sys.stderr)
        return 2

    themes = ["oficina", "figurinhas", "cartaz"]
    modes = ["dark", "light"]
    widths = [360, 390]
    all_rows: list[dict[str, Any]] = []
    failures = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=args.chrome,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        for theme in themes:
            for mode in modes:
                for width in widths:
                    context = browser.new_context(
                        viewport={"width": width, "height": 844},
                        device_scale_factor=2,
                        is_mobile=True,
                        has_touch=True,
                        locale="pt-BR",
                        color_scheme="dark" if mode == "dark" else "light",
                        service_workers="block",
                        reduced_motion="reduce",
                    )
                    page = context.new_page()
                    page.goto(f"{args.app_base}/?onboarding=skip", wait_until="domcontentloaded", timeout=60_000)
                    apply_seed(page, theme, mode)
                    key_by_page = {
                        "inicio": ["[data-testid='home-hub'] a.btn--primary"],
                        "progresso": [
                            "[data-testid='progress-super-cta']",
                            "[data-testid='progress-complete-main']",
                        ],
                    }
                    for page_name, path, ready_id in PAGES:
                        page.goto(
                            f"{args.app_base}{path}?theme={theme}&mode={mode}",
                            wait_until="load",
                            timeout=60_000,
                        )
                        page.wait_for_selector(f'[data-testid="{ready_id}"]', timeout=15_000)
                        page.evaluate("() => document.fonts && document.fonts.ready")
                        page.wait_for_timeout(150)
                        result = page.evaluate(
                            JS_MEASURE,
                            {
                                "pageName": page_name,
                                "extraSelectors": key_by_page.get(page_name, []),
                                "keySelectors": key_by_page.get(page_name, []),
                            },
                        )
                        key_rows = result.get("keyRows") or []
                        if result.get("error"):
                            failures += 1
                            all_rows.append(
                                {
                                    "theme": theme,
                                    "mode": mode,
                                    "width": width,
                                    "page": page_name,
                                    "cta": result["error"],
                                    "bottom": None,
                                    "tabTop": None,
                                    "gap": None,
                                    "ok": False,
                                }
                            )
                            continue
                        if result.get("overflowX"):
                            failures += 1
                            all_rows.append(
                                {
                                    "theme": theme,
                                    "mode": mode,
                                    "width": width,
                                    "page": page_name,
                                    "cta": "(overflow-x)",
                                    "bottom": None,
                                    "tabTop": result["tabTop"],
                                    "gap": None,
                                    "ok": False,
                                }
                            )
                        rows = result.get("rows") or []
                        worst = rows[0] if rows else None
                        page_ok = all(r["ok"] for r in rows) if rows else True
                        key_ok = all(r["ok"] for r in key_rows) if key_rows else True
                        if worst or not result.get("overflowX"):
                            all_rows.append(
                                {
                                    "theme": theme,
                                    "mode": mode,
                                    "width": width,
                                    "page": page_name,
                                    "cta": worst["text"] if worst else "(sem CTA visível)",
                                    "bottom": worst["bottom"] if worst else None,
                                    "tabTop": worst["tabTop"] if worst else result.get("tabTop"),
                                    "gap": worst["gap"] if worst else None,
                                    "scrollPadBottom": result.get("scrollPadBottom"),
                                    "ok": page_ok and key_ok and not result.get("overflowX"),
                                }
                            )
                        for kr in key_rows:
                            all_rows.append(
                                {
                                    "theme": theme,
                                    "mode": mode,
                                    "width": width,
                                    "page": f"{page_name}:key",
                                    "cta": kr["text"],
                                    "bottom": kr["bottom"],
                                    "tabTop": kr["tabTop"],
                                    "gap": kr["gap"],
                                    "ok": kr["ok"],
                                }
                            )
                        if not page_ok or not key_ok:
                            failures += 1
                    context.close()

        browser.close()

    print(json.dumps({"n_rows": len(all_rows), "n_fail": failures, "rows": all_rows}, indent=2))
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
