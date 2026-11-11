#!/usr/bin/env python3
"""Item 2: VER PROGRESSO gap vs tab top at scrollTop=0 (first viewport)."""
from __future__ import annotations

import json
import sys

from measure_cta_tabbar import apply_seed

JS = """() => {
  const scroll = document.querySelector('[data-testid="app-scroll"]');
  const btn = document.querySelector('.home-primary-cta .btn, .home-primary-cta a.btn');
  const tab = document.querySelector('.tabbar');
  if (!scroll || !btn || !tab) return { error: 'missing' };
  scroll.scrollTop = 0;
  const br = btn.getBoundingClientRect();
  const tabTop = tab.getBoundingClientRect().top;
  const gap = tabTop - br.bottom;
  return {
    btnBottom: Math.round((br.bottom + Number.EPSILON) * 100) / 100,
    tabTop: Math.round((tabTop + Number.EPSILON) * 100) / 100,
    gap: Math.round((gap + Number.EPSILON) * 100) / 100,
  };
}"""


def main() -> int:
    from playwright.sync_api import sync_playwright

    app = "http://127.0.0.1:4173"
    rows = []
    failures = 0
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
                    if theme == "oficina":
                        ok = 12 <= data.get("gap", -999) <= 16.25
                        if not ok:
                            failures += 1
                    rows.append({"theme": theme, "mode": mode, "width": width, **data, "ok": ok})
                    ctx.close()
                    b.close()

    print(json.dumps({"rows": rows, "n_fail": failures}, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
