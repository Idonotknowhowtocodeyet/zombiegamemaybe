/**
 * @fileoverview Inventory management hook
 * Handles weapon unlocks, purchases, and currency
 */

import { useState, useCallback, useEffect } from 'react';
import { Weapon, WeaponType } from '../types/game-types';
import { WEAPONS } from '../utils/weapon-system';

const STORAGE_KEY = 'boss-rush-inventory';

interface InventoryHook {
  weapons: Map<string, Weapon>;
  currency: number;
  unlockedWeapons: Set<string>;
  purchaseWeapon: (weaponId: string) => boolean;
  addCurrency: (amount: number) => void;
  resetInventory: () => void;
  getAvailableWeapons: () => Weapon[];
  getUnlockedWeapons: () => Weapon[];
}

/**
 * Custom hook for managing player inventory and shop
 * Persists data to localStorage
 */
export const useInventory = (): InventoryHook => {
  // Initialize weapons map
  const [weapons] = useState<Map<string, Weapon>>(() => {
    const map = new Map<string, Weapon>();
    Object.values(WEAPONS).forEach((weapon) => {
      map.set(weapon.id, { ...weapon });
    });
    return map;
  });

  // Load from localStorage or initialize
  const [currency, setCurrency] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.currency || 0;
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
    return 0;
  });

  const [unlockedWeapons, setUnlockedWeapons] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return new Set(data.unlockedWeapons || [WeaponType.PISTOL]);
      }
    } catch (error) {
      console.error('Failed to load unlocked weapons:', error);
    }
    return new Set([WeaponType.PISTOL]);
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      const data = {
        currency,
        unlockedWeapons: Array.from(unlockedWeapons),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save inventory:', error);
    }
  }, [currency, unlockedWeapons]);

  /**
   * Purchase a weapon from the shop
   * @param weaponId - Weapon ID to purchase
   * @returns true if purchase successful
   */
  const purchaseWeapon = useCallback(
    (weaponId: string): boolean => {
      const weapon = weapons.get(weaponId);
      
      if (!weapon) {
        console.error('Weapon not found:', weaponId);
        return false;
      }

      if (unlockedWeapons.has(weaponId)) {
        console.warn('Weapon already unlocked:', weaponId);
        return false;
      }

      if (currency < weapon.cost) {
        console.warn('Insufficient currency for weapon:', weaponId);
        return false;
      }

      // Deduct cost and unlock weapon
      setCurrency((prev) => prev - weapon.cost);
      setUnlockedWeapons((prev) => new Set([...prev, weaponId]));
      
      return true;
    },
    [weapons, unlockedWeapons, currency]
  );

  /**
   * Add currency (from boss kills, achievements, etc.)
   */
  const addCurrency = useCallback((amount: number): void => {
    setCurrency((prev) => prev + amount);
  }, []);

  /**
   * Reset inventory to default state
   */
  const resetInventory = useCallback((): void => {
    setCurrency(0);
    setUnlockedWeapons(new Set([WeaponType.PISTOL]));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Get all unlocked weapons
   */
  const getUnlockedWeapons = useCallback((): Weapon[] => {
    return Array.from(weapons.values()).filter((weapon) =>
      unlockedWeapons.has(weapon.id)
    );
  }, [weapons, unlockedWeapons]);

  /**
   * Get all weapons available for purchase (locked weapons)
   */
  const getAvailableWeapons = useCallback((): Weapon[] => {
    return Array.from(weapons.values()).filter(
      (weapon) => !unlockedWeapons.has(weapon.id)
    );
  }, [weapons, unlockedWeapons]);

  return {
    weapons,
    currency,
    unlockedWeapons,
    purchaseWeapon,
    addCurrency,
    resetInventory,
    getAvailableWeapons,
    getUnlockedWeapons,
  };
};
