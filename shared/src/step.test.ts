import { describe, it, expect } from 'vitest';
import { makeNode, makeState } from './factory';
import { step } from './step';
import { Command, BaseNode } from './types';
import * as C from './constants';

/** Inimigo inerte e distante: mantém 2 times no mapa (jogo não "acaba"). */
function enemy(id = 99): BaseNode {
  return makeNode({ id, pos: { x: 900, y: 500 }, team: 1, units: 50, role: 'tower' });
}

/** Roda `seconds` de simulação em passos de 1/TICKS_PER_SEC. */
function run(state: Parameters<typeof step>[0], seconds: number, commands: Command[] = []) {
  const dt = 1 / C.TICKS_PER_SEC;
  const steps = Math.round(seconds / dt);
  for (let i = 0; i < steps; i++) step(state, dt, i === 0 ? commands : []);
}

describe('geração', () => {
  it('gerador produz geleias com o tempo, até o teto', () => {
    const s = makeState([
      makeNode({ id: 0, pos: { x: 0, y: 0 }, team: 0, units: 0, role: 'generator' }),
      enemy(),
    ]);
    run(s, 3);
    expect(s.nodes[0].units).toBeGreaterThanOrEqual(2);
    expect(s.nodes[0].units).toBeLessThanOrEqual(C.UNIT_CAP);
  });

  it('nível maior gera mais rápido', () => {
    const lvl1 = makeState([makeNode({ id: 0, pos: { x: 0, y: 0 }, team: 0, role: 'generator', level: 1 }), enemy()]);
    const lvl3 = makeState([makeNode({ id: 0, pos: { x: 0, y: 0 }, team: 0, role: 'generator', level: 3 }), enemy()]);
    run(lvl1, 2);
    run(lvl3, 2);
    expect(lvl3.nodes[0].units).toBeGreaterThan(lvl1.nodes[0].units);
  });
});

describe('envio e captura', () => {
  it('enviar metade reduz a origem e cria um projétil', () => {
    const s = makeState([
      makeNode({ id: 0, pos: { x: 0, y: 0 }, team: 0, units: 20, role: 'generator' }),
      makeNode({ id: 1, pos: { x: 500, y: 0 }, team: 1, units: 5, role: 'generator' }),
    ]);
    step(s, 1 / C.TICKS_PER_SEC, [{ type: 'send', from: [0], to: 1, ratio: 'half' }]);
    expect(s.nodes[0].units).toBe(10);
    expect(s.projectiles.length).toBe(1);
    expect(s.projectiles[0].units).toBe(10);
  });

  it('ataque maior que o defensor captura a base', () => {
    const s = makeState([
      makeNode({ id: 0, pos: { x: 0, y: 0 }, team: 0, units: 30, role: 'generator' }),
      makeNode({ id: 1, pos: { x: 200, y: 0 }, team: 1, units: 5, role: 'generator' }),
    ]);
    run(s, 4, [{ type: 'send', from: [0], to: 1, ratio: 'all' }]);
    expect(s.nodes[1].team).toBe(0);
  });
});

describe('upgrade', () => {
  it('sobe de nível gastando geleias', () => {
    const s = makeState([
      makeNode({ id: 0, pos: { x: 0, y: 0 }, team: 0, units: 30, role: 'generator', level: 1 }),
      enemy(),
    ]);
    step(s, 1 / C.TICKS_PER_SEC, [{ type: 'upgrade', node: 0 }]);
    expect(s.nodes[0].level).toBe(2);
    expect(s.nodes[0].units).toBe(30 - C.UPGRADE_COST);
  });
});

describe('veneno', () => {
  it('drena geleias ao longo do tempo e depois passa', () => {
    const s = makeState([
      makeNode({ id: 0, pos: { x: 0, y: 0 }, team: 0, units: 40, role: 'generator' }),
      enemy(),
    ]);
    s.nodes[0].poison = { ratePerSec: C.POISON_RATE, secondsLeft: C.POISON_DURATION };
    run(s, C.POISON_DURATION + 1);
    expect(s.nodes[0].units).toBeLessThan(40);
    expect(s.nodes[0].poison).toBeUndefined();
  });
});

describe('dívida de congelamento (lado do reforço — já implementado)', () => {
  it('descongela quando o dono manda reforço suficiente', () => {
    const s = makeState([
      makeNode({ id: 0, pos: { x: 0, y: 0 }, team: 0, units: 30, role: 'generator' }),
      makeNode({ id: 1, pos: { x: 150, y: 0 }, team: 0, units: 20, role: 'generator' }),
      enemy(),
    ]);
    s.nodes[1].frozen = { lockedUnits: 20, debtRemaining: 20 };
    run(s, 3, [{ type: 'send', from: [0], to: 1, ratio: 'all' }]);
    expect(s.nodes[1].frozen).toBeUndefined();
  });
});

// =====================================================================
//  TODO Fase 1 — estes testes definem o comportamento que falta.
//  Troque it.todo por it() e faça-os passar.
// =====================================================================
describe('poderes do cientista (applyPower)', () => {
  it('freeze trava a base alvo e cria a dívida igual aos units atuais', () => {
    const INITIAL_UNITS = 15;
    // Cientista próximo ao alvo (distância 10 < NODE_RADIUS*0.6=18) → projétil chega no 1º tick.
    const s = makeState([
      makeNode({ id: 0, pos: { x: 100, y: 300 }, team: 0, units: C.COST_FREEZE + 5, role: 'scientist' }),
      makeNode({ id: 1, pos: { x: 110, y: 300 }, team: 1, units: INITIAL_UNITS, role: 'generator' }),
    ]);

    run(s, 3, [{ type: 'castPower', from: 0, target: 1, power: 'freeze' }]);

    const target = s.nodes[1];
    expect(target.frozen).toBeDefined();
    expect(target.frozen!.lockedUnits).toBe(INITIAL_UNITS);
    expect(target.frozen!.debtRemaining).toBe(INITIAL_UNITS);
    // Gerador congelado não produz: units devem permanecer iguais aos do momento do freeze.
    expect(target.units).toBe(INITIAL_UNITS);
  });

  it.todo('poison aplica PoisonState na base alvo');
  it.todo('convert vira SOMENTE a base alvo para o time do cientista');
});

describe('torre (fireTowers)', () => {
  it.todo('torre dispara em projétil inimigo dentro do alcance');
  it.todo('towerShot reduz units do projétil alvo e o remove se zerar');
});
