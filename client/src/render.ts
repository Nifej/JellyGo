// =====================================================================
//  Render com PixiJS. Desenha um GameState. STUB — Fase 2.
//  Reaproveite a estética "geleia" do protótipo (blobs glossy + jiggle).
// =====================================================================

import { Application } from 'pixi.js';
import type { GameState } from '@geleia/shared';

export interface Renderer {
  app: Application;
  draw(state: GameState): void;
  /** converte coordenada de tela -> mundo lógico (1000x600) */
  toWorld(clientX: number, clientY: number): { x: number; y: number };
}

export async function mountRenderer(host: HTMLElement): Promise<Renderer> {
  const app = new Application();
  await app.init({ background: '#22102f', resizeTo: host, antialias: true });
  host.appendChild(app.canvas);

  // TODO Fase 2:
  //   - manter um espaço lógico 1000x600 e escalar para o canvas
  //   - desenhar bases (cor por time), número de geleias, papel (gerador/torre/cientista)
  //   - desenhar projéteis (attack/towerShot/power) com cores e tamanhos distintos
  //   - efeitos visuais: congelado (azul), envenenado (gota), conversão (flash)

  function toWorld(clientX: number, clientY: number) {
    void clientX;
    void clientY;
    return { x: 0, y: 0 }; // TODO
  }

  function draw(_state: GameState) {
    // TODO
  }

  return { app, draw, toWorld };
}
