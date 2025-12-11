
export interface Store {
  id: string;
  name: string;
  url?: string;
  isOnline: boolean;   // Replaces StoreType
  isPhysical: boolean; // Replaces StoreType
  location?: string; // Optional specific location context if needed
  hasMembership: boolean;
  membershipDetails?: string; // e.g., "Prime", "Club Card #123"
}

export interface Item {
  id: string;
  name: string;
  category: string;
  currentStock: number; // 0 to 100 percentage
  consumptionRate: number; // Days to consume 1 unit
  lastPurchased: string; // ISO Date
  autoRestock: boolean;
  preferredStoreIds: string[];
  nutrition?: {
    carbs: string;
    ketoAlternative: string;
  };
}

export interface Deal {
  itemId: string;
  storeName: string;
  price: number;
  currency: string;
  url: string;
  description: string;
  isMemberPrice: boolean;
  inStock: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredientsUsed: string[]; // IDs of items from inventory
  missingIngredients: string[];
  instructions: string;
  matchScore: number; // Percentage match
}

export interface AIRecommendation {
  id: string;
  text: string;
  type: 'RESTOCK' | 'DEAL' | 'HABIT';
  actionLabel?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  fontSize: 'normal' | 'large';
  showOnboarding: boolean;
  smartDecay: boolean;
  searchRadius: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  LIST = 'LIST',
  INVENTORY = 'INVENTORY',
  STORES = 'STORES',
  DEALS = 'DEALS',
  RECIPES = 'RECIPES',
  SETTINGS = 'SETTINGS'
}
