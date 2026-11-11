# Auditoria de cobertura: DroidDeck (repo `kayooliveira/droid-tycoon-companion`, branch `current`)

Fonte: leitura somente leitura de `src/` via cursor-github (478 arquivos na árvore; 19 páginas e componentes de UI lidos por inteiro, cópias em `auditoria/repo/`).
Legenda de estado: **existia** (mock da fase 2 já cobria), **refeito** (existia, mas não batia com o código; reescrito), **novo** (não existia), **fora** (não desenhado, com motivo).

## 1. Rotas (`App.tsx`)

| Rota | Arquivo | Mock | Estado |
|---|---|---|---|
| `/onboarding` (e `?rerun=1`) | `pages/OnboardingPage.tsx` | `onb-1-boas-vindas`, `onb-2-ciclo`, `onb-3-progresso`, `onb-4-tema` (novo pedido), `onb-5-pronto` | existia; `onb-5-pronto` refeito (faltava o switch "Registrar inventário") |
| `/` | `pages/DashboardPage.tsx` | `inicio`, `skeleton-inicio` | refeito (faltavam Créditos, Pode vender agora, Ver progresso, Resumo do Ciclo) |
| `/progress` | `pages/ProgressPage.tsx` | `progresso`, `progresso-sem-inventario`, `progresso-super`, `progresso-disputa`, `progresso-busca*` | refeito (o mock antigo tinha abas Foco/Lista que o código não usa; a página é uma rolagem única) |
| `/cycles` | `pages/CyclesPage.tsx` | `ciclos` | refeito (seletor de Ciclo, PDF, acordeão de renascimentos com créditos e confiança, seção Super) |
| `/inventory` | `pages/InventoryPage.tsx` | `inventario-grade`, `inventario-lista`, `inventario-filtro-raridade`, `inventario-filtro-nivel` | refeito (filtros reais: Todos/Raridade/Nível + chips + Uso no ciclo + alternar visão) |
| `/sell` | `pages/SellCenterPage.tsx` | `vender`, `vazio-vender` | refeito (não há sub-abas: são seções Pode vender agora, Usar no próximo, Guardar, Upar, Vender) |
| `/droiddex` | `pages/DroiddexPage.tsx` | `droiddex`, `droiddex-detalhe` | refeito + novo (faltava o modal de detalhe) |
| `/fusion` | `pages/FusionLabPage.tsx` | `fusao`, `fusao-vazio` | refeito + novo (busca de receitas, selo de confiança, estados vazios) |
| `/settings` | `pages/SettingsPage.tsx` | `ajustes`, `ajustes-aparencia`, `ajustes-dados-velhos` | refeito (faltavam Idioma, Ciclo, Dados do jogo, Compartilhar, Sobre) |
| `/about` | `pages/AboutPage.tsx` | `sobre` | novo |
| `/404` e `*` | `pages/NotFoundPage.tsx` | `nao-encontrada` | novo |

Navegação: a tab bar mobile tem 5 itens (Início, Progresso, Inventário, Ciclos, Mais). **"Mais" não é página**: abre um Modal ancorado acima da tab bar com Vender, Droiddex, Fusão, Sobre e Ajustes (`AppShell.tsx`, `MobileFloatingNav.tsx`). Mock: `mais` (refeito como menu). A rota `/settings` tem título "Mais" no código; no design o título é "Ajustes" (sugestão).
Sidebar desktop (`md:` em diante, 9 itens): **fora**, ver seção 7.

## 2. Sub-abas e seções

O código não tem sub-abas em Vender, Progresso ou Mais. O que existe:

| Local | O que é | Mock |
|---|---|---|
| Início | CycleProgressStrip, Próximo Renascimento, Créditos, Pode vender agora, Resumo do Ciclo | `inicio` |
| Progresso | resumo + seletor de Ciclo, busca de droid, painel do renascimento atual, pilha de ações, lista de Renascimentos (Expandir/Recolher todos), PDF do progresso | `progresso` |
| Vender | seletor de Ciclo + 5 seções (Pode vender agora, Usar no próximo, Guardar, Upar, Vender) | `vender` |
| Ciclos | seletor segmentado de 6 Ciclos, PDF do Ciclo, acordeão por renascimento, seção Super Renascimento | `ciclos` |
| Inventário | busca, segmentado Todos/Raridade/Nível, alternar grade/lista, chips ou segmentado Uso no ciclo | `inventario-*` |
| Droiddex | busca, classes (Todas, Worker, Astromech, Battle, Protocol), grade | `droiddex` |
| Fusão | Regras gerais, Útil pro próximo renascimento, Receitas com busca | `fusao` |
| Ajustes | Aparência, Idioma, Progresso, Dados, Compartilhar, Sobre, Zona de risco | `ajustes` |

## 3. Modais, sheets e popovers

| Item | Tipo no código | Arquivo | Mock | Estado |
|---|---|---|---|---|
| Mais | Modal ancorado acima da nav | `AppShell.tsx` | `mais` | refeito |
| Trocar de ciclo (cartões de Ciclo + switch de reset) | Modal | `PathProgressSwitcher.tsx` | `modal-trocar-ciclo`, `modal-trocar-ciclo-reset` | refeito |
| Concluir mesmo assim | Modal | `ProgressPage.tsx` | `modal-concluir-mesmo-assim` | novo |
| Desfazer renascimento | Modal | `ProgressPage.tsx` | `modal-desfazer-renascimento` | novo |
| Super Renascimento? | Modal | `ProgressPage.tsx` | `modal-super-renascimento` | refeito (texto real com nome dos Ciclos) |
| Ficha do droid (a partir de Progresso, Inventário) | Sheet | `droid/DroidDetailSheet.tsx` | `sheet-droid`, `sheet-droid-progresso` | refeito (campos reais: Nível, Raridade, Quantidade, Vender) |
| Adicionar droid | Sheet | `InventoryPage.tsx` | `sheet-adicionar-droid` | novo |
| Remover do inventário? | Sheet (não modal) | `InventoryPage.tsx` | `sheet-remover-inventario` | refeito (o mock antigo era modal) |
| Importar progresso? | Modal | `SettingsPage.tsx` | `modal-importar` | novo |
| Apagar tudo? | Modal | `SettingsPage.tsx` | `modal-apagar-tudo` | novo |
| Detalhe do droid no Droiddex | Modal | `DroiddexPage.tsx` | `droiddex-detalhe` | novo |
| Seletor de arquivo JSON (importar) | input file do sistema | `SettingsPage.tsx` | n/a | fora (UI do sistema operacional) |
| Menu de compartilhar do sistema (`navigator.share`) | UI do sistema | `SettingsPage.tsx` | n/a | fora (UI do sistema operacional) |

Observação: busca do Progresso **não é modal**: é um campo na própria página com resultados embaixo (`progresso-busca*`).

## 4. Toasts e banners

Toast (`ToastProvider.tsx`): variantes success, info, warning, error, neutral; mensagem + detalhe opcional; ação opcional; fixo (sticky); substituição por chave; pilha. No app fica no topo; **no design fica logo acima da tab bar e nunca cobre botão** (decisão do Kayo).

| Mensagem (pt-BR do app) | Variante | Origem | Mock |
|---|---|---|---|
| Renascimento adicionado/removido do droid + "Renascimento #N" + Desfazer | success/info | `useProgressInventoryToast.ts` | `toast-desfazer` |
| Renascimento #N concluído (Desfazer) / desfeito | success | `ProgressPage.tsx` | `toasts-variantes` |
| Agora você tá no Ciclo N | info | `PathProgressSwitcher.tsx`, `ProgressPage.tsx` | `toasts-variantes` |
| X entrou/saiu do inventário | success/info | `InventoryPage.tsx` | `inventario-toast-removido` |
| Progresso importado | success | `SettingsPage.tsx` | `toasts-variantes` |
| Arquivo inválido + "Confira o JSON e tente novamente." | error | `SettingsPage.tsx` | `toast-importar-erro` |
| Dados apagados neste aparelho | warning | `SettingsPage.tsx` | `toasts-variantes` (variante nova `toast--warn`) |
| Link copiado; Card compartilhado/salvo; Card falhou | success/error | `SettingsPage.tsx` | `toast-card-erro`, `toasts-variantes` |
| PDF do ciclo/progresso pronto; falha no export | success/error | `CycleGuidePdfExport.tsx`, `ProgressPdfExport.tsx` | `ciclos-toast-pdf`, `toasts-variantes` |
| Nova versão do app disponível + Atualizar (fixo) | info sticky | `App.tsx` (PwaRefreshListener) | `toast-atualizacao-pwa` |
| DroidDeck atualizado | success | `App.tsx` | `toasts-variantes` |
| Banner Instalar no celular (Instalar / Agora não) | banner | `InstallBanner.tsx` | `banner-instalar` |
| Banner instalar no iOS (instrução de Compartilhar) | banner | `InstallBanner.tsx` | `banner-instalar-ios` |

## 5. Estados vazio, erro, offline e carregando

| Estado | Onde no código | Mock | Estado |
|---|---|---|---|
| Inventário vazio / filtro sem resultado | `InventoryPage.tsx` | `vazio-inventario`, `inventario-sem-resultado` | existia + novo |
| Inventário desligado (Registrar inventário off) | `InventoryPage.tsx` | `inventario-sem-rastreio` | novo |
| Progresso sem registrar inventário | `ProgressPage.tsx` | `progresso-sem-inventario` | novo |
| Busca no Progresso: sem resultado; droid nunca necessário | `ProgressDroidSearch.tsx` | `progresso-busca-vazia`, `progresso-busca-nunca` | novo |
| Ciclo completo (Super Renascimento) | `ProgressPage.tsx` | `progresso-super` | refeito |
| Requisito disputado | `ProgressPage.tsx` (DisputePanel) | `progresso-disputa` | novo |
| Vender vazio (sem inventário) | `SellCenterPage.tsx` | `vazio-vender` | existia |
| Fusão: nada para o próximo / busca sem receita | `FusionLabPage.tsx` | `fusao-vazio` | novo |
| Dados do jogo velhos | `SettingsPage.tsx`, `AboutPage.tsx` | `ajustes-dados-velhos` | novo |
| Carregando: Início, Inventário, rota preguiçosa (TabScreenSkeleton) | `TabScreenSkeleton.tsx` | `skeleton-inicio`, `skeleton-inventario`, `skeleton-pagina` | existia + novo |
| 404 | `NotFoundPage.tsx` | `nao-encontrada` | novo |
| Erro de tela inteira / offline | não existe no código (sem ErrorBoundary e sem aviso offline; o service worker só cacheia) | n/a | fora (nada a desenhar; sugestão no `sistema.md`) |

## 6. Ajustes: cada seção

| Seção | Conteúdo no código | No mock `ajustes` |
|---|---|---|
| Aparência | Tema Escuro/Claro/Auto, Animações, Registrar inventário | linha "Visual e modo" (leva a `ajustes-aparencia`, que tem os 3 visuais e o modo) + 2 switches |
| Idioma | PT / EN | segmentado Português / English |
| Progresso | seletor de Ciclo, Progresso do ciclo, slider Renascimentos concluídos | idem |
| Dados | Dados do jogo (versão, atualizado ou velho), Exportar, Importar (+ modal), rodapé de atualização | idem |
| Compartilhar | Compartilhar app, WhatsApp, Card de progresso, rodapé "Nada é enviado ao servidor." | idem |
| Sobre | Refazer setup, Sobre, feedback no WhatsApp | idem |
| Zona de risco | Apagar tudo (+ modal) | idem |

## 7. Ficou de fora

* **Layout desktop** (sidebar de 256px em `md:`): o produto é PWA mobile e a validação pedida é 390 e 360. Os tokens servem, mas não há mock. Se for implementar, a sidebar usa os mesmos itens e estados da tab bar.
* **Código sem uso nas páginas**: `ShareMenu.tsx`, `DownloadCycleMenu.tsx`, `ShareExportCard.tsx`, `PageSkeleton.tsx`, `HelpHint.tsx` não são importados pelas páginas lidas (a busca de código do GitHub veio vazia, então é uma leitura manual, não uma garantia). As ações equivalentes (compartilhar, PDF) estão em Ajustes, Progresso e Ciclos.
* **UI do sistema** (seletor de arquivo, menu nativo de compartilhar, prompt de instalação do navegador).
* **Offline e erro global**: não existem no app.
