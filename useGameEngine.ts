/**
 * @fileoverview Main game engine hook
 * Handles game loop, physics, collision detection, and game state
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GameState,
  Player,
  Boss,
  Projectile,
  Powerup,
  InputState,
  Vector2D,
  Weapon,
  AttackPattern,
  MovementPattern,
  PowerupType,
  ActivePowerup,
} from '../types/game-types';
import { generateBossWave, cloneBoss } from '../utils/boss-generator';
import { spawnPowerupRandomly, spawnPowerupAtBossDeath } from '../utils/powerup-system';
import { calculateDamage, calculateFireRate } from '../utils/weapon-system';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 20;
const PLAYER_SPEED = 5;
const PLAYER_MAX_HEALTH = 100;

/**
 * Main game engine hook
 * Manages all game logic, physics, and state updates
 */
export const useGameEngine = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  // Game state
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [selectedWeapons, setSelectedWeapons] = useState<[Weapon | null, Weapon | null]>([null, null]);
  
  // Input state
  const inputState = useRef<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false,
    switchWeapon: false,
    reload: false,
  });

  // Game loop timing
  const lastFireTime = useRef<[number, number]>([0, 0]);
  const animationFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(performance.now());

  /**
   * Create initial game state
   */
  function createInitialGameState(): GameState {
    return {
      player: {
        id: 'player',
        position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 80 },
        velocity: { x: 0, y: 0 },
        size: PLAYER_SIZE,
        health: PLAYER_MAX_HEALTH,
        maxHealth: PLAYER_MAX_HEALTH,
        rotation: 0,
        speed: PLAYER_SPEED,
        weapons: [null, null],
        currentWeaponIndex: 0,
        currency: 0,
        activePowerups: [],
        invulnerabilityTime: 0,
        magazineAmmo: [0, 0],
        reloadingWeapon: [false, false],
      },
      bosses: [],
      projectiles: [],
      powerups: [],
      wave: 1,
      score: 0,
      gameTime: 0,
      isPaused: false,
      isGameOver: false,
      waveTransition: false,
      customBosses: [],
    };
  }

  /**
   * Start new game with selected weapons
   */
  const startGame = useCallback((weapon1: Weapon | null, weapon2: Weapon | null, customBosses?: Boss[]) => {
    const initialState = createInitialGameState();
    
    initialState.player.weapons = [weapon1, weapon2];
    initialState.player.magazineAmmo = [
      weapon1?.magazineSize || 0,
      weapon2?.magazineSize || 0,
    ];
    
    if (customBosses && customBosses.length > 0) {
      // Custom boss rush mode
      initialState.customBosses = customBosses;
      initialState.bosses = [cloneBoss(customBosses[0], CANVAS_WIDTH, CANVAS_HEIGHT)];
    } else {
      // Normal mode - generate first wave
      initialState.bosses = generateBossWave(1, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    setGameState(initialState);
    setSelectedWeapons([weapon1, weapon2]);
    lastFireTime.current = [0, 0];
    lastFrameTime.current = performance.now();
  }, []);

  /**
   * Reset game to initial state
   */
  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    lastFireTime.current = [0, 0];
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  /**
   * Toggle pause
   */
  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  /**
   * Update input state from keyboard events
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    switch (key) {
      case 'w':
      case 'arrowup':
        inputState.current.up = true;
        break;
      case 's':
      case 'arrowdown':
        inputState.current.down = true;
        break;
      case 'a':
      case 'arrowleft':
        inputState.current.left = true;
        break;
      case 'd':
      case 'arrowright':
        inputState.current.right = true;
        break;
      case ' ':
        e.preventDefault();
        inputState.current.fire = true;
        break;
      case 'q':
        inputState.current.switchWeapon = true;
        break;
      case 'r':
        inputState.current.reload = true;
        break;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    switch (key) {
      case 'w':
      case 'arrowup':
        inputState.current.up = false;
        break;
      case 's':
      case 'arrowdown':
        inputState.current.down = false;
        break;
      case 'a':
      case 'arrowleft':
        inputState.current.left = false;
        break;
      case 'd':
      case 'arrowright':
        inputState.current.right = false;
        break;
      case ' ':
        inputState.current.fire = false;
        break;
      case 'q':
        inputState.current.switchWeapon = false;
        break;
      case 'r':
        inputState.current.reload = false;
        break;
    }
  }, []);

  /**
   * Set up keyboard event listeners
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  /**
   * Check collision between two entities
   */
  const checkCollision = (pos1: Vector2D, size1: number, pos2: Vector2D, size2: number): boolean => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (size1 + size2) / 2;
  };

  /**
   * Fire player weapon
   */
  const fireWeapon = (player: Player, currentTime: number): Projectile[] => {
    const newProjectiles: Projectile[] = [];
    const weaponIndex = player.currentWeaponIndex;
    const weapon = player.weapons[weaponIndex];
    
    if (!weapon || player.magazineAmmo[weaponIndex] <= 0 || player.reloadingWeapon[weaponIndex]) {
      return newProjectiles;
    }

    // Get powerup bonuses
    const fireRateBonus = player.activePowerups
      .filter((p) => p.type === PowerupType.FIRE_RATE)
      .reduce((sum, p) => sum + p.value, 0);
    
    const damageBonus = player.activePowerups
      .filter((p) => p.type === PowerupType.DAMAGE)
      .reduce((sum, p) => sum + p.value, 0);
    
    const multiShotBonus = player.activePowerups
      .filter((p) => p.type === PowerupType.MULTI_SHOT)
      .reduce((sum, p) => sum + p.value, 0);

    const effectiveFireRate = calculateFireRate(weapon.fireRate, fireRateBonus);
    const timeSinceLastFire = currentTime - lastFireTime.current[weaponIndex];
    
    if (timeSinceLastFire < 1000 / effectiveFireRate) {
      return newProjectiles;
    }

    lastFireTime.current[weaponIndex] = currentTime;
    
    // Decrease ammo
    player.magazineAmmo[weaponIndex]--;

    const effectiveDamage = calculateDamage(weapon.damage, damageBonus);
    const totalProjectiles = weapon.projectileCount + multiShotBonus;
    
    // Create projectiles
    for (let i = 0; i < totalProjectiles; i++) {
      const spreadAngle = weapon.spread;
      const angleOffset = (i - (totalProjectiles - 1) / 2) * spreadAngle * (Math.PI / 180);
      
      const velocity: Vector2D = {
        x: Math.sin(angleOffset) * weapon.projectileSpeed,
        y: -Math.cos(angleOffset) * weapon.projectileSpeed,
      };

      newProjectiles.push({
        id: `proj-${Date.now()}-${i}-${Math.random()}`,
        position: { ...player.position },
        velocity,
        size: weapon.projectileSize,
        health: 1,
        maxHealth: 1,
        rotation: 0,
        damage: effectiveDamage,
        color: weapon.color,
        piercing: weapon.piercing,
        lifetime: 180, // 3 seconds at 60fps
        ownerId: player.id,
      });
    }

    return newProjectiles;
  };

  /**
   * Reload weapon
   */
  const reloadWeapon = (player: Player, weaponIndex: 0 | 1) => {
    const weapon = player.weapons[weaponIndex];
    if (!weapon || player.reloadingWeapon[weaponIndex]) return;
    
    player.reloadingWeapon[weaponIndex] = true;
    
    setTimeout(() => {
      player.magazineAmmo[weaponIndex] = weapon.magazineSize;
      player.reloadingWeapon[weaponIndex] = false;
    }, weapon.reloadTime * 1000);
  };

  /**
   * Fire boss attack
   */
  const fireBossAttack = (boss: Boss, player: Player, currentTime: number): Projectile[] => {
    const newProjectiles: Projectile[] = [];

    boss.attacks.forEach((attack, index) => {
      const timeSinceLastFire = (currentTime - attack.lastFired) / 1000;
      
      if (timeSinceLastFire < attack.cooldown) return;

      attack.lastFired = currentTime;

      const dirToPlayer = {
        x: player.position.x - boss.position.x,
        y: player.position.y - boss.position.y,
      };
      const dist = Math.sqrt(dirToPlayer.x ** 2 + dirToPlayer.y ** 2);
      const normalizedDir = { x: dirToPlayer.x / dist, y: dirToPlayer.y / dist };

      switch (attack.pattern) {
        case AttackPattern.STRAIGHT:
          newProjectiles.push({
            id: `boss-proj-${Date.now()}-${index}`,
            position: { ...boss.position },
            velocity: {
              x: normalizedDir.x * attack.projectileSpeed,
              y: normalizedDir.y * attack.projectileSpeed,
            },
            size: 6,
            health: 1,
            maxHealth: 1,
            rotation: 0,
            damage: attack.damage,
            color: attack.color,
            piercing: false,
            lifetime: 300,
            ownerId: boss.id,
          });
          break;

        case AttackPattern.SPREAD:
          for (let i = 0; i < attack.projectileCount; i++) {
            const angle = (i / attack.projectileCount) * Math.PI - Math.PI / 2;
            newProjectiles.push({
              id: `boss-proj-${Date.now()}-${index}-${i}`,
              position: { ...boss.position },
              velocity: {
                x: Math.cos(angle) * attack.projectileSpeed,
                y: Math.sin(angle) * attack.projectileSpeed,
              },
              size: 5,
              health: 1,
              maxHealth: 1,
              rotation: 0,
              damage: attack.damage,
              color: attack.color,
              piercing: false,
              lifetime: 300,
              ownerId: boss.id,
            });
          }
          break;

        case AttackPattern.CIRCLE:
          for (let i = 0; i < attack.projectileCount; i++) {
            const angle = (i / attack.projectileCount) * Math.PI * 2;
            newProjectiles.push({
              id: `boss-proj-${Date.now()}-${index}-${i}`,
              position: { ...boss.position },
              velocity: {
                x: Math.cos(angle) * attack.projectileSpeed,
                y: Math.sin(angle) * attack.projectileSpeed,
              },
              size: 5,
              health: 1,
              maxHealth: 1,
              rotation: 0,
              damage: attack.damage,
              color: attack.color,
              piercing: false,
              lifetime: 300,
              ownerId: boss.id,
            });
          }
          break;

        case AttackPattern.SPIRAL:
          for (let i = 0; i < 3; i++) {
            const angle = (currentTime / 1000) * 2 + (i * Math.PI * 2) / 3;
            newProjectiles.push({
              id: `boss-proj-${Date.now()}-${index}-${i}`,
              position: { ...boss.position },
              velocity: {
                x: Math.cos(angle) * attack.projectileSpeed,
                y: Math.sin(angle) * attack.projectileSpeed,
              },
              size: 5,
              health: 1,
              maxHealth: 1,
              rotation: 0,
              damage: attack.damage,
              color: attack.color,
              piercing: false,
              lifetime: 300,
              ownerId: boss.id,
            });
          }
          break;

        case AttackPattern.HOMING:
          newProjectiles.push({
            id: `boss-proj-${Date.now()}-${index}`,
            position: { ...boss.position },
            velocity: {
              x: normalizedDir.x * attack.projectileSpeed * 0.7,
              y: normalizedDir.y * attack.projectileSpeed * 0.7,
            },
            size: 7,
            health: 1,
            maxHealth: 1,
            rotation: 0,
            damage: attack.damage,
            color: attack.color,
            piercing: false,
            lifetime: 400,
            ownerId: boss.id,
          });
          break;

        case AttackPattern.RAIN:
          for (let i = 0; i < attack.projectileCount; i++) {
            newProjectiles.push({
              id: `boss-proj-${Date.now()}-${index}-${i}`,
              position: {
                x: Math.random() * CANVAS_WIDTH,
                y: 0,
              },
              velocity: { x: 0, y: attack.projectileSpeed },
              size: 6,
              health: 1,
              maxHealth: 1,
              rotation: 0,
              damage: attack.damage,
              color: attack.color,
              piercing: false,
              lifetime: 200,
              ownerId: boss.id,
            });
          }
          break;

        case AttackPattern.LASER:
          newProjectiles.push({
            id: `boss-proj-${Date.now()}-${index}`,
            position: { ...boss.position },
            velocity: {
              x: normalizedDir.x * attack.projectileSpeed * 1.5,
              y: normalizedDir.y * attack.projectileSpeed * 1.5,
            },
            size: 3,
            health: 1,
            maxHealth: 1,
            rotation: 0,
            damage: attack.damage * 0.5,
            color: attack.color,
            piercing: true,
            lifetime: 200,
            ownerId: boss.id,
          });
          break;
      }
    });

    return newProjectiles;
  };

  /**
   * Update boss movement
   */
  const updateBossMovement = (boss: Boss, deltaTime: number) => {
    boss.movementTimer += deltaTime;

    switch (boss.movementPattern) {
      case MovementPattern.HORIZONTAL:
        boss.velocity.x = Math.sin(boss.movementTimer * 0.002) * boss.speed;
        break;

      case MovementPattern.VERTICAL:
        boss.velocity.y = Math.sin(boss.movementTimer * 0.002) * boss.speed * 0.5;
        break;

      case MovementPattern.CIRCULAR:
        const radius = 100;
        const centerX = CANVAS_WIDTH / 2;
        const centerY = 150;
        boss.position.x = centerX + Math.cos(boss.movementTimer * 0.001) * radius;
        boss.position.y = centerY + Math.sin(boss.movementTimer * 0.001) * radius;
        boss.velocity = { x: 0, y: 0 };
        break;

      case MovementPattern.ERRATIC:
        if (boss.movementTimer % 1000 < 16) {
          boss.velocity.x = (Math.random() - 0.5) * boss.speed * 2;
          boss.velocity.y = (Math.random() - 0.5) * boss.speed;
        }
        break;

      case MovementPattern.CHASE:
        // Slowly move towards player
        const player = gameState.player;
        const dx = player.position.x - boss.position.x;
        const dy = player.position.y - boss.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 200) {
          boss.velocity.x = (dx / dist) * boss.speed * 0.5;
          boss.velocity.y = (dy / dist) * boss.speed * 0.5;
        }
        break;

      case MovementPattern.STATIONARY:
      default:
        boss.velocity = { x: 0, y: 0 };
        break;
    }

    // Apply velocity and boundaries
    boss.position.x += boss.velocity.x;
    boss.position.y += boss.velocity.y;

    // Keep boss in bounds
    boss.position.x = Math.max(boss.size, Math.min(CANVAS_WIDTH - boss.size, boss.position.x));
    boss.position.y = Math.max(boss.size, Math.min(CANVAS_HEIGHT / 2, boss.position.y));
  };

  /**
   * Main game loop update
   */
  const updateGame = useCallback((currentTime: number) => {
    if (gameState.isPaused || gameState.isGameOver) return;

    const deltaTime = currentTime - lastFrameTime.current;
    lastFrameTime.current = currentTime;

    setGameState((prevState) => {
      const newState = { ...prevState };
      const player = { ...newState.player };

      // Update game time
      newState.gameTime += deltaTime;

      // Update player movement
      const speedBonus = player.activePowerups
        .filter((p) => p.type === PowerupType.SPEED)
        .reduce((sum, p) => sum + p.value, 0);
      
      const effectiveSpeed = player.speed * (1 + speedBonus);

      player.velocity = { x: 0, y: 0 };
      
      if (inputState.current.up) player.velocity.y -= effectiveSpeed;
      if (inputState.current.down) player.velocity.y += effectiveSpeed;
      if (inputState.current.left) player.velocity.x -= effectiveSpeed;
      if (inputState.current.right) player.velocity.x += effectiveSpeed;

      // Normalize diagonal movement
      const velMag = Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2);
      if (velMag > effectiveSpeed) {
        player.velocity.x = (player.velocity.x / velMag) * effectiveSpeed;
        player.velocity.y = (player.velocity.y / velMag) * effectiveSpeed;
      }

      player.position.x += player.velocity.x;
      player.position.y += player.velocity.y;

      // Keep player in bounds
      player.position.x = Math.max(player.size, Math.min(CANVAS_WIDTH - player.size, player.position.x));
      player.position.y = Math.max(CANVAS_HEIGHT / 2 + player.size, Math.min(CANVAS_HEIGHT - player.size, player.position.y));

      // Handle weapon switching
      if (inputState.current.switchWeapon) {
        player.currentWeaponIndex = player.currentWeaponIndex === 0 ? 1 : 0;
        inputState.current.switchWeapon = false;
      }

      // Handle reload
      if (inputState.current.reload) {
        reloadWeapon(player, player.currentWeaponIndex);
        inputState.current.reload = false;
      }

      // Auto-reload when empty
      if (player.magazineAmmo[player.currentWeaponIndex] === 0 && !player.reloadingWeapon[player.currentWeaponIndex]) {
        reloadWeapon(player, player.currentWeaponIndex);
      }

      // Fire weapon
      let newProjectiles: Projectile[] = [...newState.projectiles];
      
      if (inputState.current.fire) {
        const firedProjectiles = fireWeapon(player, currentTime);
        newProjectiles = [...newProjectiles, ...firedProjectiles];
      }

      // Update bosses
      const updatedBosses = [...newState.bosses];
      
      updatedBosses.forEach((boss) => {
        updateBossMovement(boss, deltaTime);
        
        // Boss fires at player
        const bossProjectiles = fireBossAttack(boss, player, currentTime);
        newProjectiles = [...newProjectiles, ...bossProjectiles];
      });

      // Update projectiles
      newProjectiles = newProjectiles
        .map((proj) => ({
          ...proj,
          position: {
            x: proj.position.x + proj.velocity.x,
            y: proj.position.y + proj.velocity.y,
          },
          lifetime: proj.lifetime - 1,
        }))
        .filter((proj) => {
          // Remove out of bounds or expired
          return (
            proj.lifetime > 0 &&
            proj.position.x > -50 &&
            proj.position.x < CANVAS_WIDTH + 50 &&
            proj.position.y > -50 &&
            proj.position.y < CANVAS_HEIGHT + 50
          );
        });

      // Collision detection - projectiles vs bosses
      const projectilesToRemove = new Set<string>();
      const bossesToRemove = new Set<string>();
      
      newProjectiles.forEach((proj) => {
        if (proj.ownerId === player.id) {
          // Player projectile hits boss
          updatedBosses.forEach((boss) => {
            if (!bossesToRemove.has(boss.id) && checkCollision(proj.position, proj.size, boss.position, boss.size)) {
              boss.health -= proj.damage;
              
              if (boss.health <= 0) {
                bossesToRemove.add(boss.id);
                player.currency += boss.reward;
                newState.score += boss.reward;
                
                // Spawn powerup
                const powerup = spawnPowerupAtBossDeath(boss.position);
                if (powerup) {
                  newState.powerups.push(powerup);
                }
              }
              
              if (!proj.piercing) {
                projectilesToRemove.add(proj.id);
              }
            }
          });
        } else {
          // Boss projectile hits player
          if (player.invulnerabilityTime <= 0 && checkCollision(proj.position, proj.size, player.position, player.size)) {
            player.health -= proj.damage;
            player.invulnerabilityTime = 30; // 0.5 seconds
            projectilesToRemove.add(proj.id);
            
            if (player.health <= 0) {
              newState.isGameOver = true;
            }
          }
        }
      });

      // Remove hit projectiles and dead bosses
      newProjectiles = newProjectiles.filter((proj) => !projectilesToRemove.has(proj.id));
      newState.bosses = updatedBosses.filter((boss) => !bossesToRemove.has(boss.id));

      // Update powerups
      newState.powerups.forEach((powerup) => {
        // Check collision with player
        if (checkCollision(powerup.position, powerup.size, player.position, player.size)) {
          // Apply powerup effect
          if (powerup.type === PowerupType.HEALTH) {
            player.health = Math.min(player.maxHealth, player.health + powerup.value);
          } else if (powerup.duration > 0) {
            // Timed powerup
            player.activePowerups.push({
              type: powerup.type,
              value: powerup.value,
              endTime: currentTime + powerup.duration * 1000,
            });
          }
          
          powerup.health = 0;
        }
      });

      newState.powerups = newState.powerups.filter((p) => p.health > 0);

      // Update active powerups
      player.activePowerups = player.activePowerups.filter((p) => p.endTime > currentTime);

      // Decrement invulnerability
      if (player.invulnerabilityTime > 0) {
        player.invulnerabilityTime--;
      }

      // Check wave completion
      if (newState.bosses.length === 0 && !newState.waveTransition) {
        newState.waveTransition = true;
        
        setTimeout(() => {
          setGameState((prev) => {
            if (prev.customBosses.length > 0) {
              // Custom boss rush
              const nextBossIndex = prev.wave;
              if (nextBossIndex < prev.customBosses.length) {
                return {
                  ...prev,
                  wave: prev.wave + 1,
                  bosses: [cloneBoss(prev.customBosses[nextBossIndex], CANVAS_WIDTH, CANVAS_HEIGHT)],
                  waveTransition: false,
                };
              } else {
                // All custom bosses defeated
                return { ...prev, isGameOver: true, waveTransition: false };
              }
            } else {
              // Normal mode
              return {
                ...prev,
                wave: prev.wave + 1,
                bosses: generateBossWave(prev.wave + 1, CANVAS_WIDTH, CANVAS_HEIGHT),
                waveTransition: false,
              };
            }
          });
        }, 2000);
      }

      // Random powerup spawn
      if (Math.random() < 0.001) {
        const powerup = spawnPowerupRandomly(1, CANVAS_WIDTH, CANVAS_HEIGHT);
        if (powerup) {
          newState.powerups.push(powerup);
        }
      }

      newState.player = player;
      newState.projectiles = newProjectiles;

      return newState;
    });
  }, [gameState.isPaused, gameState.isGameOver]);

  /**
   * Start game loop
   */
  useEffect(() => {
    if (gameState.bosses.length === 0 || gameState.isPaused || gameState.isGameOver) {
      return;
    }

    const gameLoop = (time: number) => {
      updateGame(time);
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState.bosses.length, gameState.isPaused, gameState.isGameOver, updateGame]);

  return {
    gameState,
    startGame,
    resetGame,
    togglePause,
    canvasDimensions: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  };
};
