// =====================================================================
//  Números do jogo, todos num lugar só. Ajuste aqui pra balancear.
// =====================================================================

export const TICKS_PER_SEC = 20; // o servidor avança a simulação 20x por segundo

// mundo (espaço lógico, independente da resolução de tela)
export const WORLD_W = 1000;
export const WORLD_H = 600;
export const NODE_RADIUS = 30;
export const UNIT_CAP = 60; // teto de geleias geradas numa base

// geradores
export const GEN_BASE_INTERVAL = 1.0; // segundos por geleia no nível 1
export const GEN_LEVEL_STEP = 0.2; // cada nível reduz o intervalo
export const GEN_MIN_INTERVAL = 0.3; // intervalo mínimo (nível alto)
export const MAX_LEVEL = 4;
export const UPGRADE_COST = 15; // geleias gastas para subir um nível

// velocidades dos projéteis (px lógicos por segundo)
export const SPEED_ATTACK = 150; // gerador: padrão
export const SPEED_TOWER = 90; // torre: lento
export const SPEED_SCIENTIST = 260; // cientista: rápido

// torre
export const TOWER_RANGE = 180;
export const TOWER_FIRE_INTERVAL = 0.6;
export const TOWER_DAMAGE = 3; // quanto cada tiro tira do projétil inimigo

// custos dos poderes (em geleias acumuladas no cientista)
export const COST_FREEZE = 8;
export const COST_POISON = 14;
export const COST_CONVERT = 25;

// veneno
export const POISON_RATE = 2; // geleias perdidas por segundo
export const POISON_DURATION = 5; // segundos

// quantidade que o projétil de conversão "carrega" e deixa na base convertida
export const CONVERT_CARRY = 10;
