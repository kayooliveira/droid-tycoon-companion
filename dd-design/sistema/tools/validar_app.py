"""Validate live Vite app routes (preview:e2e) — 6 theme×mode combos per screen.

Usage:
  npm run preview:e2e &
  python3 dd-design/sistema/tools/validar_app.py

Requires: playwright, pillow (same as validar.py).
"""
from __future__ import annotations

import json
import os
import sys
from urllib.parse import urlencode

# Reuse core checks from static HTML validator
ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
from validar import JS_COLLECT  # type: ignore

BASE = os.environ.get('DD_APP_BASE', 'http://127.0.0.1:4173')
THEMES = ['oficina', 'figurinhas', 'cartaz']
MODES = ['dark', 'light']

ROUTES: list[tuple[str, str]] = [
    ('inicio', '/'),
    ('progresso', '/progress'),
    ('inventario-grade', '/inventory'),
    ('vender', '/sell'),
    ('ciclos', '/cycles'),
    ('droiddex', '/droiddex'),
    ('fusao', '/fusion'),
    ('ajustes', '/settings'),
    ('ajustes-aparencia', '/settings/appearance'),
    ('sobre', '/about'),
    ('nao-encontrada', '/404'),
    ('onb-1-boas-vindas', '/onboarding'),
]

ONBOARDING = '/onboarding'


def url_for(screen: str, path: str, theme: str, mode: str) -> str:
    if path == ONBOARDING or screen.startswith('onb-'):
        q = urlencode({'theme': theme, 'mode': mode})
        return f'{BASE}{path}?{q}'
    q = urlencode({'theme': theme, 'mode': mode, 'onboarding': 'skip'})
    return f'{BASE}{path}?{q}'


def main() -> int:
    from playwright.sync_api import sync_playwright

    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for theme in THEMES:
            for mode in MODES:
                for screen, path in ROUTES:
                    page_url = url_for(screen, path, theme, mode)
                    page = browser.new_page(viewport={'width': 390, 'height': 844})
                    try:
                        page.goto(page_url, wait_until='networkidle', timeout=120_000)
                        page.wait_for_timeout(400)
                        data = page.evaluate(JS_COLLECT)
                        shot = page.screenshot(full_page=True)
                        out_dir = f'/opt/cursor/artifacts/theme-shots/{theme}/{mode}'
                        os.makedirs(out_dir, exist_ok=True)
                        with open(f'{out_dir}/{screen}.png', 'wb') as f:
                            f.write(shot)
                        key = f'{theme}/{mode}/{screen}@390'
                        results.append({'key': key, 'theme': theme, 'mode': mode, 'screen': screen, 'data': data})
                    except Exception as e:
                        results.append({'key': f'{theme}/{mode}/{screen}', 'error': str(e)})
                    finally:
                        page.close()
        browser.close()

    out_path = os.path.join(ROOT, '_resultado_app.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    errs = [r for r in results if r.get('error')]
    print(f'Wrote {out_path} ({len(results)} entries, {len(errs)} errors)')
    return 1 if errs else 0


if __name__ == '__main__':
    raise SystemExit(main())
