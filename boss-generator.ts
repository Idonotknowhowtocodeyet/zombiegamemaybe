/**
 * @fileoverview Procedural boss generation system
 * Generates random bosses with difficulty scaling based on wave number
 */

import {
  Boss,
  BossAttack,
  AttackPattern,
  MovementPattern,
  Vector2D,
} from '../types/game-types';

/**
 * Boss name generator for flavor
 */
const BOSS_NAME_PREFIXES = [
  'Shadow',
  'Crimson',
  'Void',
  'Thunder',
  'Inferno',
  'Frost',
  'Chaos',
  'Death',
  'Eternal',
  'Dark',
  'Blood',
  'Storm',
];

const BOSS_NAME_SUFFIXES = [
  'Destroyer',
  'Annihilator',
  'Tyrant',
  'Lord',
  'Master',
  'King',
  'Emperor',
  'Demon',
  'Beast',
  'Reaper',
  'Fiend',
  'Terror',
];

/**
 * Generate a random boss name
 */
const generateBossName = (): string => {
  const prefix = BOSS_NAME_PREFIXES[Math.floor(Math.random() * BOSS_NAME_PREFIXES.length)];
  const suffix = BOSS_NAME_SUFFIXES[Math.floor(Math.random() * BOSS_NAME_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
};

/**
 * Generate random color for boss
 */
const generateBossColor = (): string => {
  const colors = [
    '#FF0000',
    '#FF00FF',
    '#8B00FF',
    '#FF4500',
    '#DC143C',
    '#FF1493',
    '#4B0082',
    '#8B0000',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Calculate difficulty multiplier based on wave
 * Exponential scaling for challenge
 */
const getDifficultyMultiplier = (wave: number): number => {
  return 1 + (wave - 1) * 0.3; // 30% increase per wave
};

/**
 * Generate random attack pattern for boss
 */
const generateAttackPattern = (wave: number, difficulty: number): BossAttack => {
  const patterns = Object.values(AttackPattern);
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  const baseDamage = 5 + wave * 2;
  const baseSpeed = 6 + wave * 0.5;
  const baseCount = pattern === AttackPattern.CIRCLE || pattern === AttackPattern.SPREAD 
    ? 8 + Math.floor(wave / 2) 
    : 1;
  
  const colors = ['#FF0000', '#FF6347', '#FFD700', '#FF00FF', '#00FFFF'];
  
  return {
    pattern,
    damage: Math.floor(baseDamage * difficulty),
    projectileSpeed: baseSpeed * difficulty,
    projectileCount: baseCount,
    cooldown: Math.max(0.5, 2 - wave * 0.1),
    lastFired: 0,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
};

/**
 * Generate random movement pattern for boss
 */
const generateMovementPattern = (): MovementPattern => {
  const patterns = Object.values(MovementPattern);
  return patterns[Math.floor(Math.random() * patterns.length)];
};

/**
 * Generate a procedural boss based on wave number
 * @param wave - Current wave number (1-based)
 * @param canvasWidth - Canvas width for positioning
 * @param canvasHeight - Canvas height for positioning
 * @returns Generated boss
 */
export const generateRandomBoss = (
  wave: number,
  canvasWidth: number,
  canvasHeight: number
): Boss => {
  const difficulty = getDifficultyMultiplier(wave);
  
  // Scale stats with wave and difficulty
  const baseHealth = 100;
  const health = Math.floor(baseHealth * difficulty * (1 + wave * 0.5));
  
  const baseSize = 40;
  const size = baseSize + Math.floor(wave * 2);
  
  const baseSpeed = 2;
  const speed = baseSpeed + wave * 0.2;
  
  // Generate multiple attacks for harder waves
  const attackCount = Math.min(1 + Math.floor(wave / 3), 4);
  const attacks: BossAttack[] = [];
  
  for (let i = 0; i < attackCount; i++) {
    attacks.push(generateAttackPattern(wave, difficulty));
  }
  
  // Spawn at top center
  const position: Vector2D = {
    x: canvasWidth / 2,
    y: 100,
  };
  
  const boss: Boss = {
    id: `boss-${Date.now()}-${Math.random()}`,
    name: generateBossName(),
    position,
    velocity: { x: 0, y: 0 },
    size,
    health,
    maxHealth: health,
    rotation: 0,
    movementPattern: generateMovementPattern(),
    attacks,
    speed,
    color: generateBossColor(),
    wave,
    reward: Math.floor(100 * difficulty * wave),
    movementTimer: 0,
  };
  
  return boss;
};

/**
 * Generate multiple bosses for a wave
 */
export const generateBossWave = (
  wave: number,
  canvasWidth: number,
  canvasHeight: number
): Boss[] => {
  // More bosses on higher waves (max 3)
  const bossCount = Math.min(1 + Math.floor(wave / 5), 3);
  const bosses: Boss[] = [];
  
  for (let i = 0; i < bossCount; i++) {
    const boss = generateRandomBoss(wave, canvasWidth, canvasHeight);
    
    // Spread bosses horizontally if multiple
    if (bossCount > 1) {
      boss.position.x = (canvasWidth / (bossCount + 1)) * (i + 1);
    }
    
    bosses.push(boss);
  }
  
  return bosses;
};

/**
 * Clone boss for custom boss fights
 */
export const cloneBoss = (boss: Boss, canvasWidth: number, canvasHeight: number): Boss => {
  return {
    ...boss,
    id: `boss-${Date.now()}-${Math.random()}`,
    position: { x: canvasWidth / 2, y: 100 },
    velocity: { x: 0, y: 0 },
    health: boss.maxHealth,
    movementTimer: 0,
    attacks: boss.attacks.map(attack => ({ ...attack, lastFired: 0 })),
  };
};

/**
 * Create a boss template for editor
 */
export const createBossTemplate = (canvasWidth: number, canvasHeight: number): Partial<Boss> => {
  return {
    name: 'Custom Boss',
    position: { x: canvasWidth / 2, y: 100 },
    velocity: { x: 0, y: 0 },
    size: 50,
    health: 200,
    maxHealth: 200,
    rotation: 0,
    movementPattern: MovementPattern.HORIZONTAL,
    attacks: [
      {
        pattern: AttackPattern.STRAIGHT,
        damage: 10,
        projectileSpeed: 8,
        projectileCount: 1,
        cooldown: 1.5,
        lastFired: 0,
        color: '#FF0000',
      },
    ],
    speed: 3,
    color: '#FF00FF',
    wave: 1,
    reward: 200,
    movementTimer: 0,
  };
};
