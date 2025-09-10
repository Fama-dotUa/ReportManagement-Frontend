export type Rarity = 'White' | 'Green' | 'Blue' | 'Purple' | 'Gold' | 'Red';

export interface CollectibleItem {
  id: number;
  name: string;
  price: number;
  rarity: Rarity;
  stock: number;
  description: string;
  collection: string;
  salvageValue: number;
  isPurchasable: boolean;
}

export interface UserInventoryItem {
  itemId: number;
  quantity: number;
}

// --- НОВЫЙ ЭКСПОРТИРУЕМЫЙ ТИП ---
export interface CollectionPack {
    collectionName: string;
    dustCost: number;
    description: string;
}