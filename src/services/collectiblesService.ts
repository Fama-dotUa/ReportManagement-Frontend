// 1. ИСПРАВЛЕН ПУТЬ К ТИПАМ
import type { CollectibleItem, UserInventoryItem } from '../components/Types/collectibles';

// 2. ЭКСПОРТИРУЕМ КОНСТАНТУ
export const DUST_ITEM_ID = 999;

// --- //! СИМУЛЯЦИЯ БАЗЫ ДАННЫХ НА СЕРВЕРЕ ---
const shopItems: CollectibleItem[] = [
    // 3. ДОБАВЛЕНЫ ВСЕ ПОЛЯ КО ВСЕМ ОБЪЕКТАМ
    // Особый предмет - Пыль
    { id: DUST_ITEM_ID, name: 'Магическая пыль', price: 0, rarity: 'White', stock: Infinity, description: 'Эссенция магии, полученная при разборе предметов. Используется для создания и улучшения.', collection: 'any', salvageValue: 0, isPurchasable: false },

    // Коллекция "Древние реликвии"
    { id: 1, name: 'Древняя монета', price: 1000, rarity: 'White', stock: 99, description: 'Потертая монета неизвестного происхождения.', collection: 'Древние реликвии', salvageValue: 5, isPurchasable: true },
    { id: 13, name: 'Потускневший ключ', price: 1200, rarity: 'White', stock: 99, description: 'Кажется, он мог бы что-то открыть.', collection: 'Древние реликвии', salvageValue: 6, isPurchasable: true },
    { id: 17, name: 'Рунический камень', price: 9000, rarity: 'Blue', stock: 20, description: 'Древние символы на нем светятся в темноте.', collection: 'Древние реликвии', salvageValue: 45, isPurchasable: true },
    { id: 20, name: 'Запретный гримуар', price: 30000, rarity: 'Purple', stock: 5, description: 'Книга, содержащая темные и могущественные заклинания.', collection: 'Древние реликвии', salvageValue: 150, isPurchasable: true },

    // Коллекция "Дары природы"
    { id: 2, name: 'Клевер Удачи', price: 2500, rarity: 'Green', stock: 50, description: 'Говорят, приносит удачу в азартных играх.', collection: 'Дары природы', salvageValue: 12, isPurchasable: true },
    { id: 15, name: 'Эльфийская стрела', price: 4000, rarity: 'Green', stock: 40, description: 'Легкая и острая, почти не имеет веса.', collection: 'Дары природы', salvageValue: 20, isPurchasable: true },
    { id: 21, name: 'Перо Феникса', price: 95000, rarity: 'Gold', stock: 2, description: 'Одно прикосновение исцеляет любые раны... или кошелек.', collection: 'Дары природы', salvageValue: 500, isPurchasable: true },
    
    // Коллекция "Стихийные артефакты"
    { id: 18, name: 'Морозный кристалл', price: 11000, rarity: 'Blue', stock: 18, description: 'Холодный на ощупь, даже в самый жаркий день.', collection: 'Стихийные артефакты', salvageValue: 55, isPurchasable: true },
    { id: 6, name: 'Сердце вулкана', price: 120000, rarity: 'Red', stock: 2, description: 'Камень, что хранит в себе жар огненной горы.', collection: 'Стихийные артефакты', salvageValue: 600, isPurchasable: true },
    
    // Предметы без коллекции
    { id: 14, name: 'Старая кость', price: 1500, rarity: 'White', stock: 99, description: 'Кому она принадлежала? Загадка.', collection: 'any', salvageValue: 7, isPurchasable: true },
    { id: 7, name: 'Карта Джокера', price: 3333, rarity: 'Green', stock: 30, description: 'Дикая карта, способная изменить ход игры.', collection: 'any', salvageValue: 15, isPurchasable: true },
    { id: 3, name: 'Сапфировый глаз', price: 7000, rarity: 'Blue', stock: 25, description: 'Смотрит в самую душу, раскрывая тайны.', collection: 'any', salvageValue: 35, isPurchasable: true },
    { id: 4, name: 'Амулет Тени', price: 15000, rarity: 'Purple', stock: 10, description: 'Позволяет владельцу становиться невидимым... для неудач.', collection: 'any', salvageValue: 75, isPurchasable: true },
    { id: 5, name: 'Золотой Дракон', price: 50000, rarity: 'Gold', stock: 5, description: 'Статуэтка дракона, отлитая из чистого золота.', collection: 'any', salvageValue: 250, isPurchasable: true },
    { id: 8, name: 'Корона Короля', price: 75000, rarity: 'Gold', stock: 3, description: 'Символ абсолютной власти и несметного богатства.', collection: 'any', salvageValue: 375, isPurchasable: true },
    { id: 22, name: 'Философский камень', price: 250000, rarity: 'Red', stock: 1, description: 'Легендарный артефакт, превращающий CPN в... еще больше CPN.', collection: 'any', salvageValue: 1000, isPurchasable: true },
];

let userInventory: UserInventoryItem[] = [
    { itemId: 1, quantity: 5 },
    { itemId: 13, quantity: 1 },
    { itemId: DUST_ITEM_ID, quantity: 50 },
];

const collectiblesService = {
    state: { items: shopItems, inventory: userInventory },
    subscribers: [] as ((state: any) => void)[],
    subscribe(c:any){this.subscribers.push(c);c(this.state)},
    unsubscribe(c:any){this.subscribers=this.subscribers.filter(s=>s!==c)},
    notify(){this.subscribers.forEach(c=>c(this.state))},
    buyItem(itemId: number, userBalance: number): { success: boolean; message: string; newBalance?: number } {
        const item = this.state.items.find((i) => i.id === itemId);
        if (!item || !item.isPurchasable) return { success: false, message: "Предмет не найден или не продается!" };
        if (item.stock <= 0) return { success: false, message: "Этого предмета больше нет в наличии." };
        if (userBalance < item.price) return { success: false, message: "Недостаточно CPN для покупки." };
        item.stock -= 1;
        const inventoryEntry = this.state.inventory.find((invItem) => invItem.itemId === itemId);
        if (inventoryEntry) {
            inventoryEntry.quantity += 1;
        } else {
            this.state.inventory.push({ itemId: itemId, quantity: 1 });
        }
        const newBalance = userBalance - item.price;
        this.notify();
        return { success: true, message: `Вы успешно купили "${item.name}"!`, newBalance };
    },
    salvageItem(itemId: number, quantity: number): { success: boolean, message: string } {
        const itemDetails = this.state.items.find(i => i.id === itemId);
        if (!itemDetails || itemDetails.id === DUST_ITEM_ID) return { success: false, message: 'Неверный предмет для разбора.' };
        
        const inventoryEntry = this.state.inventory.find(i => i.itemId === itemId);
        if (!inventoryEntry || inventoryEntry.quantity < quantity) return { success: false, message: 'Недостаточно предметов для разбора.' };

        const dustGained = itemDetails.salvageValue * quantity;
        inventoryEntry.quantity -= quantity;
        if (inventoryEntry.quantity <= 0) {
            this.state.inventory = this.state.inventory.filter(i => i.itemId !== itemId);
        }

        const dustEntry = this.state.inventory.find(i => i.itemId === DUST_ITEM_ID);
        if (dustEntry) {
            dustEntry.quantity += dustGained;
        } else {
            this.state.inventory.push({ itemId: DUST_ITEM_ID, quantity: dustGained });
        }

        this.notify();
        return { success: true, message: `Вы разобрали ${quantity}x "${itemDetails.name}" и получили ${dustGained} Магической пыли.` };
    },
    transferItem(targetUserId: string, itemId: number, quantity: number): { success: boolean, message: string } {
        const inventoryEntry = this.state.inventory.find(i => i.itemId === itemId);
        const itemDetails = this.state.items.find(i => i.id === itemId);

        if (!inventoryEntry || !itemDetails || inventoryEntry.quantity < quantity) return { success: false, message: 'Недостаточно предметов для передачи.' };
        
        inventoryEntry.quantity -= quantity;
        if (inventoryEntry.quantity <= 0) {
            this.state.inventory = this.state.inventory.filter(i => i.itemId !== itemId);
        }
        
        this.notify();
        return { success: true, message: `Вы успешно передали ${quantity}x "${itemDetails.name}" игроку ${targetUserId}.` };
    },
    deleteItem(itemId: number): { success: boolean, message: string } {
        const itemDetails = this.state.items.find(i => i.id === itemId);
        if (!itemDetails) return { success: false, message: 'Предмет не найден.' };

        this.state.inventory = this.state.inventory.filter(i => i.itemId !== itemId);
        this.notify();
        return { success: true, message: `Вы навсегда удалили все "${itemDetails.name}" из инвентаря.` };
    },
};

export default collectiblesService;