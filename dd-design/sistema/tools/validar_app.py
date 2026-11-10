"""Validate live Vite app routes (preview:e2e) — 6 theme×mode combos, widths 360 and 390."""
from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass, field
from typing import Any, Callable
from urllib.parse import urlencode

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
from validar import JS_COLLECT  # type: ignore

BASE = os.environ.get('DD_APP_BASE', 'http://127.0.0.1:4173')
THEMES = ['oficina', 'figurinhas', 'cartaz']
MODES = ['dark', 'light']
WIDTHS = [360, 390]
STORE_KEY = 'droid-tycoon-companion-store'
ARTIFACT_ROOT = '/opt/cursor/artifacts/theme-shots'

MOCK_INVENTORY: list[dict[str, Any]] = [
    {'id': 'm1', 'droidId': 'r7', 'tier': 'galactic', 'quantity': 2},
    {'id': 'm2', 'droidId': 'lep', 'tier': 'beskar', 'quantity': 1},
    {'id': 'm3', 'droidId': 'cyclens', 'tier': 'galactic', 'quantity': 1},
    {'id': 'm4', 'droidId': 'kx', 'tier': 'beskar', 'quantity': 1},
    {'id': 'm5', 'droidId': 'r2-d2', 'tier': 'default', 'quantity': 1},
    {'id': 'm6', 'droidId': 'bb-8', 'tier': 'gold', 'quantity': 1},
    {'id': 'm7', 'droidId': 'c-3po', 'tier': 'diamond', 'quantity': 1},
    {'id': 'm8', 'droidId': 'chopper', 'tier': 'rainbow', 'quantity': 1},
    {'id': 'm9', 'droidId': 'bb-8', 'tier': 'rainbow', 'quantity': 1},
    {'id': 'm10', 'droidId': 'c-3po', 'tier': 'scourge', 'quantity': 1},
]

INIT_SCRIPT = "document.documentElement.classList.add('e2e-safe-area')"


@dataclass
class Capture:
    slug: str
    path: str
    query: dict[str, str] = field(default_factory=dict)
    profile: str = 'mock'
    after: Callable[[Any], None] | None = None
    skip_seed: bool = False


def seed_state(
    profile: str,
    theme: str,
    mode: str,
) -> dict[str, Any]:
    appearance_mode = mode if mode in ('light', 'dark') else 'dark'
    base = {
        'schemaVersion': 3,
        'onboardingComplete': True,
        'progress': {'pathId': 'path-5', 'nextRebirth': 30, 'completedOnPath': 29},
        'inventory': MOCK_INVENTORY,
        'settings': {
            'locale': 'pt-BR',
            'localeSource': 'user',
            'theme': appearance_mode,
            'appearanceTheme': theme,
            'appearanceMode': appearance_mode,
            'trackInventory': True,
            'animationsEnabled': False,
            'disputedPreference': {},
            'installBannerDismissed': True,
            'iosInstallHintDismissed': True,
            'progressListAllExpanded': True,
        },
        'lastSavedAt': '2026-01-01T00:00:00.000Z',
    }
    if profile == 'empty':
        base['inventory'] = []
    elif profile == 'no_track':
        base['settings']['trackInventory'] = False
    elif profile == 'super':
        base['progress'] = {'pathId': 'path-5', 'nextRebirth': 41, 'completedOnPath': 40}
    elif profile == 'dispute':
        base['progress'] = {'pathId': 'path-2', 'nextRebirth': 17, 'completedOnPath': 16}
    elif profile == 'banner':
        base['settings']['installBannerDismissed'] = False
        base['settings']['iosInstallHintDismissed'] = False
    elif profile == 'incomplete':
        base['inventory'] = []
    elif profile == 'onboarding':
        base['onboardingComplete'] = False
        base['inventory'] = []
        base['progress'] = {'pathId': 'path-1', 'nextRebirth': 1, 'completedOnPath': 0}
    return base


def apply_seed(page: Any, theme: str, mode: str, profile: str) -> None:
    state = seed_state(profile, theme, mode)
    skip_onboarding = profile != 'onboarding'
    page.evaluate(
        """([key, state, theme, mode, skipOnboarding]) => {
          localStorage.clear();
          try { sessionStorage.clear(); } catch (e) {}
          if (skipOnboarding) sessionStorage.setItem('dd-e2e-skip-onboarding', '1');
          localStorage.setItem(key, JSON.stringify({ state, version: 0 }));
          localStorage.setItem('dd-theme', theme);
          localStorage.setItem('dd-mode', mode);
        }""",
        [STORE_KEY, state, theme, mode, skip_onboarding],
    )


def url_for(capture: Capture, theme: str, mode: str) -> str:
    q: dict[str, str] = {'theme': theme, 'mode': mode, **capture.query}
    if capture.path == '/onboarding' or capture.slug.startswith('onb-'):
        q.pop('onboarding', None)
    elif capture.profile != 'onboarding':
        q['onboarding'] = 'skip'
    return f'{BASE}{capture.path}?{urlencode(q)}'


def banner_instalar(page: Any) -> None:
    page.evaluate(
        """() => {
          const e = new Event('beforeinstallprompt');
          e.prompt = () => Promise.resolve();
          e.userChoice = Promise.resolve({ outcome: 'dismissed' });
          window.dispatchEvent(e);
        }"""
    )
    page.get_by_test_id('install-banner').wait_for(state='visible', timeout=8000)


def inventario_lista(page: Any) -> None:
    page.get_by_role('button', name='Visão em lista').click()
    page.wait_for_timeout(200)


def inventario_raridade(page: Any) -> None:
    page.get_by_role('button', name='Raridade', exact=True).click()
    page.wait_for_timeout(200)


def inventario_nivel(page: Any) -> None:
    page.get_by_role('button', name='Nível', exact=True).click()
    page.wait_for_timeout(200)


def inventario_sem_resultado(page: Any) -> None:
    page.get_by_test_id('inventory-page').wait_for(state='visible', timeout=8000)
    page.get_by_test_id('inventory-page').locator('input.field[type="search"]').fill('zzzzsemresultadoxyz')
    page.wait_for_timeout(300)


def sheet_adicionar(page: Any) -> None:
    page.get_by_test_id('inventory-add-open').click()
    page.get_by_test_id('inventory-add-modal').wait_for(state='visible', timeout=8000)


def sheet_droid(page: Any) -> None:
    page.get_by_test_id('inventory-unit-card').first.click()
    page.get_by_test_id('droid-detail-sheet').wait_for(state='visible', timeout=8000)


def sheet_remover(page: Any) -> None:
    page.get_by_test_id('inventory-unit-card').first.click()
    page.get_by_test_id('droid-detail-sheet').wait_for(state='visible', timeout=8000)
    remove = page.locator('[data-testid^="inventory-remove-"]').first
    remove.click()
    page.get_by_test_id('inventory-remove-modal').wait_for(state='visible', timeout=8000)


def sheet_droid_progresso(page: Any) -> None:
    page.get_by_test_id('progress-droid-row-open').first.click()
    page.get_by_test_id('droid-detail-sheet').wait_for(state='visible', timeout=8000)


def modal_trocar_ciclo(page: Any) -> None:
    page.get_by_test_id('path-switcher-trigger').click()
    page.get_by_test_id('path-switch-modal').wait_for(state='visible', timeout=8000)
    page.get_by_test_id('path-switcher-option-path-2').click()


def modal_trocar_ciclo_reset(page: Any) -> None:
    page.get_by_test_id('path-switcher-trigger').click()
    page.get_by_test_id('path-switch-modal').wait_for(state='visible', timeout=8000)
    page.get_by_test_id('path-switcher-option-path-2').click()
    page.get_by_role('switch', name='Zerar renascimentos no novo ciclo (começar no #1)').click()


def modal_concluir(page: Any) -> None:
    page.get_by_test_id('progress-force-complete-inline').click()
    page.get_by_test_id('progress-force-complete-modal').wait_for(state='visible', timeout=8000)


def modal_desfazer(page: Any) -> None:
    page.get_by_test_id('progress-undo-inline').click()
    page.get_by_test_id('progress-undo-modal').wait_for(state='visible', timeout=8000)


def modal_super(page: Any) -> None:
    page.get_by_test_id('progress-super-cta').click()
    page.get_by_test_id('progress-super-confirm-modal').wait_for(state='visible', timeout=8000)


def modal_importar(page: Any) -> None:
    page.get_by_test_id('settings-import-trigger').click()
    page.get_by_test_id('settings-import-modal').wait_for(state='visible', timeout=8000)


def modal_apagar(page: Any) -> None:
    page.get_by_test_id('settings-reset-trigger').click()
    page.get_by_test_id('settings-reset-modal').wait_for(state='visible', timeout=8000)


def droiddex_detalhe(page: Any) -> None:
    page.get_by_test_id('droiddex-grid').locator('button').first.click()
    page.get_by_test_id('droiddex-detail-modal').wait_for(state='visible', timeout=8000)


def toast_pwa(page: Any) -> None:
    page.evaluate("window.dispatchEvent(new CustomEvent('pwa-need-refresh'))")
    page.get_by_test_id('toast-item').first.wait_for(state='visible', timeout=8000)


def fusao_busca_vazia(page: Any) -> None:
    page.locator('input.field[type="search"]').first.fill('zzzzfusao')
    page.wait_for_timeout(300)


def progresso_busca(page: Any) -> None:
    page.get_by_test_id('progress-droid-search-input').fill('LEP')
    page.wait_for_timeout(400)


def progresso_busca_vazia(page: Any) -> None:
    page.get_by_test_id('progress-droid-search-input').fill('zzzzsemresultado')
    page.wait_for_timeout(400)


def progresso_busca_nunca(page: Any) -> None:
    page.get_by_test_id('progress-droid-search-input').fill('Pit')
    page.wait_for_timeout(400)


def inventario_toast_removido(page: Any) -> None:
    page.get_by_test_id('inventory-unit-card').first.click()
    page.locator('[data-testid^="inventory-remove-"]').first.click()
    page.get_by_test_id('inventory-remove-confirm').click()
    page.get_by_test_id('toast-item').first.wait_for(state='visible', timeout=8000)


CAPTURES: list[Capture] = [
    Capture('inicio', '/'),
    Capture('progresso', '/progress'),
    Capture('progresso-sem-inventario', '/progress', profile='no_track'),
    Capture('progresso-super', '/progress', profile='super'),
    Capture('progresso-disputa', '/progress', profile='dispute'),
    Capture('progresso-busca', '/progress', query={'q': 'LEP'}, after=progresso_busca),
    Capture('progresso-busca-vazia', '/progress', after=progresso_busca_vazia),
    Capture('progresso-busca-nunca', '/progress', after=progresso_busca_nunca),
    Capture('modal-concluir-mesmo-assim', '/progress', profile='incomplete', after=modal_concluir),
    Capture('modal-desfazer-renascimento', '/progress', after=modal_desfazer),
    Capture('modal-super-renascimento', '/progress', profile='super', after=modal_super),
    Capture('modal-trocar-ciclo', '/progress', after=modal_trocar_ciclo),
    Capture('modal-trocar-ciclo-reset', '/progress', after=modal_trocar_ciclo_reset),
    Capture('sheet-droid-progresso', '/progress', after=sheet_droid_progresso),
    Capture('inventario-grade', '/inventory'),
    Capture('inventario-lista', '/inventory', after=inventario_lista),
    Capture('inventario-filtro-raridade', '/inventory', after=inventario_raridade),
    Capture('inventario-filtro-nivel', '/inventory', after=inventario_nivel),
    Capture('inventario-sem-rastreio', '/inventory', profile='no_track'),
    Capture('inventario-sem-resultado', '/inventory', after=inventario_sem_resultado),
    Capture('vazio-inventario', '/inventory', profile='empty'),
    Capture('inventario-toast-removido', '/inventory', after=inventario_toast_removido),
    Capture('sheet-adicionar-droid', '/inventory', after=sheet_adicionar),
    Capture('sheet-remover-inventario', '/inventory', after=sheet_remover),
    Capture('sheet-droid', '/inventory', after=sheet_droid),
    Capture('vender', '/sell'),
    Capture('vazio-vender', '/sell', profile='empty'),
    Capture('ciclos', '/cycles'),
    Capture('droiddex', '/droiddex'),
    Capture('droiddex-detalhe', '/droiddex', after=droiddex_detalhe),
    Capture('fusao', '/fusion'),
    Capture('fusao-vazio', '/fusion', profile='empty', after=fusao_busca_vazia),
    Capture('ajustes', '/settings'),
    Capture('ajustes-aparencia', '/settings/appearance'),
    Capture('modal-importar', '/settings', after=modal_importar),
    Capture('modal-apagar-tudo', '/settings', after=modal_apagar),
    Capture('toast-atualizacao-pwa', '/settings', after=toast_pwa),
    Capture('sobre', '/about'),
    Capture('mais', '/', query={'e2e_more': '1'}),
    Capture('nao-encontrada', '/rota-inexistente-validar'),
    Capture('onb-1-boas-vindas', '/onboarding', profile='onboarding', query={'e2e_onb_step': '0'}),
    Capture('onb-2-ciclo', '/onboarding', profile='onboarding', query={'e2e_onb_step': '1'}),
    Capture('onb-3-progresso', '/onboarding', profile='onboarding', query={'e2e_onb_step': '2'}),
    Capture('onb-4-tema', '/onboarding', profile='onboarding', query={'e2e_onb_step': '3'}),
    Capture('onb-5-pronto', '/onboarding', profile='onboarding', query={'e2e_onb_step': '4'}),
    Capture('banner-instalar', '/', profile='banner', after=banner_instalar),
]


def main() -> int:
    from playwright.sync_api import sync_playwright

    results: list[dict[str, Any]] = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for theme in THEMES:
            for mode in MODES:
                for width in WIDTHS:
                    for capture in CAPTURES:
                        page = browser.new_page(viewport={'width': width, 'height': 844})
                        page.add_init_script(INIT_SCRIPT)
                        key = f'{theme}/{mode}/{width}/{capture.slug}'
                        try:
                            page.goto(
                                f'{BASE}/?onboarding=skip',
                                wait_until='domcontentloaded',
                                timeout=120_000,
                            )
                            if capture.profile != 'onboarding':
                                apply_seed(page, theme, mode, capture.profile)
                            else:
                                apply_seed(page, theme, mode, 'onboarding')
                            page.goto(url_for(capture, theme, mode), wait_until='networkidle', timeout=120_000)
                            page.wait_for_timeout(500)
                            if capture.after is not None:
                                capture.after(page)
                                page.wait_for_timeout(350)
                            data = page.evaluate(JS_COLLECT)
                            shot = page.screenshot(full_page=True)
                            out_dir = f'{ARTIFACT_ROOT}/{theme}/{mode}/{width}'
                            os.makedirs(out_dir, exist_ok=True)
                            with open(f'{out_dir}/{capture.slug}.png', 'wb') as f:
                                f.write(shot)
                            results.append(
                                {
                                    'key': key,
                                    'theme': theme,
                                    'mode': mode,
                                    'width': width,
                                    'screen': capture.slug,
                                    'data': data,
                                }
                            )
                        except Exception as e:
                            results.append({'key': key, 'error': str(e)})
                        finally:
                            page.close()
        browser.close()

    out_path = os.path.join(ROOT, '_resultado_app.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    errs = [r for r in results if r.get('error')]
    print(f'Wrote {out_path} ({len(results)} entries, {len(errs)} errors)')
    if errs:
        for e in errs[:20]:
            print('ERR', e.get('key'), e.get('error'))
    return 1 if errs else 0


if __name__ == '__main__':
    raise SystemExit(main())
