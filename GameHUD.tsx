/**
 * @fileoverview Game HUD (Heads-Up Display)
 * Shows player stats, weapon info, and active powerups
 */

import { GameState, PowerupType } from '../types/game-types';

interface GameHUDProps {
  gameState: GameState;
}

/**
 * In-game HUD component
 */
export const GameHUD: React.FC<GameHUDProps> = ({ gameState }) => {
  const { player, wave, score } = gameState;
  const currentWeapon = player.weapons[player.currentWeaponIndex];
  const otherWeapon = player.weapons[player.currentWeaponIndex === 0 ? 1 : 0];

  /**
   * Get powerup icon/color
   */
  const getPowerupDisplay = (type: PowerupType): { emoji: string; color: string } => {
    switch (type) {
      case PowerupType.DAMAGE:
        return { emoji: '⚔️', color: '#FF0000' };
      case PowerupType.FIRE_RATE:
        return { emoji: '⚡', color: '#FFD700' };
      case PowerupType.SPEED:
        return { emoji: '💨', color: '#00FFFF' };
      case PowerupType.SHIELD:
        return { emoji: '🛡️', color: '#4169E1' };
      case PowerupType.MULTI_SHOT:
        return { emoji: '🎯', color: '#FF00FF' };
      default:
        return { emoji: '❓', color: '#fff' };
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none">
      <div className="flex justify-between items-start">
        {/* Left side - Player stats */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-green-500/50">
          {/* Health bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-sm font-bold">HP</span>
              <span className="text-white text-xs">
                {Math.max(0, player.health)} / {player.maxHealth}
              </span>
            </div>
            <div className="w-48 h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${Math.max(0, (player.health / player.maxHealth) * 100)}%`,
                  backgroundColor:
                    player.health / player.maxHealth > 0.5
                      ? '#00ff00'
                      : player.health / player.maxHealth > 0.25
                      ? '#ffff00'
                      : '#ff0000',
                }}
              />
            </div>
          </div>

          {/* Currency */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400 text-lg">💰</span>
            <span className="text-yellow-400 font-bold">{player.currency}</span>
          </div>

          {/* Wave & Score */}
          <div className="text-white text-sm space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Wave:</span>
              <span className="font-bold text-red-400">{wave}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Score:</span>
              <span className="font-bold">{score}</span>
            </div>
          </div>
        </div>

        {/* Right side - Weapons & Powerups */}
        <div className="space-y-3">
          {/* Current Weapon */}
          {currentWeapon && (
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border-2 border-green-500">
              <div className="text-white text-sm font-bold mb-1">{currentWeapon.name}</div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${
                        (player.magazineAmmo[player.currentWeaponIndex] /
                          currentWeapon.magazineSize) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-white text-xs font-mono">
                  {player.magazineAmmo[player.currentWeaponIndex]} / {currentWeapon.magazineSize}
                </span>
              </div>
              {player.reloadingWeapon[player.currentWeaponIndex] && (
                <div className="text-yellow-400 text-xs mt-1">Reloading...</div>
              )}
            </div>
          )}

          {/* Other Weapon */}
          {otherWeapon && (
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2 border border-gray-600 opacity-70">
              <div className="text-gray-400 text-xs font-bold mb-1">{otherWeapon.name}</div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-500 transition-all"
                    style={{
                      width: `${
                        (player.magazineAmmo[player.currentWeaponIndex === 0 ? 1 : 0] /
                          otherWeapon.magazineSize) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-gray-400 text-xs font-mono">
                  {player.magazineAmmo[player.currentWeaponIndex === 0 ? 1 : 0]} /{' '}
                  {otherWeapon.magazineSize}
                </span>
              </div>
            </div>
          )}

          {/* Active Powerups */}
          {player.activePowerups.length > 0 && (
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2 border border-purple-500/50">
              <div className="text-white text-xs font-bold mb-1">Active Powerups</div>
              <div className="space-y-1">
                {player.activePowerups.map((powerup, index) => {
                  const display = getPowerupDisplay(powerup.type);
                  const timeLeft = Math.ceil((powerup.endTime - Date.now()) / 1000);
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <span style={{ color: display.color }}>{display.emoji}</span>
                      <span className="text-white text-xs">{timeLeft}s</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded p-2 text-white text-xs">
        <div className="font-bold mb-1">Controls:</div>
        <div className="space-y-0.5 text-gray-300">
          <div>WASD / Arrows - Move</div>
          <div>Space - Fire</div>
          <div>Q - Switch Weapon</div>
          <div>R - Reload</div>
          <div>ESC - Pause</div>
        </div>
      </div>
    </div>
  );
};
