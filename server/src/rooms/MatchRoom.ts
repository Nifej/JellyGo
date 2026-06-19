// =====================================================================
//  MatchRoom: uma partida. Roda step() no ritmo do servidor e sincroniza
//  o estado para os clientes. STUB — completar na Fase 3.
// =====================================================================

import { Room, Client } from '@colyseus/core';
import { step, makeState, makeNode, C } from '@geleia/shared';
import type { Command, GameState } from '@geleia/shared';

// TODO Fase 3:
//   O Colyseus sincroniza uma classe de Schema (@colyseus/schema), não um
//   objeto JS qualquer. Você vai criar um MatchState com @type() espelhando
//   GameState (nodes, projectiles...) e copiar de/para o GameState a cada tick,
//   OU rodar o GameState puro aqui e enviar snapshots via broadcast.
//   Comece pelo caminho mais simples (broadcast de snapshot) e otimize depois.

export class MatchRoom extends Room {
  maxClients = 2; // 1v1 por enquanto; suba para 4 em times

  private game!: GameState;
  private pending: Command[] = [];

  onCreate() {
    // TODO: carregar um mapa de verdade (ver shared) em vez deste placeholder.
    this.game = makeState([
      makeNode({ id: 0, pos: { x: 160, y: 300 }, team: 0, units: 20, role: 'generator' }),
      makeNode({ id: 1, pos: { x: 840, y: 300 }, team: 1, units: 20, role: 'generator' }),
      makeNode({ id: 2, pos: { x: 500, y: 150 }, units: 10 }),
      makeNode({ id: 3, pos: { x: 500, y: 450 }, units: 10 }),
    ]);

    // recebe comandos do cliente (NUNCA confie sem validar o dono no step)
    this.onMessage('command', (_client: Client, cmd: Command) => {
      this.pending.push(cmd);
    });

    // loop autoritativo: avança a simulação no ritmo fixo do servidor
    const dt = 1 / C.TICKS_PER_SEC;
    this.setSimulationInterval(() => {
      step(this.game, dt, this.pending);
      this.pending = [];
      // TODO: enviar o estado aos clientes (snapshot ou schema sync)
      this.broadcast('state', this.game);
    }, 1000 / C.TICKS_PER_SEC);
  }

  onJoin(client: Client) {
    console.log('[geleia] entrou:', client.sessionId);
    // TODO: atribuir teamId ao jogador (0, 1, ...) e mandar pra ele.
  }

  onLeave(client: Client) {
    console.log('[geleia] saiu:', client.sessionId);
  }
}
