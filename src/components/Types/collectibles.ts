export type Rarity = 'White' | 'Green' | 'Blue' | 'Purple' | 'Gold' | 'Red';

export interface CollectibleItem {
  id: number;
  name: string;
  price: number;
  rarity: Rarity;
  stock: number;
  description: string;
  collection: string;
  salvageValue: number; // СКОЛЬКО ПЫЛИ ДАЕТ ПРИ РАЗБОРЕ
  isPurchasable: boolean; // МОЖНО ЛИ КУПИТЬ ЗА CPN
}

export interface UserInventoryItem {
  itemId: number;
  quantity: number;
}