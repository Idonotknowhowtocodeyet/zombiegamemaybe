/**
 * @fileoverview Weapon selection screen
 * Choose 2 weapons before starting the game
 */

import { useState } from 'react';
import { Weapon } from '../types/game-types';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface WeaponSelectProps {
  unlockedWeapons: Weapon[];
  onStart: (weapon1: Weapon | null, weapon2: Weapon | null) => void;
  onBack: () => void;
}

/**
 * Weapon selection UI component
 * Allows player to choose 2 weapons for their loadout
 */
export const WeaponSelect: React.FC<WeaponSelectProps> = ({
  unlockedWeapons,
  onStart,
  onBack,
}) => {
  const [selectedSlot1, setSelectedSlot1] = useState<Weapon | null>(null);
  const [selectedSlot2, setSelectedSlot2] = useState<Weapon | null>(null);

  const handleWeaponClick = (weapon: Weapon) => {
    if (!selectedSlot1) {
      setSelectedSlot1(weapon);
    } else if (!selectedSlot2 && weapon.id !== selectedSlot1.id) {
      setSelectedSlot2(weapon);
    } else if (selectedSlot1.id === weapon.id) {
      setSelectedSlot1(null);
    } else if (selectedSlot2?.id === weapon.id) {
      setSelectedSlot2(null);
    }
  };

  const isSelected = (weapon: Weapon): number | null => {
    if (selectedSlot1?.id === weapon.id) return 1;
    if (selectedSlot2?.id === weapon.id) return 2;
    return null;
  };

  const canStart = selectedSlot1 !== null || selectedSlot2 !== null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-white mb-4">Select Your Weapons</h2>
          <p className="text-gray-400 text-xl">Choose up to 2 weapons for battle</p>
        </div>

        {/* Selected Weapons Display */}
        <div className="flex gap-4 justify-center mb-8">
          <Card
            className={`w-64 h-32 flex items-center justify-center ${
              selectedSlot1
                ? 'bg-green-900/50 border-green-500 border-2'
                : 'bg-gray-800 border-gray-600 border-dashed'
            }`}
          >
            {selectedSlot1 ? (
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: selectedSlot1.color }}
                />
                <div className="text-white font-bold">{selectedSlot1.name}</div>
              </div>
            ) : (
              <div className="text-gray-500 text-lg">Weapon Slot 1</div>
            )}
          </Card>

          <Card
            className={`w-64 h-32 flex items-center justify-center ${
              selectedSlot2
                ? 'bg-green-900/50 border-green-500 border-2'
                : 'bg-gray-800 border-gray-600 border-dashed'
            }`}
          >
            {selectedSlot2 ? (
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: selectedSlot2.color }}
                />
                <div className="text-white font-bold">{selectedSlot2.name}</div>
              </div>
            ) : (
              <div className="text-gray-500 text-lg">Weapon Slot 2</div>
            )}
          </Card>
        </div>

        {/* Available Weapons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-h-[50vh] overflow-y-auto p-2">
          {unlockedWeapons.map((weapon) => {
            const slot = isSelected(weapon);
            const isDisabled = !slot && selectedSlot1 && selectedSlot2;

            return (
              <Card
                key={weapon.id}
                onClick={() => !isDisabled && handleWeaponClick(weapon)}
                className={`p-4 cursor-pointer transition-all ${
                  slot
                    ? 'bg-green-900/50 border-green-500 border-2 ring-2 ring-green-500'
                    : isDisabled
                    ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                    : 'bg-gray-800 border-gray-600 hover:border-white hover:scale-105'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-white">{weapon.name}</h4>
                    <div
                      className="w-10 h-10 rounded-full mt-2"
                      style={{ backgroundColor: weapon.color }}
                    />
                  </div>
                  {slot && (
                    <div className="bg-green-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                      Slot {slot}
                    </div>
                  )}
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
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={onBack} variant="outline" size="lg">
            Back
          </Button>
          <Button onClick={() => onStart(selectedSlot1, selectedSlot2)} disabled={!canStart} size="lg">
            Start Game
          </Button>
        </div>

        {!canStart && (
          <div className="text-center text-yellow-400 mt-4">
            Select at least one weapon to continue
          </div>
        )}
      </div>
    </div>
  );
};
