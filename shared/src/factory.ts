import { BaseNode, GameState, Role, TeamId, Vec2 } from './types';

/** Cria uma base já com os campos internos zerados. */
export function makeNode(p: {
  id: number;
  pos: Vec2;
  team?: TeamId | null;
  units?: number;
  role?: Role;
  level?: number;
}): BaseNode {
  return {
    id: p.id,
    pos: p.pos,
    team: p.team ?? null,
    units: p.units ?? 0,
    role: p.role ?? 'generator',
    level: p.level ?? 1,
    genTimer: 0,
  };
}

/** Cria um estado inicial a partir de uma lista de bases. */
export function makeState(nodes: BaseNode[]): GameState {
  return { tick: 0, nodes, projectiles: [], nextProjectileId: 1 };
}
