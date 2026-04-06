/**
 * @fileoverview Boss Editor component
 * WYSIWYG editor for creating custom bosses
 */

import { useState } from 'react';
import { Boss, BossAttack, AttackPattern, MovementPattern } from '../types/game-types';
import { createBossTemplate } from '../utils/boss-generator';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface BossEditorProps {
  savedBosses: Boss[];
  onSave: (boss: Boss) => void;
  onDelete: (bossId: string) => void;
  onClose: () => void;
  onStartCustomRush: (bosses: Boss[]) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const BOSS_COLORS = [
  '#FF0000',
  '#FF00FF',
  '#8B00FF',
  '#FF4500',
  '#DC143C',
  '#FF1493',
  '#4B0082',
  '#8B0000',
  '#00FFFF',
  '#FFD700',
];

const ATTACK_COLORS = ['#FF0000', '#FF6347', '#FFD700', '#FF00FF', '#00FFFF', '#FFFFFF'];

/**
 * Boss Editor UI Component
 */
export const BossEditor: React.FC<BossEditorProps> = ({
  savedBosses,
  onSave,
  onDelete,
  onClose,
  onStartCustomRush,
  canvasWidth,
  canvasHeight,
}) => {
  const [editingBoss, setEditingBoss] = useState<Partial<Boss>>(() =>
    createBossTemplate(canvasWidth, canvasHeight)
  );

  const handleSave = () => {
    if (!editingBoss.name || !editingBoss.attacks || editingBoss.attacks.length === 0) {
      alert('Please provide a name and at least one attack!');
      return;
    }

    const boss: Boss = {
      id: `custom-${Date.now()}`,
      name: editingBoss.name,
      position: editingBoss.position!,
      velocity: editingBoss.velocity!,
      size: editingBoss.size!,
      health: editingBoss.health!,
      maxHealth: editingBoss.maxHealth!,
      rotation: 0,
      movementPattern: editingBoss.movementPattern!,
      attacks: editingBoss.attacks,
      speed: editingBoss.speed!,
      color: editingBoss.color!,
      wave: 1,
      reward: editingBoss.reward!,
      movementTimer: 0,
    };

    onSave(boss);
    setEditingBoss(createBossTemplate(canvasWidth, canvasHeight));
  };

  const addAttack = () => {
    const newAttack: BossAttack = {
      pattern: AttackPattern.STRAIGHT,
      damage: 10,
      projectileSpeed: 8,
      projectileCount: 1,
      cooldown: 2,
      lastFired: 0,
      color: '#FF0000',
    };

    setEditingBoss({
      ...editingBoss,
      attacks: [...(editingBoss.attacks || []), newAttack],
    });
  };

  const updateAttack = (index: number, attack: BossAttack) => {
    const attacks = [...(editingBoss.attacks || [])];
    attacks[index] = attack;
    setEditingBoss({ ...editingBoss, attacks });
  };

  const removeAttack = (index: number) => {
    const attacks = [...(editingBoss.attacks || [])];
    attacks.splice(index, 1);
    setEditingBoss({ ...editingBoss, attacks });
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-white">Boss Editor</h2>
          <Button onClick={onClose} variant="outline" size="lg">
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-purple-500 p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Boss Properties</h3>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="boss-name" className="text-white">
                    Name
                  </Label>
                  <Input
                    id="boss-name"
                    value={editingBoss.name || ''}
                    onChange={(e) => setEditingBoss({ ...editingBoss, name: e.target.value })}
                    placeholder="Enter boss name"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Health */}
                <div>
                  <Label htmlFor="boss-health" className="text-white">
                    Health: {editingBoss.health}
                  </Label>
                  <Input
                    id="boss-health"
                    type="range"
                    min="50"
                    max="1000"
                    value={editingBoss.health || 200}
                    onChange={(e) => {
                      const health = parseInt(e.target.value);
                      setEditingBoss({ ...editingBoss, health, maxHealth: health });
                    }}
                    className="w-full"
                  />
                </div>

                {/* Size */}
                <div>
                  <Label htmlFor="boss-size" className="text-white">
                    Size: {editingBoss.size}
                  </Label>
                  <Input
                    id="boss-size"
                    type="range"
                    min="30"
                    max="100"
                    value={editingBoss.size || 50}
                    onChange={(e) =>
                      setEditingBoss({ ...editingBoss, size: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>

                {/* Speed */}
                <div>
                  <Label htmlFor="boss-speed" className="text-white">
                    Speed: {editingBoss.speed?.toFixed(1)}
                  </Label>
                  <Input
                    id="boss-speed"
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={editingBoss.speed || 3}
                    onChange={(e) =>
                      setEditingBoss({ ...editingBoss, speed: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>

                {/* Color */}
                <div>
                  <Label className="text-white">Color</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {BOSS_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditingBoss({ ...editingBoss, color })}
                        className={`w-12 h-12 rounded-lg transition-transform hover:scale-110 ${
                          editingBoss.color === color ? 'ring-4 ring-white' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Movement Pattern */}
                <div>
                  <Label htmlFor="movement-pattern" className="text-white">
                    Movement Pattern
                  </Label>
                  <Select
                    value={editingBoss.movementPattern || MovementPattern.HORIZONTAL}
                    onValueChange={(value) =>
                      setEditingBoss({ ...editingBoss, movementPattern: value as MovementPattern })
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MovementPattern).map((pattern) => (
                        <SelectItem key={pattern} value={pattern}>
                          {pattern}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reward */}
                <div>
                  <Label htmlFor="boss-reward" className="text-white">
                    Currency Reward: {editingBoss.reward}
                  </Label>
                  <Input
                    id="boss-reward"
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={editingBoss.reward || 200}
                    onChange={(e) =>
                      setEditingBoss({ ...editingBoss, reward: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full mt-6" size="lg">
                Save Boss
              </Button>
            </Card>

            {/* Attacks */}
            <Card className="bg-gray-900 border-red-500 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">Attacks</h3>
                <Button onClick={addAttack} size="sm">
                  Add Attack
                </Button>
              </div>

              <div className="space-y-4">
                {(editingBoss.attacks || []).map((attack, index) => (
                  <Card key={index} className="bg-gray-800 border-gray-700 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-white font-bold">Attack {index + 1}</h4>
                      <Button
                        onClick={() => removeAttack(index)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {/* Pattern */}
                      <div>
                        <Label className="text-white text-xs">Pattern</Label>
                        <Select
                          value={attack.pattern}
                          onValueChange={(value) =>
                            updateAttack(index, { ...attack, pattern: value as AttackPattern })
                          }
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(AttackPattern).map((pattern) => (
                              <SelectItem key={pattern} value={pattern}>
                                {pattern}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Damage */}
                      <div>
                        <Label className="text-white text-xs">Damage: {attack.damage}</Label>
                        <Input
                          type="range"
                          min="5"
                          max="50"
                          value={attack.damage}
                          onChange={(e) =>
                            updateAttack(index, { ...attack, damage: parseInt(e.target.value) })
                          }
                          className="w-full"
                        />
                      </div>

                      {/* Speed */}
                      <div>
                        <Label className="text-white text-xs">
                          Speed: {attack.projectileSpeed}
                        </Label>
                        <Input
                          type="range"
                          min="3"
                          max="15"
                          value={attack.projectileSpeed}
                          onChange={(e) =>
                            updateAttack(index, {
                              ...attack,
                              projectileSpeed: parseInt(e.target.value),
                            })
                          }
                          className="w-full"
                        />
                      </div>

                      {/* Cooldown */}
                      <div>
                        <Label className="text-white text-xs">
                          Cooldown: {attack.cooldown}s
                        </Label>
                        <Input
                          type="range"
                          min="0.5"
                          max="5"
                          step="0.5"
                          value={attack.cooldown}
                          onChange={(e) =>
                            updateAttack(index, {
                              ...attack,
                              cooldown: parseFloat(e.target.value),
                            })
                          }
                          className="w-full"
                        />
                      </div>

                      {/* Projectile Count */}
                      {(attack.pattern === AttackPattern.SPREAD ||
                        attack.pattern === AttackPattern.CIRCLE ||
                        attack.pattern === AttackPattern.RAIN) && (
                        <div>
                          <Label className="text-white text-xs">
                            Projectiles: {attack.projectileCount}
                          </Label>
                          <Input
                            type="range"
                            min="3"
                            max="20"
                            value={attack.projectileCount}
                            onChange={(e) =>
                              updateAttack(index, {
                                ...attack,
                                projectileCount: parseInt(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>
                      )}

                      {/* Color */}
                      <div>
                        <Label className="text-white text-xs">Color</Label>
                        <div className="flex gap-2 mt-1">
                          {ATTACK_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateAttack(index, { ...attack, color })}
                              className={`w-8 h-8 rounded transition-transform hover:scale-110 ${
                                attack.color === color ? 'ring-2 ring-white' : ''
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {(editingBoss.attacks || []).length === 0 && (
                  <div className="text-center text-gray-400 py-4">No attacks added yet</div>
                )}
              </div>
            </Card>
          </div>

          {/* Saved Bosses Panel */}
          <div>
            <Card className="bg-gray-900 border-green-500 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">Saved Bosses</h3>
                {savedBosses.length > 0 && (
                  <Button onClick={() => onStartCustomRush(savedBosses)} variant="default">
                    Fight All ({savedBosses.length})
                  </Button>
                )}
              </div>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {savedBosses.map((boss) => (
                  <Card
                    key={boss.id}
                    className="bg-gray-800 border-gray-700 p-4 hover:border-green-500 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full"
                          style={{ backgroundColor: boss.color }}
                        />
                        <div>
                          <h4 className="text-white font-bold">{boss.name}</h4>
                          <div className="text-gray-400 text-xs">
                            {boss.movementPattern} • {boss.attacks.length} attacks
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => onStartCustomRush([boss])}
                          size="sm"
                          variant="outline"
                        >
                          Fight
                        </Button>
                        <Button
                          onClick={() => onDelete(boss.id)}
                          size="sm"
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">HP:</span>
                        <span className="text-green-400 font-bold ml-1">{boss.maxHealth}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <span className="text-blue-400 font-bold ml-1">{boss.size}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Speed:</span>
                        <span className="text-yellow-400 font-bold ml-1">
                          {boss.speed.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}

                {savedBosses.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-2">🎮</div>
                    <div>No bosses saved yet. Create one above!</div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
