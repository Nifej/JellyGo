# Prompts para o Claude Code (em ordem)

Cole um por vez. Espere terminar, rode os testes/jogue, faça commit, e só então
vá para o próximo. Não cole vários de uma vez. Se algo sair torto, peça pra
corrigir antes de avançar.

Antes de tudo, na raiz do projeto:

```
npm install
npm test -w @geleia/shared   # 7 passam, 5 ficam como "todo"
```

---

## Fase 1 — completar a simulação (em `shared/`, sem rede e sem gráficos)

**P1.1 — poder freeze**
> Em `shared/src/step.ts`, implemente o caso `freeze` da função `applyPower`,
> seguindo o comentário e o `CLAUDE.md`. Depois, em `step.test.ts`, troque o
> `it.todo` "freeze trava a base alvo..." por um teste real: um cientista com
> geleias suficientes lança freeze numa base inimiga; verifique que ela fica
> com `frozen` definido, dívida igual aos units no momento, e que ela para de
> gerar. Rode `npm test -w @geleia/shared` e deixe verde.

**P1.2 — poder poison**
> Implemente o caso `poison` de `applyPower` (aplica `PoisonState` na base alvo)
> e escreva o teste real correspondente (substitua o `it.todo`). O efeito de
> drenar já existe em `applyPoison`; aqui é só aplicar o estado. Deixe verde.

**P1.3 — poder convert**
> Implemente o caso `convert` de `applyPower`: converte SOMENTE a base alvo
> selecionada para o time do cientista, com `units = CONVERT_CARRY`, virando
> gerador nível 1 e limpando `frozen`/`poison`. Não pode afetar outras bases.
> Escreva o teste real (incluindo um caso que prova que uma segunda base
> inimiga NÃO é afetada). Deixe verde.

**P1.4 — torres**
> Implemente `fireTowers` em `step.ts`: cada base `role === 'tower'` usa um
> `fireTimer` (respeitando `TOWER_FIRE_INTERVAL`), procura o projétil inimigo
> mais próximo dentro de `TOWER_RANGE` e cria um `towerShot` (speed
> `SPEED_TOWER`) com `targetProjectileId`. Adicione a lógica de chegada do
> `towerShot` (perseguir um projétil que se move) que reduz `units` do alvo em
> `TOWER_DAMAGE` e o remove se zerar. Escreva os dois testes reais. Deixe verde.

**P1.5 — mapas de exemplo + IA simples**
> Crie `shared/src/maps.ts` com 3 mapas (lista de bases) e uma IA simples
> reutilizável: a cada ~2s, para o time da IA, escolhe a base mais forte e
> manda metade para o alvo inimigo/neutro mais barato e mais perto que consegue
> vencer; senão expande para o neutro mais próximo. Exponha em `index.ts`.

Commit no fim de cada P. Ao terminar a Fase 1, a simulação está completa.

---

## Fase 2 — jogo local jogável (em `client/`, ainda sem servidor)

**P2.1 — render**
> Em `client/src/render.ts`, implemente `mountRenderer` com PixiJS: mantenha o
> espaço lógico 1000x600 escalado para o canvas; desenhe bases coloridas por
> time com o número de geleias e um indicador do papel (gerador/torre/
> cientista), e desenhe os projéteis (attack/towerShot/power) com cores e
> tamanhos distintos. Capriche na estética "geleia" (blobs com brilho).
> Implemente `toWorld` de verdade.

**P2.2 — input + loop local**
> Em `client/src/input.ts` implemente os controles do `CLAUDE.md` (ESPAÇO =
> todos os geradores; clique = metade; duplo clique = tudo) emitindo `Command`.
> Em `main.ts`, rode um `GameState` local com `step()` num `requestAnimationFrame`,
> aplicando os comandos do jogador e da IA da Fase 1. Agora dá pra jogar offline.

**P2.3 — construir papéis e poderes na UI**
> Adicione interações para `setRole`, `upgrade` e `castPower` (escolha um
> esquema de teclas/menu e documente no CLAUDE.md). Mostre feedback visual:
> base congelada azulada, envenenada gotejando, conversão com um flash.

Jogue bastante e ajuste os números em `constants.ts` antes de seguir.

---

## Fase 3 — servidor autoritativo (Colyseus)

**P3.1 — sala roda a simulação**
> Em `server/src/rooms/MatchRoom.ts`, faça a sala rodar `step()` no
> `setSimulationInterval` a `TICKS_PER_SEC`, recebendo `command` e validando o
> dono. Comece enviando o estado por `broadcast('state', game)` (snapshot
> simples). Carregue um mapa real de `shared`.

**P3.2 — cliente online**
> Em `client/src/net.ts`, conecte com `colyseus.js`, envie comandos do input
> para o servidor e, ao receber `state`, desenhe com o renderer. Tire o `step()`
> local do cliente — agora quem simula é o servidor.

**P3.3 — interpolação**
> Adicione interpolação no cliente: guarde os 2 últimos snapshots e interpole
> posições de projéteis e contagens entre eles para suavizar o movimento.

**P3.4 — otimizar sync (opcional)**
> Se o broadcast de estado inteiro pesar, migre para `@colyseus/schema`: crie um
> `MatchState` com `@type()` espelhando o `GameState` e deixe o Colyseus mandar
> só os deltas.

---

## Fase 4 — salas, times e lobby

> Atribua `teamId` a cada jogador no `onJoin`. Crie um lobby com "pronto pra
> jogar" e início quando todos estiverem prontos. Trate reconexão
> (`allowReconnection`). Para 2v2, suba `maxClients` e ajuste a atribuição de
> times.

## Fase 5 — polimento e deploy

> Balanceie os números, adicione som e mais feedback visual, e faça deploy:
> servidor em Railway/Render/Fly, cliente como site estático (Vite build)
> apontando `VITE_SERVER` para a URL do servidor.
