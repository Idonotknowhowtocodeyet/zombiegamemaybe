/**
 * @fileoverview Core type definitions for the Boss Rush game
 * All game entities, state, and configuration types
 */

/**
 * 2D Vector for position and velocity
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Base entity with physics properties
 */
export interface Entity {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  size: number;
  health: number;
  maxHealth: number;
  rotation: number;
}

/**
 * Weapon types available in the game
 */
export enum WeaponType {
  PISTOL = 'PISTOL',
  SHOTGUN = 'SHOTGUN',
  RIFLE = 'RIFLE',
  LASER = 'LASER',
  ROCKET = 'ROCKET',
  PLASMA = 'PLASMA',
  SNIPER = 'SNIPER',
  MINIGUN = 'MINIGUN',
}

/**
 * Weapon configuration and stats
 */
export interface Weapon {
  id: string;
  type: WeaponType;
  name: string;
  damage: number;
  fireRate: number; // Shots per second
  projectileSpeed: number;
  projectileSize: number;
  spread: number; // Degrees
  projectileCount: number; // For shotgun-like weapons
  piercing: boolean;
  reloadTime: number;
  magazineSize: number;
  color: string;
  cost: number; // Currency cost in shop
  unlocked: boolean;
  description: string;
}

/**
 * Projectile fired by weapons or bosses
 */
export interface Projectile extends Entity {
  damage: number;
  color: string;
  piercing: boolean;
  lifetime: number;
  ownerId: string; // ID of the entity that fired it
}

/**
 * Boss attack pattern types
 */
export enum AttackPattern {
  STRAIGHT = 'STRAIGHT',
  SPREAD = 'SPREAD',
  CIRCLE = 'CIRCLE',
  SPIRAL = 'SPIRAL',
  HOMING = 'HOMING',
  LASER = 'LASER',
  RAIN = 'RAIN',
}

/**
 * Boss attack configuration
 */
export interface BossAttack {
  pattern: AttackPattern;
  damage: number;
  projectileSpeed: number;
  projectileCount: number;
  cooldown: number;
  lastFired: number;
  color: string;
}

/**
 * Boss movement pattern types
 */
export enum MovementPattern {
  STATIONARY = 'STATIONARY',
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
  CIRCULAR = 'CIRCULAR',
  ERRATIC = 'ERRATIC',
  CHASE = 'CHASE',
}

/**
 * Boss entity with AI and attack patterns
 */
export interface Boss extends Entity {
  name: string;
  movementPattern: MovementPattern;
  attacks: BossAttack[];
  speed: number;
  color: string;
  wave: number; // Which wave this boss appears in
  reward: number; // Currency reward on defeat
  movementTimer: number;
  movementTarget?: Vector2D;
}

/**
 * Powerup types
 */
export enum PowerupType {
  HEALTH = 'HEALTH',
  DAMAGE = 'DAMAGE',
  FIRE_RATE = 'FIRE_RATE',
  SPEED = 'SPEED',
  SHIELD = 'SHIELD',
  MULTI_SHOT = 'MULTI_SHOT',
}

/**
 * Collectible powerup
 */
export interface Powerup extends Entity {
  type: PowerupType;
  value: number;
  duration: number; // 0 for instant effects
  color: string;
}

/**
 * Player entity
 */
export interface Player extends Entity {
  speed: number;
  weapons: [Weapon | null, Weapon | null]; // Two weapon slots
  currentWeaponIndex: 0 | 1;
  currency: number;
  activePowerups: ActivePowerup[];
  invulnerabilityTime: number; // Frame immunity after hit
  magazineAmmo: [number, number]; // Current ammo for each weapon
  reloadingWeapon: [boolean, boolean];
}

/**
 * Active powerup effect on player
 */
export interface ActivePowerup {
  type: PowerupType;
  value: number;
  endTime: number;
}

/**
 * Game state
 */
export interface GameState {
  player: Player;
  bosses: Boss[];
  projectiles: Projectile[];
  powerups: Powerup[];
  wave: number;
  score: number;
  gameTime: number;
  isPaused: boolean;
  isGameOver: boolean;
  waveTransition: boolean;
  customBosses: Boss[]; // User-created bosses
}

/**
 * Game mode
 */
export enum GameMode {
  MAIN_MENU = 'MAIN_MENU',
  WEAPON_SELECT = 'WEAPON_SELECT',
  SHOP = 'SHOP',
  PLAYING = 'PLAYING',
  BOSS_EDITOR = 'BOSS_EDITOR',
  CUSTOM_BOSS_RUSH = 'CUSTOM_BOSS_RUSH',
}

/**
 * Input state for controls
 */
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
  switchWeapon: boolean;
  reload: boolean;
}

/**
 * Canvas dimensions
 */
export interface CanvasDimensions {
  width: number;
  height: number;
}

/**
 * Inventory state for shop and weapon unlocks
 */
export interface InventoryState {
  weapons: Map<string, Weapon>;
  currency: number;
  unlockedWeapons: Set<string>;
}

/**
 * Boss editor state
 */
export interface BossEditorState {
  boss: Partial<Boss>;
  savedBosses: Boss[];
  editingBossId: string | null;
}
