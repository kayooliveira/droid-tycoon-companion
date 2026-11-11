#!/usr/bin/env python3
"""Capture polish evidence PNGs (INV10 seed, 360/390 × 6 combos)."""
from __future__ import annotations

import os
from pathlib import Path

from measure_cta_tabbar import STORE_KEY, apply_seed, seed_state

OUT = Path(os.environ.get("POLISH_ARTIFACTS", "/opt/cursor/artifacts/polish-1a1"))
APP = os.environ.get("DD_APP_BASE", "http://127.0.0.1:4173")

SHOTS = [
    ("p1-tab-oficina", "/", 360),
    ("p1-inicio-oficina", "/", 390),
    ("p1-chips-figurinhas", "/inventory", 390),
    ("p1-sheet-figurinhas", "/inventory", 390),
    ("p1-ciclos-cartaz", "/cycles", 390),
    ("p1-vender-oficina", "/sell", 360),
]


def main() -> None:
    from playwright.sync_api import sync_playwright

    OUT.mkdir(parents=True, exist_ok=True)
    themes = ["oficina", "figurinhas", "cartaz"]
    modes = ["dark", "light"]

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=os.environ.get("CHROME_PATH", "/usr/bin/google-chrome"),
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        for theme in themes:
            for mode in modes:
                for slug, path, width in SHOTS:
                    if slug == "p1-chips-figurinhas" and theme != "figurinhas":
                        continue
                    if slug == "p1-sheet-figurinhas" and theme != "figurinhas":
                        continue
                    if slug == "p1-ciclos-cartaz" and theme != "cartaz":
                        continue
                    if slug.startswith("p1-tab") or slug.startswith("p1-inicio"):
                        if theme != "oficina":
                            continue
                    if slug == "p1-vender-oficina" and theme != "oficina":
                        continue
                    ctx = browser.new_context(
                        viewport={"width": width, "height": 844},
                        device_scale_factor=2,
                        is_mobile=True,
                        locale="pt-BR",
                        color_scheme="dark" if mode == "dark" else "light",
                    )
                    page = ctx.new_page()
                    page.goto(f"{APP}/?onboarding=skip", wait_until="domcontentloaded")
                    apply_seed(page, theme, mode)
                    url = f"{APP}{path}?theme={theme}&mode={mode}"
                    page.goto(url, wait_until="load")
                    if slug == "p1-sheet-figurinhas":
                        page.get_by_test_id("inventory-add-open").click()
                        page.wait_for_selector('[data-testid="inventory-add-modal"]', timeout=10_000)
                    if slug == "p1-ciclos-cartaz":
                        page.get_by_test_id("cycles-rebirth-1").click()
                    page.wait_for_timeout(200)
                    out = OUT / f"{slug}-{theme}-{mode}-{width}.png"
                    page.screenshot(path=str(out), full_page=slug != "p1-tab-oficina")
                    ctx.close()
        browser.close()
    print(f"Wrote screenshots under {OUT}")


if __name__ == "__main__":
    main()
