# Geleia Conquista — guia do projeto (leia antes de codar)

Jogo de estratégia em tempo real, multijogador competitivo, tema de geleias.
Família do Galcon / Jelly Go: capture todas as bases inimigas.

## Princípio número 1 (não negociável)

**O servidor é a autoridade.** Toda a lógica de jogo roda no servidor.
O cliente só faz duas coisas: (1) desenhar o estado que recebe e (2) enviar
comandos (intenções). O cliente NUNCA muda o estado direto e NUNCA decide
captura, custo, dano ou poder. Isso impede trapaça. Se você se pegar
colocando regra de jogo no `client/`, pare: ela vai para `shared/`.

## Estrutura (monorepo, npm workspaces)

- `shared/` — TypeScript puro: tipos, constantes e a simulação (`step`). Sem
  rede, sem render, sem dependências externas. É a fonte da verdade das regras.
- `server/` — Colyseus. Roda `step()` no ritmo do servidor e sincroniza estado.
- `client/` — Vite + PixiJS. Desenha o estado e captura input.

Comece SEMPRE pelo `shared/`. Ele é testável isolado: `npm test -w @geleia/shared`.

## Modelo de mundo

- Espaço lógico fixo `1000 x 600` (em `constants.ts`), escalado na tela. Mapas
  ficam independentes de resolução.
- `GameState` = { tick, nodes, projectiles, nextProjectileId, winner? }.
- Uma base (`BaseNode`) tem: time (`team`, ou `null` = neutra), `units`, `role`,
  `level`, e estados internos (`genTimer`, `frozen?`, `poison?`, `fireTimer?`).

## Papéis das bases (`role`)

- **generator** — gera +1 geleia a cada `G` segundos até `UNIT_CAP`. Subir de
  nível reduz `G` (gera mais rápido); custa `UPGRADE_COST`. Projétil de ataque
  com velocidade **padrão** (`SPEED_ATTACK`).
- **tower** — não gera. Tem alcance (`TOWER_RANGE`) e atira em **projéteis
  inimigos** dentro do raio, reduzindo a quantidade do grupo. Projétil **lento**
  (`SPEED_TOWER`).
- **scientist** — não gera; acumula geleias (via reforço) e as gasta para lançar
  poderes. Projétil **rápido** (`SPEED_SCIENTIST`).

> Decisão de design a confirmar: só geradores geram. Torres e cientistas
> recebem geleias por reforço. Ajuste em `generate()` se quiser outro modelo.

## Poderes do cientista (`PowerKind`)

- **freeze** (custo `COST_FREEZE`) — trava a base alvo: não gera nem perde,
  `units` fixos. Cria uma **dívida** igual aos units no momento do congelamento.
  Descongela quando o DONO da base manda reforço somando essa dívida.
  (O pagamento da dívida já está implementado em `resolveAttack`.)
- **poison** (custo `COST_POISON`) — a base alvo perde `POISON_RATE`/s por
  `POISON_DURATION`s, em vez de gerar.
- **convert** (custo `COST_CONVERT`) — converte **somente a base alvo
  selecionada** (NUNCA o time todo) para o time do cientista, deixando-a com a
  quantidade que o projétil carrega (`CONVERT_CARRY`).

## Projéteis (`ProjectileKind`)

- **attack** — geleias enviadas; ao chegar, reforça (mesmo time) ou ataca.
- **towerShot** — mira em outro projétil (não em base); tira `TOWER_DAMAGE`.
- **power** — mira numa base; aplica o poder ao chegar.

## Controles (cliente)

- `ESPAÇO`: seleciona todos os SEUS geradores.
- Clique simples no alvo: dispara **metade** (`ratio: 'half'`).
- Duplo clique no alvo: dispara **tudo** (`ratio: 'all'`).

## Comandos (cliente -> servidor)

`send`, `setRole`, `upgrade`, `castPower` (ver `shared/src/types.ts`).
O servidor valida o dono/custos dentro de `step()`. Nunca confie no cliente.

## Rede (resumo)

Servidor roda `step()` a `TICKS_PER_SEC`. Clientes mandam comandos e recebem
snapshots de estado; o cliente **interpola** entre snapshots para suavizar.
Para um jogo de estratégia, latência é perdoável: **não** precisa de
client-side prediction. Mantenha simples.

## Convenções de trabalho

- Uma mecânica por vez. Escreva/atualize o teste em `shared/src/step.test.ts`
  ANTES ou junto da implementação, e rode `npm test -w @geleia/shared`.
- Commit a cada pedaço verde. Git é a rede de segurança.
- Números de jogo só em `constants.ts`. Nada de número mágico espalhado.
- Identificadores em inglês; comentários/docs em português, como o resto do repo.

## Onde está o trabalho pendente

- `shared/src/step.ts`: `applyPower()` e `fireTowers()` estão como `TODO`.
- `shared/src/step.test.ts`: testes `it.todo(...)` descrevem o esperado.
- `server/` e `client/`: stubs com `TODO` por fase.

A ordem das fases e os prompts prontos estão em `docs/PROMPTS.md`.
