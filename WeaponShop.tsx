/**
 * @fileoverview Weapon shop component - Rivals-style inventory system
 * Buy and unlock weapons with currency earned from defeating bosses
 */

import { Weapon } from '../types/game-types';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface WeaponShopProps {
  availableWeapons: Weapon[];
  unlockedWeapons: Weapon[];
  currency: number;
  onPurchase: (weaponId: string) => void;
  onClose: () => void;
}

/**
 * Weapon shop UI component
 * Displays available weapons, costs, and allows purchasing
 */
export const WeaponShop: React.FC<WeaponShopProps> = ({
  availableWeapons,
  unlockedWeapons,
  currency,
  onPurchase,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-gray-900 rounded-xl border-2 border-purple-500 p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Weapon Arsenal</h2>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-2xl">💰</span>
              <span className="text-yellow-400 text-xl font-bold">{currency}</span>
            </div>
          </div>
          <Button onClick={onClose} variant="outline" size="lg">
            Close
          </Button>
        </div>

        {/* Unlocked Weapons */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-green-400 mb-4">Unlocked Weapons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedWeapons.map((weapon) => (
              <Card
                key={weapon.id}
                className="bg-gray-800 border-green-500/50 p-4 hover:border-green-500 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-white">{weapon.name}</h4>
                    <div
                      className="w-8 h-8 rounded-full mt-1"
                      style={{ backgroundColor: weapon.color }}
                    />
                  </div>
                  <div className="text-green-400 font-bold text-2xl">✓</div>
                </div>

                <p className="text-gray-400 text-sm mb-3">{weapon.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Damage:</span>
                    <span className="text-red-400 font-bold ml-1">{weapon.damage}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fire Rate:</span>
                    <span className="text-yellow-400 font-bold ml-1">{weapon.fireRate}/s</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Magazine:</span>
                    <span className="text-blue-400 font-bold ml-1">{weapon.magazineSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reload:</span>
                    <span className="text-purple-400 font-bold ml-1">{weapon.reloadTime}s</span>
                  </div>
                </div>

                {weapon.piercing && (
                  <div className="mt-2 text-cyan-400 text-xs font-bold">⚡ Piercing</div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Available Weapons */}
        {availableWeapons.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-red-400 mb-4">Available for Purchase</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableWeapons.map((weapon) => {
                const canAfford = currency >= weapon.cost;

                return (
                  <Card
                    key={weapon.id}
                    className={`bg-gray-800 border-red-500/50 p-4 hover:border-red-500 transition-all ${
                      !canAfford ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-bold text-white">{weapon.name}</h4>
                        <div
                          className="w-8 h-8 rounded-full mt-1"
                          style={{ backgroundColor: weapon.color }}
                        />
                      </div>
                      <div className="text-yellow-400 font-bold text-sm flex items-center gap-1">
                        <span>💰</span>
                        {weapon.cost}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-3">{weapon.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-gray-500">Damage:</span>
                        <span className="text-red-400 font-bold ml-1">{weapon.damage}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fire Rate:</span>
                        <span className="text-yellow-400 font-bold ml-1">{weapon.fireRate}/s</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Magazine:</span>
                        <span className="text-blue-400 font-bold ml-1">{weapon.magazineSize}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Reload:</span>
                        <span className="text-purple-400 font-bold ml-1">{weapon.reloadTime}s</span>
                      </div>
                    </div>

                    {weapon.piercing && (
                      <div className="mb-2 text-cyan-400 text-xs font-bold">⚡ Piercing</div>
                    )}

                    <Button
                      onClick={() => onPurchase(weapon.id)}
                      disabled={!canAfford}
                      className="w-full"
                      variant={canAfford ? 'default' : 'outline'}
                    >
                      {canAfford ? 'Purchase' : 'Insufficient Funds'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {availableWeapons.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-xl">All weapons unlocked!</div>
          </div>
        )}
      </div>
    </div>
  );
};
