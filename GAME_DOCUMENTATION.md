# Boss Rush Game - Complete Documentation

## Architecture Overview

A professional-grade boss rush game built with React, TypeScript, and Canvas rendering. The architecture follows SOLID principles with clear separation of concerns.

### Core Architecture Components

```
/src/app/
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks for game logic
├── utils/              # Pure utility functions (generators, calculators)
├── components/         # React UI components
└── App.tsx            # Main application orchestrator
```

## System Architecture

### 1. **Type System** (`types/game-types.ts`)
- Comprehensive TypeScript interfaces for all game entities
- Ensures type safety across the entire codebase
- Includes: Entity, Weapon, Boss, Projectile, Powerup, Player, GameState

### 2. **Game Engine** (`hooks/useGameEngine.ts`)
- **Responsibility**: Main game loop, physics, collision detection
- **Pattern**: Custom React hook with RAF (RequestAnimationFrame) loop
- **Features**:
  - 60 FPS game loop
  - Player movement with WASD/Arrow keys
  - Weapon firing and reloading system
  - Boss AI with multiple attack patterns
  - Collision detection (AABB with circular hitboxes)
  - Wave progression system
  - Powerup spawning and effects

### 3. **Inventory System** (`hooks/useInventory.ts`)
- **Responsibility**: Weapon unlocks, currency management
- **Pattern**: Custom hook with localStorage persistence
- **Features**:
  - Rivals-style shop system
  - Currency earned from boss defeats
  - Weapon unlock progression
  - Persistent data across sessions

### 4. **Procedural Generation** (`utils/boss-generator.ts`)
- **Responsibility**: Generate random bosses with difficulty scaling
- **Algorithm**: Exponential difficulty curve (30% per wave)
- **Features**:
  - Random boss names (prefix + suffix)
  - Multiple attack patterns (7 types)
  - Multiple movement patterns (6 types)
  - Difficulty-scaled stats (health, damage, speed)
  - Multi-boss waves at higher difficulties

### 5. **Weapon System** (`utils/weapon-system.ts`)
- **Responsibility**: Weapon definitions and balance
- **Pattern**: Factory pattern with configuration objects
- **Weapons** (8 total):
  - Pistol (starter, free)
  - Shotgun (spread fire)
  - Rifle (rapid fire)
  - Laser (piercing)
  - Rocket (high damage)
  - Plasma (piercing heavy)
  - Sniper (extreme damage)
  - Minigun (overwhelming fire rate)

### 6. **Powerup System** (`utils/powerup-system.ts`)
- **Responsibility**: Buff generation and effects
- **Powerups** (6 types):
  - Health (instant heal)
  - Damage (+50% for 10s)
  - Fire Rate (+50% for 10s)
  - Speed (+40% for 8s)
  - Shield (50 HP for 15s)
  - Multi-Shot (+2 projectiles for 12s)

## Rendering Architecture

### Canvas Rendering (`components/GameCanvas.tsx`)
- **Technology**: Native HTML5 Canvas with 2D context
- **Pattern**: Separate RAF loop for rendering (decoupled from game logic)
- **Optimization**: Only redraws when state changes
- **Effects**: Shadow blur for glowing effects, health bars, particle trails

### UI Layer (`components/`)
- **Pattern**: Overlay components rendered above canvas
- **Components**:
  - `GameHUD`: Real-time stats, health, ammo, powerups
  - `MainMenu`: Entry point with navigation
  - `WeaponShop`: Purchase interface (Rivals-style)
  - `WeaponSelect`: Dual weapon loadout selection
  - `BossEditor`: WYSIWYG boss creator

## Boss Editor

### Features
- **Visual Boss Builder**: Real-time preview
- **Customizable Properties**:
  - Name, health, size, speed
  - Color selection
  - Movement pattern
  - Multiple attacks with individual configs
- **Attack Designer**:
  - 7 attack patterns (straight, spread, circle, spiral, homing, rain, laser)
  - Damage, speed, cooldown, projectile count
  - Color customization
- **Boss Library**: Save/load custom bosses
- **Custom Rush Mode**: Fight your created bosses in sequence

## Attack Patterns

1. **STRAIGHT**: Single projectile towards player
2. **SPREAD**: Wide arc of projectiles
3. **CIRCLE**: 360° omnidirectional burst
4. **SPIRAL**: Rotating projectiles over time
5. **HOMING**: Slower tracking projectiles
6. **RAIN**: Random projectiles from top
7. **LASER**: Fast piercing shots

## Movement Patterns

1. **STATIONARY**: Fixed position
2. **HORIZONTAL**: Sine wave left-right
3. **VERTICAL**: Sine wave up-down
4. **CIRCULAR**: Orbit around center point
5. **ERRATIC**: Random direction changes
6. **CHASE**: Slow approach towards player

## Game Flow

```
Main Menu
    ↓
Weapon Selection (choose 2)
    ↓
Game Start (Wave 1)
    ↓
Defeat Bosses → Earn Currency → Collect Powerups
    ↓
Wave Complete → Next Wave (harder)
    ↓
Game Over → Currency Added to Inventory
    ↓
Shop → Unlock Weapons → Repeat
```

## Performance Optimizations

1. **Separate Render Loop**: Game logic and rendering decoupled
2. **Object Pooling**: Reuse projectile/entity objects (implicit via array management)
3. **Efficient Collision**: Simple distance checks before complex calculations
4. **requestAnimationFrame**: Browser-optimized rendering at 60 FPS
5. **Canvas Clearing**: Full clear instead of tracking dirty regions (simpler, faster for this scale)

## State Management

- **Game State**: Managed by useGameEngine hook
- **Inventory State**: Managed by useInventory hook with localStorage
- **UI State**: Local component state in App.tsx
- **Custom Bosses**: localStorage persistence

## Edge Cases Handled

1. **Empty Magazine**: Auto-reload triggered
2. **No Weapons Selected**: Validation before game start
3. **Boss Defeat Mid-Attack**: Projectiles continue but boss removed
4. **Invulnerability Frames**: 0.5s after hit to prevent instant death
5. **Boundary Collision**: Entities clamped within canvas bounds
6. **Powerup Stacking**: Multiple powerups of same type stack additively
7. **Wave Transition**: 2-second delay with UI feedback
8. **localStorage Failure**: Graceful fallback to default state

## Controls

- **Movement**: WASD or Arrow Keys
- **Fire**: Spacebar (hold for auto-fire)
- **Switch Weapon**: Q
- **Reload**: R (or auto when empty)
- **Pause**: ESC

## Scaling Considerations

### Current Limitations
- Canvas-based (max ~1000 entities before slowdown)
- Single-threaded JavaScript (no Web Workers)
- localStorage size limit (~5-10MB depending on browser)

### Future Enhancements
- **WebGL Rendering**: For >1000 simultaneous entities
- **Worker Threads**: Offload physics calculations
- **IndexedDB**: For larger custom boss libraries
- **Multiplayer**: WebSocket integration for co-op
- **Mobile Support**: Touch controls and responsive canvas

## Code Quality Features

- ✅ **TypeScript**: Full type coverage, no `any` types
- ✅ **JSDoc Comments**: All functions documented
- ✅ **SOLID Principles**: Single responsibility, dependency injection
- ✅ **DRY**: Reusable utility functions, no duplication
- ✅ **Error Handling**: Try-catch for localStorage operations
- ✅ **Performance**: RAF loops, efficient collision detection
- ✅ **Maintainability**: Clear file structure, modular components

## Usage Example

### Basic Game Flow
```typescript
// User starts game
1. Select weapons from shop (Rivals-style inventory)
2. Choose 2 weapons for loadout
3. Start game → bosses spawn
4. Defeat bosses → collect currency + powerups
5. Game over → currency saved to inventory
6. Return to shop → unlock better weapons
7. Repeat with stronger loadout

// Custom Boss Mode
1. Open Boss Editor
2. Design boss (stats, attacks, movement)
3. Save to library
4. Click "Fight" or "Fight All"
5. Select weapons → battle custom bosses
```

## Testing Scenarios

1. **Normal Progression**: Play through waves 1-10
2. **Weapon Variety**: Test all 8 weapons for balance
3. **Powerup Stacking**: Collect multiple of same type
4. **Boss Editor**: Create and fight custom boss
5. **Shop System**: Earn currency and unlock weapons
6. **Pause/Resume**: Test ESC key functionality
7. **localStorage**: Clear storage and verify reset

---

**Built with**: React 18, TypeScript, Canvas API, Tailwind CSS
**Performance**: 60 FPS target on modern hardware
**Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)
