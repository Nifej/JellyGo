// =====================================================================
//  Tipos centrais do jogo. Esta é a "fonte da verdade" das regras.
//  Tudo aqui é puro: sem rede, sem render, sem dependências externas.
// =====================================================================

/** Time do jogador. 0, 1, 2... Use `null` para base neutra. */
export type TeamId = number;

/** O papel que uma base assume. */
export type Role = 'generator' | 'tower' | 'scientist';

/** Poderes do cientista. */
export type PowerKind = 'freeze' | 'poison' | 'convert';

export interface Vec2 {
  x: number;
  y: number;
}

/** Estado de congelamento de uma base (poder freeze). */
export interface FreezeState {
  /** Quantas geleias a base tinha quando foi congelada. */
  lockedUnits: number;
  /** Reforço que ainda falta chegar para descongelar (a "dívida"). */
  debtRemaining: number;
}

/** Estado de envenenamento de uma base (poder poison). */
export interface PoisonState {
  ratePerSec: number;
  secondsLeft: number;
}

/** Uma base no mapa. */
export interface BaseNode {
  id: number;
  pos: Vec2;
  team: TeamId | null; // null = neutra
  units: number;
  role: Role;
  level: number; // nível do gerador (1+). Maior nível = geração mais rápida.

  // ---- estado interno de simulação ----
  genTimer: number; // acumulador de tempo de geração
  fireTimer?: number; // cadência da torre (preencher na lógica da torre)
  frozen?: FreezeState;
  poison?: PoisonState;
}

export type ProjectileKind = 'attack' | 'towerShot' | 'power';

/**
 * Tudo que se move no mapa é um projétil:
 *  - attack:    geleias enviadas por um gerador (velocidade padrão)
 *  - towerShot: tiro da torre, mira em projéteis inimigos (lento)
 *  - power:     poder do cientista, mira numa base (rápido)
 */
export interface Projectile {
  id: number;
  kind: ProjectileKind;
  team: TeamId;
  pos: Vec2;
  speed: number;

  targetNodeId?: number; // attack e power miram numa base
  targetProjectileId?: number; // towerShot mira noutro projétil

  units?: number; // attack e convert carregam uma quantidade
  power?: PowerKind; // só quando kind === 'power'
}

/** O estado completo do jogo num instante. O servidor é dono dele. */
export interface GameState {
  tick: number;
  nodes: BaseNode[];
  projectiles: Projectile[];
  nextProjectileId: number;
  /** undefined = jogo rolando; TeamId = vencedor; null = empate/sem ninguém. */
  winner?: TeamId | null;
}

// =====================================================================
//  Comandos que os clientes enviam ao servidor. O cliente NUNCA muda o
//  estado direto — ele só manda estas intenções.
// =====================================================================

export type Command =
  | { type: 'send'; from: number[]; to: number; ratio: 'half' | 'all' }
  | { type: 'setRole'; node: number; role: Role }
  | { type: 'upgrade'; node: number }
  | { type: 'castPower'; from: number; target: number; power: PowerKind };
