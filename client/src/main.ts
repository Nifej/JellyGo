// =====================================================================
//  Entrada do cliente. O cliente SÓ desenha o estado e envia comandos.
//  Ele nunca decide regras. STUB — completar nas Fases 2 e 3.
// =====================================================================

import { mountRenderer } from './render.js';
import { bindInput } from './input.js';
// import { connect } from './net.js'; // ligar na Fase 3

async function boot() {
  const renderer = await mountRenderer(document.getElementById('app')!);
  bindInput(renderer);

  // Fase 2: rode um GameState local (import { step, makeState } de @geleia/shared)
  //         e desenhe com o renderer, para jogar offline contra uma IA.
  // Fase 3: troque o estado local pela conexão com o servidor (net.ts):
  //         const room = await connect(); room.onStateChange(s => renderer.draw(s));
  console.log('[geleia] cliente pronto');
}

boot();
