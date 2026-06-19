// =====================================================================
//  Servidor autoritativo (Colyseus). É ele quem roda o jogo de verdade.
//  STUB — completar na Fase 3 (ver docs/PROMPTS.md).
// =====================================================================

import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { MatchRoom } from './rooms/MatchRoom.js';

const PORT = Number(process.env.PORT ?? 2567);

const gameServer = new Server({
  transport: new WebSocketTransport({}),
});

// Uma sala = uma partida.
gameServer.define('match', MatchRoom);

gameServer.listen(PORT);
console.log(`[geleia] servidor ouvindo na porta ${PORT}`);
