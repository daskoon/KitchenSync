
import { Item, Store, UserSettings } from "./types";
import { ShoppingBasket, Package, MapPin, Tag, UtensilsCrossed } from "lucide-react";
import React from "react";

export const MOCK_STORES: Store[] = [
  {
    id: '1',
    name: 'Amazon',
    url: 'https://amazon.com',
    isOnline: true,
    isPhysical: false,
    hasMembership: true,
    membershipDetails: 'Prime'
  },
  {
    id: '2',
    name: 'Whole Foods Market',
    url: 'https://wholefoods.com',
    isOnline: true,
    isPhysical: true,
    hasMembership: true,
    membershipDetails: 'Amazon Prime Code'
  },
  {
    id: '3',
    name: 'Costco',
    isOnline: true,
    isPhysical: true,
    hasMembership: false
  },
  {
    id: '4',
    name: 'Local Bodega',
    isOnline: false,
    isPhysical: true,
    hasMembership: false
  }
];

export const MOCK_ITEMS: Item[] = [
  {
    id: '2',
    name: 'AA Batteries',
    category: 'Household',
    currentStock: 80,
    consumptionRate: 90,
    lastPurchased: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    autoRestock: false,
    preferredStoreIds: ['1', '3']
  },
  {
    id: '4',
    name: 'Pasta',
    category: 'Pantry',
    currentStock: 100,
    consumptionRate: 14,
    lastPurchased: new Date().toISOString(),
    autoRestock: true,
    preferredStoreIds: ['2']
  },
  {
    id: '5',
    name: 'Tomato Sauce',
    category: 'Pantry',
    currentStock: 100,
    consumptionRate: 30,
    lastPurchased: new Date().toISOString(),
    autoRestock: true,
    preferredStoreIds: ['2']
  }
];

export const NAV_ITEMS = [
  { id: 'LIST', label: 'Shopping List', icon: <ShoppingBasket size={24} /> },
  { id: 'DEALS', label: 'Deals & Compare', icon: <Tag size={24} /> },
  { id: 'RECIPES', label: 'Recipes', icon: <UtensilsCrossed size={24} /> },
  { id: 'INVENTORY', label: 'My Fridge', icon: <Package size={24} /> },
  { id: 'STORES', label: 'Stores', icon: <MapPin size={24} /> },
];

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  fontSize: 'normal',
  showOnboarding: true,
  smartDecay: true,
  searchRadius: 10
};
