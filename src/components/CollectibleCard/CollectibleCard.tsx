import type { CollectibleItem, UserInventoryItem } from '../components/Types/collectibles';

export const DUST_ITEM_ID = 999;

// --- //! СИМУЛЯЦИЯ БАЗЫ ДАННЫХ НА СЕРВЕРЕ ---
const shopItems: CollectibleItem[] = [
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
    
    // Предметы без коллекции
    { id: 7, name: 'Карта Джокера', price: 3333, rarity: 'Green', stock: 30, description: 'Дикая карта, способная изменить ход игры.', collection: 'any', salvageValue: 15, isPurchasable: true },
    { id: 5, name: 'Золотой Дракон', price: 50000, rarity: 'Gold', stock: 5, description: 'Статуэтка дракона, отлитая из чистого золота.', collection: 'any', salvageValue: 250, isPurchasable: true },
    { id: 22, name: 'Философский камень', price: 250000, rarity: 'Red', stock: 1, description: 'Легендарный артефакт, превращающий CPN в... еще больше CPN.', collection: 'any', salvageValue: 1000, isPurchasable: true },
];

let userInventory: UserInventoryItem[] = [
    { itemId: 1, quantity: 5 },
    { itemId: 13, quantity: 1 },
    { itemId: DUST_ITEM_ID, quantity: 50 }, // Начальное количество пыли у игрока
];

const collectiblesService = {
    // ... (subscribe, unsubscribe, notify - без изменений)
    state: { items: shopItems, inventory: userInventory },
    subscribers: [] as ((state: any) => void)[],
    subscribe(c:any){this.subscribers.push(c);c(this.state)},unsubscribe(c:any){this.subscribers=this.subscribers.filter(s=>s!==c)},notify(){this.subscribers.forEach(c=>c(this.state))},

    buyItem(itemId: number, userBalance: number) { /* ... без изменений ... */ return {success:true, message: ''} },

    // --- //! НОВАЯ ЛОГИКА ---

    salvageItem(itemId: number, quantity: number): { success: boolean, message: string } {
        const itemDetails = this.state.items.find(i => i.id === itemId);
        if (!itemDetails || itemDetails.id === DUST_ITEM_ID) return { success: false, message: 'Неверный предмет для разбора.' };
        
        const inventoryEntry = this.state.inventory.find(i => i.itemId === itemId);
        if (!inventoryEntry || inventoryEntry.quantity < quantity) return { success: false, message: 'Недостаточно предметов для разбора.' };

        const dustGained = itemDetails.salvageValue * quantity;

        // Уменьшаем количество разбираемого предмета
        inventoryEntry.quantity -= quantity;
        if (inventoryEntry.quantity <= 0) {
            this.state.inventory = this.state.inventory.filter(i => i.itemId !== itemId);
        }

        // Добавляем пыль
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
        //! В реальном приложении это будет сложная система с подтверждениями и поиском пользователя.
        //! Здесь мы просто симулируем успешную передачу.
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
    
    // Другие методы (craft, buyPack) можно добавить по аналогии...
};

export default collectiblesService;