/**
 * @fileoverview Powerup system with generation and effects
 * Handles powerup spawning and application of effects
 */

import { Powerup, PowerupType, Vector2D } from '../types/game-types';

/**
 * Powerup configuration
 */
interface PowerupConfig {
  type: PowerupType;
  value: number;
  duration: number;
  color: string;
  description: string;
}

/**
 * All available powerups
 */
export const POWERUP_CONFIGS: Record<PowerupType, PowerupConfig> = {
  [PowerupType.HEALTH]: {
    type: PowerupType.HEALTH,
    value: 30,
    duration: 0,
    color: '#00FF00',
    description: 'Restores 30 HP',
  },
  [PowerupType.DAMAGE]: {
    type: PowerupType.DAMAGE,
    value: 0.5,
    duration: 10,
    color: '#FF0000',
    description: '+50% Damage for 10s',
  },
  [PowerupType.FIRE_RATE]: {
    type: PowerupType.FIRE_RATE,
    value: 0.5,
    duration: 10,
    color: '#FFD700',
    description: '+50% Fire Rate for 10s',
  },
  [PowerupType.SPEED]: {
    type: PowerupType.SPEED,
    value: 0.4,
    duration: 8,
    color: '#00FFFF',
    description: '+40% Speed for 8s',
  },
  [PowerupType.SHIELD]: {
    type: PowerupType.SHIELD,
    value: 50,
    duration: 15,
    color: '#4169E1',
    description: '50 HP Shield for 15s',
  },
  [PowerupType.MULTI_SHOT]: {
    type: PowerupType.MULTI_SHOT,
    value: 2,
    duration: 12,
    color: '#FF00FF',
    description: '+2 Projectiles for 12s',
  },
};

/**
 * Generate a random powerup at position
 */
export const generatePowerup = (position: Vector2D): Powerup => {
  const types = Object.values(PowerupType);
  const randomType = types[Math.floor(Math.random() * types.length)];
  const config = POWERUP_CONFIGS[randomType];
  
  return {
    id: `powerup-${Date.now()}-${Math.random()}`,
    type: randomType,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    size: 15,
    health: 1,
    maxHealth: 1,
    rotation: 0,
    value: config.value,
    duration: config.duration,
    color: config.color,
  };
};

/**
 * Spawn powerups randomly during gameplay
 * @param chance - Probability (0-1) of spawning
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 */
export const spawnPowerupRandomly = (
  chance: number,
  canvasWidth: number,
  canvasHeight: number
): Powerup | null => {
  if (Math.random() > chance) return null;
  
  const position: Vector2D = {
    x: Math.random() * (canvasWidth - 100) + 50,
    y: Math.random() * (canvasHeight - 200) + 100,
  };
  
  return generatePowerup(position);
};

/**
 * Spawn powerup at boss death location
 * Higher chance than random spawning
 */
export const spawnPowerupAtBossDeath = (
  bossPosition: Vector2D,
  dropChance: number = 0.4
): Powerup | null => {
  if (Math.random() > dropChance) return null;
  return generatePowerup(bossPosition);
};

/**
 * Get powerup effect description
 */
export const getPowerupDescription = (type: PowerupType): string => {
  return POWERUP_CONFIGS[type].description;
};
