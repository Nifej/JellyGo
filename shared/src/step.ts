// =====================================================================
//  step(): avança o jogo um "tiquinho" de tempo (dt segundos).
//  É PURA: recebe o estado e os comandos, muda o estado. Sem rede,
//  sem desenho. O servidor chama isto N vezes por segundo.
//
//  O que JÁ funciona: geração, envio (metade/tudo), chegada e captura,
//  upgrade, veneno (dano), pagamento da dívida de congelamento.
//
//  O que falta (TODO Fase 1, marcado abaixo):
//    1. applyPower()  -> efeito do poder ao acertar a base (freeze/poison/convert)
//    2. fireTowers()  -> torres mirando e abatendo projéteis inimigos
// =====================================================================

import { BaseNode, Command, GameState, PowerKind, Projectile } from './types';
import * as C from './constants';

export function step(state: GameState, dt: number, commands: Command[]): void {
  if (state.winner !== undefined) return;

  for (const cmd of commands) applyCommand(state, cmd);

  generate(state, dt);
  applyPoison(state, dt);
  fireTowers(state, dt); // TODO
  advanceProjectiles(state, dt);

  state.tick++;
  checkWinner(state);
}

// ---------------------------------------------------------------- utils
function nodeById(state: GameState, id: number): BaseNode | undefined {
  return state.nodes.find((n) => n.id === id);
}

function genInterval(level: number): number {
  return Math.max(C.GEN_MIN_INTERVAL, C.GEN_BASE_INTERVAL - (level - 1) * C.GEN_LEVEL_STEP);
}

function powerCost(power: PowerKind): number {
  return power === 'freeze' ? C.COST_FREEZE : power === 'poison' ? C.COST_POISON : C.COST_CONVERT;
}

// ------------------------------------------------------------- comandos
function applyCommand(state: GameState, cmd: Command): void {
  switch (cmd.type) {
    case 'send': {
      const to = nodeById(state, cmd.to);
      if (!to) return;
      for (const fromId of cmd.from) {
        const src = nodeById(state, fromId);
        if (!src || src.team === null || src.id === to.id || src.units < 1) continue;
        const count = cmd.ratio === 'all' ? src.units : Math.floor(src.units / 2);
        if (count <= 0) continue;
        src.units -= count;
        state.projectiles.push({
          id: state.nextProjectileId++,
          kind: 'attack',
          team: src.team,
          pos: { ...src.pos },
          speed: C.SPEED_ATTACK,
          targetNodeId: to.id,
          units: count,
        });
      }
      return;
    }

    case 'setRole': {
      const n = nodeById(state, cmd.node);
      if (n && n.team !== null) n.role = cmd.role;
      return;
    }

    case 'upgrade': {
      const n = nodeById(state, cmd.node);
      if (!n || n.team === null || n.role !== 'generator') return;
      if (n.level >= C.MAX_LEVEL || n.units < C.UPGRADE_COST) return;
      n.units -= C.UPGRADE_COST;
      n.level++;
      return;
    }

    case 'castPower': {
      const src = nodeById(state, cmd.from);
      const target = nodeById(state, cmd.target);
      if (!src || !target || src.team === null || src.role !== 'scientist') return;
      const cost = powerCost(cmd.power);
      if (src.units < cost) return;
      src.units -= cost;
      state.projectiles.push({
        id: state.nextProjectileId++,
        kind: 'power',
        team: src.team,
        pos: { ...src.pos },
        speed: C.SPEED_SCIENTIST,
        targetNodeId: target.id,
        power: cmd.power,
        units: cmd.power === 'convert' ? C.CONVERT_CARRY : undefined,
      });
      return;
    }
  }
}

// ------------------------------------------------------------- geração
function generate(state: GameState, dt: number): void {
  for (const n of state.nodes) {
    if (n.team === null || n.role !== 'generator') continue;
    if (n.frozen || n.poison) continue; // congelado não gera; envenenado perde (ver applyPoison)
    if (n.units >= C.UNIT_CAP) continue;
    n.genTimer += dt;
    const interval = genInterval(n.level);
    while (n.genTimer >= interval && n.units < C.UNIT_CAP) {
      n.genTimer -= interval;
      n.units += 1;
    }
  }
}

// -------------------------------------------------------------- veneno
function applyPoison(state: GameState, dt: number): void {
  for (const n of state.nodes) {
    if (!n.poison) continue;
    n.units = Math.max(0, n.units - n.poison.ratePerSec * dt);
    n.poison.secondsLeft -= dt;
    if (n.poison.secondsLeft <= 0) n.poison = undefined;
  }
}

// -------------------------------------------------------------- projéteis
function advanceProjectiles(state: GameState, dt: number): void {
  const survivors: Projectile[] = [];
  for (const pr of state.projectiles) {
    if (pr.kind === 'towerShot') { survivors.push(pr); continue; } // movimento tratado em fireTowers
    const target = pr.targetNodeId !== undefined ? nodeById(state, pr.targetNodeId) : undefined;
    if (!target) continue; // alvo sumiu -> projétil descartado

    const dx = target.pos.x - pr.pos.x;
    const dy = target.pos.y - pr.pos.y;
    const d = Math.hypot(dx, dy);

    if (d <= C.NODE_RADIUS * 0.6) {
      if (pr.kind === 'attack') resolveAttack(target, pr);
      else if (pr.kind === 'power') applyPower(state, pr, target); // TODO
    } else {
      pr.pos.x += (dx / d) * pr.speed * dt;
      pr.pos.y += (dy / d) * pr.speed * dt;
      survivors.push(pr);
    }
  }
  state.projectiles = survivors;
}

function resolveAttack(node: BaseNode, pr: Projectile): void {
  const count = pr.units ?? 0;
  if (node.team === pr.team) {
    // reforço: soma e paga a dívida de congelamento, se houver
    node.units += count;
    if (node.frozen) {
      node.frozen.debtRemaining -= count;
      if (node.frozen.debtRemaining <= 0) node.frozen = undefined;
    }
  } else {
    node.units -= count;
    if (node.units < 0) {
      node.team = pr.team;
      node.units = -node.units;
      node.role = 'generator';
      node.level = 1;
      node.genTimer = 0;
      node.frozen = undefined;
      node.poison = undefined;
    }
  }
}

// ====================================================================
//  TODO Fase 1 — preencher com o Claude Code (testes já especificam o
//  comportamento esperado em step.test.ts).
// ====================================================================
function applyPower(_state: GameState, pr: Projectile, node: BaseNode): void {
  switch (pr.power) {
    case 'freeze':
      node.frozen = { lockedUnits: node.units, debtRemaining: node.units };
      break;
    case 'poison':
      node.poison = { ratePerSec: C.POISON_RATE, secondsLeft: C.POISON_DURATION };
      break;
    case 'convert':
      node.team = pr.team;
      node.units = pr.units ?? C.CONVERT_CARRY;
      node.role = 'generator';
      node.level = 1;
      node.genTimer = 0;
      node.frozen = undefined;
      node.poison = undefined;
      break;
  }
}

function fireTowers(state: GameState, dt: number): void {
  const killedIds = new Set<number>();   // attack projectiles com units <= 0
  const consumedIds = new Set<number>(); // towerShots que acertaram ou perderam o alvo

  // Fase A: avança towerShots existentes e resolve colisões
  for (const ts of state.projectiles) {
    if (ts.kind !== 'towerShot') continue;

    const target = state.projectiles.find(
      p => p.id === ts.targetProjectileId && !killedIds.has(p.id),
    );
    if (!target) { consumedIds.add(ts.id); continue; } // alvo sumiu

    const dx = target.pos.x - ts.pos.x;
    const dy = target.pos.y - ts.pos.y;
    const d = Math.hypot(dx, dy);

    if (d <= C.NODE_RADIUS * 0.6) {
      target.units = (target.units ?? 0) - C.TOWER_DAMAGE;
      consumedIds.add(ts.id);
      if ((target.units ?? 0) <= 0) killedIds.add(target.id);
    } else {
      ts.pos.x += (dx / d) * ts.speed * dt;
      ts.pos.y += (dy / d) * ts.speed * dt;
    }
  }

  state.projectiles = state.projectiles.filter(
    p => !consumedIds.has(p.id) && !killedIds.has(p.id),
  );

  // Fase B: cada torre pronta dispara no attack inimigo mais próximo dentro do alcance
  for (const node of state.nodes) {
    if (node.team === null || node.role !== 'tower') continue;

    node.fireTimer = (node.fireTimer ?? 0) + dt;
    if (node.fireTimer < C.TOWER_FIRE_INTERVAL) continue;
    node.fireTimer -= C.TOWER_FIRE_INTERVAL;

    let closest: Projectile | undefined;
    let closestDist = C.TOWER_RANGE;
    for (const pr of state.projectiles) {
      if (pr.kind !== 'attack' || pr.team === node.team) continue;
      const d = Math.hypot(pr.pos.x - node.pos.x, pr.pos.y - node.pos.y);
      if (d <= closestDist) { closestDist = d; closest = pr; }
    }

    if (!closest) continue;

    state.projectiles.push({
      id: state.nextProjectileId++,
      kind: 'towerShot',
      team: node.team,
      pos: { ...node.pos },
      speed: C.SPEED_TOWER,
      targetProjectileId: closest.id,
    });
  }
}

// -------------------------------------------------------------- vitória
function checkWinner(state: GameState): void {
  const teams = new Set<number>();
  for (const n of state.nodes) if (n.team !== null) teams.add(n.team);
  for (const p of state.projectiles) if (p.kind === 'attack') teams.add(p.team);
  if (teams.size === 1) state.winner = [...teams][0];
  else if (teams.size === 0) state.winner = null;
}
