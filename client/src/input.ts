// =====================================================================
//  Entrada do jogador -> vira Command. STUB — Fase 2.
//  Controles:
//    - ESPAÇO: seleciona TODOS os seus geradores
//    - clique simples no alvo: dispara METADE  (ratio: 'half')
//    - duplo clique no alvo:   dispara TUDO     (ratio: 'all')
// =====================================================================

import type { Renderer } from './render.js';
import type { Command } from '@geleia/shared';

export function bindInput(renderer: Renderer, onCommand?: (cmd: Command) => void) {
  const selected = new Set<number>();
  void renderer;
  void selected;
  void onCommand;

  // TODO Fase 2:
  //   - keydown ' ' -> selecionar todos os geradores do seu time
  //   - clique numa base sua -> add/remove da seleção
  //   - clique/duplo clique numa base alvo -> emitir { type:'send', from:[...], to, ratio }
  //   - teclas para setRole / upgrade / castPower (defina o esquema que preferir)
  //   No modo online, onCommand envia ao servidor; no offline, aplica no step local.
}
