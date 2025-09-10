export type Rarity = 'White' | 'Green' | 'Blue' | 'Purple' | 'Gold' | 'Red';

export interface CollectibleItem {
  id: number;
  name: string;
  price: number;
  rarity: Rarity;
  stock: number; // Количество в магазине
  image: string; // Используем emoji для простоты
}