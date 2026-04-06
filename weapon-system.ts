/**
 * @fileoverview Weapon system configuration and factory
 * Defines all available weapons with stats and costs
 */

import { Weapon, WeaponType } from '../types/game-types';

/**
 * Creates a default weapon configuration
 */
const createWeapon = (
  type: WeaponType,
  name: string,
  damage: number,
  fireRate: number,
  projectileSpeed: number,
  projectileSize: number,
  spread: number,
  projectileCount: number,
  piercing: boolean,
  reloadTime: number,
  magazineSize: number,
  color: string,
  cost: number,
  description: string,
  unlocked: boolean = false
): Weapon => ({
  id: type,
  type,
  name,
  damage,
  fireRate,
  projectileSpeed,
  projectileSize,
  spread,
  projectileCount,
  piercing,
  reloadTime,
  magazineSize,
  color,
  cost,
  unlocked,
  description,
});

/**
 * All available weapons in the game
 * Balanced for progressive difficulty and cost
 */
export const WEAPONS: Record<WeaponType, Weapon> = {
  [WeaponType.PISTOL]: createWeapon(
    WeaponType.PISTOL,
    'Pistol',
    10,
    3,
    12,
    4,
    2,
    1,
    false,
    1.0,
    12,
    '#FFD700',
    0,
    'Starter weapon. Balanced fire rate and damage.',
    true
  ),
  [WeaponType.SHOTGUN]: createWeapon(
    WeaponType.SHOTGUN,
    'Shotgun',
    8,
    1.5,
    10,
    3,
    15,
    6,
    false,
    2.0,
    8,
    '#FF6347',
    500,
    'Close-range devastation. Fires multiple pellets.',
    false
  ),
  [WeaponType.RIFLE]: createWeapon(
    WeaponType.RIFLE,
    'Assault Rifle',
    12,
    6,
    15,
    3,
    1,
    1,
    false,
    1.5,
    30,
    '#4169E1',
    750,
    'High fire rate, moderate damage.',
    false
  ),
  [WeaponType.LASER]: createWeapon(
    WeaponType.LASER,
    'Laser Gun',
    6,
    15,
    20,
    2,
    0,
    1,
    true,
    0.5,
    50,
    '#00FFFF',
    1000,
    'Rapid fire piercing shots. Low damage per hit.',
    false
  ),
  [WeaponType.ROCKET]: createWeapon(
    WeaponType.ROCKET,
    'Rocket Launcher',
    40,
    0.8,
    8,
    8,
    0,
    1,
    false,
    3.0,
    4,
    '#FF4500',
    1500,
    'Massive damage, slow fire rate.',
    false
  ),
  [WeaponType.PLASMA]: createWeapon(
    WeaponType.PLASMA,
    'Plasma Cannon',
    18,
    4,
    11,
    6,
    3,
    1,
    true,
    1.8,
    20,
    '#9370DB',
    2000,
    'Piercing plasma bolts with splash damage.',
    false
  ),
  [WeaponType.SNIPER]: createWeapon(
    WeaponType.SNIPER,
    'Sniper Rifle',
    60,
    1,
    25,
    2,
    0,
    1,
    true,
    2.5,
    5,
    '#FFFFFF',
    2500,
    'Extreme damage and range. Slow fire rate.',
    false
  ),
  [WeaponType.MINIGUN]: createWeapon(
    WeaponType.MINIGUN,
    'Minigun',
    8,
    12,
    13,
    3,
    5,
    1,
    false,
    2.0,
    100,
    '#FF8C00',
    3000,
    'Overwhelming fire rate. High ammo capacity.',
    false
  ),
};

/**
 * Get weapon by type
 */
export const getWeapon = (type: WeaponType): Weapon => {
  return { ...WEAPONS[type] };
};

/**
 * Get all unlocked weapons
 */
export const getUnlockedWeapons = (unlockedSet: Set<string>): Weapon[] => {
  return Object.values(WEAPONS).filter((weapon) => 
    weapon.unlocked || unlockedSet.has(weapon.id)
  );
};

/**
 * Get all weapons available for purchase
 */
export const getShopWeapons = (): Weapon[] => {
  return Object.values(WEAPONS).filter((weapon) => !weapon.unlocked);
};

/**
 * Calculate effective fire rate with powerups
 */
export const calculateFireRate = (baseRate: number, fireRateBonus: number): number => {
  return baseRate * (1 + fireRateBonus);
};

/**
 * Calculate effective damage with powerups
 */
export const calculateDamage = (baseDamage: number, damageBonus: number): number => {
  return baseDamage * (1 + damageBonus);
};
