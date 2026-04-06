/**
 * @fileoverview Main menu component
 * Entry point with navigation to different game modes
 */

import { Button } from './ui/button';
import { Card } from './ui/card';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenShop: () => void;
  onOpenEditor: () => void;
  currency: number;
}

/**
 * Main menu UI component
 */
export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenShop,
  onOpenEditor,
  currency,
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-red-900 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl w-full">
        {/* Title */}
        <div className="mb-12 animate-pulse">
          <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-2xl">BOSS RUSH</h1>
          <p className="text-2xl text-gray-300">Survive the endless wave of bosses</p>
        </div>

        {/* Currency Display */}
        <Card className="bg-black/50 border-yellow-500 p-4 mb-8 inline-block">
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 text-3xl">💰</span>
            <div className="text-left">
              <div className="text-gray-400 text-sm">Your Currency</div>
              <div className="text-yellow-400 text-2xl font-bold">{currency}</div>
            </div>
          </div>
        </Card>

        {/* Menu Buttons */}
        <div className="space-y-4">
          <Button
            onClick={onStartGame}
            size="lg"
            className="w-full text-2xl py-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            🎮 Start Boss Rush
          </Button>

          <Button
            onClick={onOpenShop}
            size="lg"
            className="w-full text-2xl py-8 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
          >
            🛒 Weapon Shop
          </Button>

          <Button
            onClick={onOpenEditor}
            size="lg"
            className="w-full text-2xl py-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            ⚙️ Boss Editor
          </Button>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <Card className="bg-black/30 border-blue-500/50 p-4">
            <div className="text-blue-400 text-2xl mb-2">⚔️</div>
            <div className="text-white font-bold mb-1">8 Unique Weapons</div>
            <div className="text-gray-400 text-sm">Unlock and upgrade your arsenal</div>
          </Card>

          <Card className="bg-black/30 border-red-500/50 p-4">
            <div className="text-red-400 text-2xl mb-2">👹</div>
            <div className="text-white font-bold mb-1">Procedural Bosses</div>
            <div className="text-gray-400 text-sm">Every wave is unique</div>
          </Card>

          <Card className="bg-black/30 border-purple-500/50 p-4">
            <div className="text-purple-400 text-2xl mb-2">🎨</div>
            <div className="text-white font-bold mb-1">Boss Editor</div>
            <div className="text-gray-400 text-sm">Create and fight custom bosses</div>
          </Card>
        </div>

        {/* Credits */}
        <div className="mt-8 text-gray-500 text-sm">
          Controls: WASD/Arrows to move • Space to fire • Q to switch weapons • R to reload
        </div>
      </div>
    </div>
  );
};
