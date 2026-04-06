/**
 * @fileoverview Main application component
 * Boss Rush game with procedural generation, weapon shop, and boss editor
 */

import { useState, useRef, useEffect } from 'react';
import { GameMode, Weapon, Boss } from './types/game-types';
import { useInventory } from './hooks/useInventory';
import { useGameEngine } from './hooks/useGameEngine';
import { MainMenu } from './components/MainMenu';
import { WeaponShop } from './components/WeaponShop';
import { WeaponSelect } from './components/WeaponSelect';
import { BossEditor } from './components/BossEditor';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

const STORAGE_KEY_BOSSES = 'boss-rush-custom-bosses';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.MAIN_MENU);
  const [customBosses, setCustomBosses] = useState<Boss[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOSSES);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load custom bosses:', error);
      return [];
    }
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize inventory and game engine
  const inventory = useInventory();
  const gameEngine = useGameEngine(canvasRef);

  /**
   * Save custom bosses to localStorage
   */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOSSES, JSON.stringify(customBosses));
    } catch (error) {
      console.error('Failed to save custom bosses:', error);
    }
  }, [customBosses]);

  /**
   * Handle ESC key for pause/menu
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameMode === GameMode.PLAYING || gameMode === GameMode.CUSTOM_BOSS_RUSH) {
          if (gameEngine.gameState.isGameOver) {
            setGameMode(GameMode.MAIN_MENU);
            gameEngine.resetGame();
          } else {
            gameEngine.togglePause();
          }
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [gameMode, gameEngine]);

  /**
   * Update inventory currency when game ends
   */
  useEffect(() => {
    if (gameEngine.gameState.isGameOver && gameEngine.gameState.player.currency > 0) {
      inventory.addCurrency(gameEngine.gameState.player.currency);
      toast.success(`Earned ${gameEngine.gameState.player.currency} currency!`);
    }
  }, [gameEngine.gameState.isGameOver]);

  /**
   * Handle starting game from weapon select
   */
  const handleStartGame = (weapon1: Weapon | null, weapon2: Weapon | null, customBossList?: Boss[]) => {
    if (customBossList && customBossList.length > 0) {
      gameEngine.startGame(weapon1, weapon2, customBossList);
      setGameMode(GameMode.CUSTOM_BOSS_RUSH);
    } else {
      gameEngine.startGame(weapon1, weapon2);
      setGameMode(GameMode.PLAYING);
    }
    toast.success('Game started! Good luck!');
  };

  /**
   * Handle weapon purchase
   */
  const handlePurchase = (weaponId: string) => {
    const success = inventory.purchaseWeapon(weaponId);
    if (success) {
      const weapon = inventory.weapons.get(weaponId);
      toast.success(`Unlocked ${weapon?.name}!`);
    } else {
      toast.error('Purchase failed!');
    }
  };

  /**
   * Handle boss save
   */
  const handleSaveBoss = (boss: Boss) => {
    setCustomBosses((prev) => [...prev, boss]);
    toast.success(`Boss "${boss.name}" saved!`);
  };

  /**
   * Handle boss delete
   */
  const handleDeleteBoss = (bossId: string) => {
    setCustomBosses((prev) => prev.filter((b) => b.id !== bossId));
    toast.success('Boss deleted!');
  };

  /**
   * Handle starting custom boss rush
   */
  const handleStartCustomRush = (bosses: Boss[]) => {
    setGameMode(GameMode.WEAPON_SELECT);
    // Store bosses to use after weapon selection
    setTimeout(() => {
      const unlockedWeapons = inventory.getUnlockedWeapons();
      if (unlockedWeapons.length === 0) {
        toast.error('No weapons unlocked!');
        setGameMode(GameMode.BOSS_EDITOR);
        return;
      }
      // We'll pass bosses through a closure
      customBossRushRef.current = bosses;
    }, 100);
  };

  const customBossRushRef = useRef<Boss[]>([]);

  /**
   * Render based on game mode
   */
  const renderContent = () => {
    switch (gameMode) {
      case GameMode.MAIN_MENU:
        return (
          <MainMenu
            onStartGame={() => setGameMode(GameMode.WEAPON_SELECT)}
            onOpenShop={() => setGameMode(GameMode.SHOP)}
            onOpenEditor={() => setGameMode(GameMode.BOSS_EDITOR)}
            currency={inventory.currency}
          />
        );

      case GameMode.SHOP:
        return (
          <WeaponShop
            availableWeapons={inventory.getAvailableWeapons()}
            unlockedWeapons={inventory.getUnlockedWeapons()}
            currency={inventory.currency}
            onPurchase={handlePurchase}
            onClose={() => setGameMode(GameMode.MAIN_MENU)}
          />
        );

      case GameMode.WEAPON_SELECT:
        return (
          <WeaponSelect
            unlockedWeapons={inventory.getUnlockedWeapons()}
            onStart={(w1, w2) => {
              const customBossList = customBossRushRef.current;
              customBossRushRef.current = [];
              handleStartGame(w1, w2, customBossList.length > 0 ? customBossList : undefined);
            }}
            onBack={() => setGameMode(GameMode.MAIN_MENU)}
          />
        );

      case GameMode.BOSS_EDITOR:
        return (
          <BossEditor
            savedBosses={customBosses}
            onSave={handleSaveBoss}
            onDelete={handleDeleteBoss}
            onClose={() => setGameMode(GameMode.MAIN_MENU)}
            onStartCustomRush={handleStartCustomRush}
            canvasWidth={gameEngine.canvasDimensions.width}
            canvasHeight={gameEngine.canvasDimensions.height}
          />
        );

      case GameMode.PLAYING:
      case GameMode.CUSTOM_BOSS_RUSH:
        return (
          <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
            <GameCanvas
              gameState={gameEngine.gameState}
              width={gameEngine.canvasDimensions.width}
              height={gameEngine.canvasDimensions.height}
            />
            <GameHUD gameState={gameEngine.gameState} />

            {/* Pause overlay */}
            {gameEngine.gameState.isPaused && !gameEngine.gameState.isGameOver && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-6xl font-bold text-white mb-8">PAUSED</h2>
                  <div className="space-y-4">
                    <button
                      onClick={gameEngine.togglePause}
                      className="block w-64 mx-auto px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-xl"
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => {
                        setGameMode(GameMode.MAIN_MENU);
                        gameEngine.resetGame();
                      }}
                      className="block w-64 mx-auto px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-xl"
                    >
                      Quit to Menu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="size-full">
      {renderContent()}
      <Toaster position="top-right" />
    </div>
  );
}
