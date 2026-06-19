// =====================================================================
//  Conexão com o servidor autoritativo (Colyseus). STUB — Fase 3.
// =====================================================================

import { Client } from 'colyseus.js';
import type { Command } from '@geleia/shared';

const ENDPOINT = import.meta.env?.VITE_SERVER ?? 'ws://localhost:2567';

export async function connect() {
  const client = new Client(ENDPOINT);
  const room = await client.joinOrCreate('match');

  // enviar um comando ao servidor
  const send = (cmd: Command) => room.send('command', cmd);

  // TODO Fase 3: receber 'state' e repassar ao renderer com interpolação.
  return { room, send };
}
