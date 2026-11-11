# Design gate — documented mock / tooling mismatches

O comparador `scripts/comparar_1a1.py` roda contra o **app real** (preview 4173), com seed **INV10** apenas. Não há mais `html.e2e-safe-area`, `*GateView` nem fixtures de captura no código de produção.

## Layout: tab bar sticky + viewport 844

- **App:** `.app-shell .scroll` com `overflow-y: auto`; tab bar `position: sticky; bottom: 0` (`src/styles/app-shell.css`).
- **Mocks estáticos:** `.app` em coluna flex; `.scroll` com `padding-bottom: 16px` e tab bar como irmão (sem sobreposição na captura).
- **Produto:** páginas compactas (`dashboard-compact`, `progress-page-pad`, `settings-page-pad`) reservam espaço equivalente ao mock na dobra, sem gambiarras de captura.

## `sheet-adicionar-droid.html` tier chip scroll (só comparer)

- O mock HTML usa `scrollLeft = offsetLeft - containerLeft - 24`.
- O app React pode precisar de inset ligeiramente diferente; o hook `after_add` no comparador alinha chips **após** a UI real abrir (não altera o produto).

## Outros mocks documentados (não dobrar o app)

Ver entradas históricas no git deste arquivo para `modal-trocar-ciclo`, `modal-super-renascimento`, meta inconsistente em `progresso`, etc.
