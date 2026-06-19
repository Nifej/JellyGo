# Geleia Conquista

Jogo de estratégia em tempo real, multijogador, tema de geleias.
Monorepo com três pacotes: `shared` (regras), `server` (Colyseus), `client` (Pixi).

## Começar

```bash
npm install
npm test -w @geleia/shared      # roda os testes da simulação (7 passam, 5 todo)
```

Rodar (depois de implementar as fases — ver `docs/PROMPTS.md`):

```bash
npm run dev:server              # servidor autoritativo (porta 2567)
npm run dev:client              # cliente (Vite)
```

## Mapa do projeto

- `CLAUDE.md` — design, regras e convenções. **Leia primeiro.**
- `docs/PROMPTS.md` — os prompts ordenados para construir com o Claude Code.
- `shared/src/types.ts` — o `GameState` e os comandos.
- `shared/src/constants.ts` — todos os números do jogo (balanceamento).
- `shared/src/step.ts` — a simulação. Núcleo pronto; `applyPower` e
  `fireTowers` marcados como `TODO`.
- `shared/src/step.test.ts` — testes que também servem de especificação.

## Como usar com o Claude Code

1. Abra a pasta no VS Code e rode o Claude Code.
2. Ele lê o `CLAUDE.md` sozinho. Cole os prompts de `docs/PROMPTS.md` um a um.
3. A cada prompt verde, faça commit antes do próximo.
