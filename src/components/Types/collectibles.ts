export type Rarity = 'White' | 'Green' | 'Blue' | 'Purple' | 'Gold' | 'Red';

export interface CollectibleItem {
  id: number;
  name: string;
  price: number;
  rarity: Rarity;
  stock: number;
  description: string;
  collection: string; // НОВОЕ ПОЛЕ
}

export interface UserInventoryItem {
  itemId: number;
  quantity: number;
}