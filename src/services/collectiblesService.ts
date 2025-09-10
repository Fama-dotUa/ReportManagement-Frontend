import type { CollectibleItem, Rarity, UserInventoryItem, CollectionPack } from '../components/Types/collectibles';

export const DUST_ITEM_ID = 999;

const RARITY_ORDER: Rarity[] = ['White', 'Green', 'Blue', 'Purple', 'Gold', 'Red'];
const RARITY_SCORES: Record<Rarity, number> = { 'White': 1, 'Green': 3, 'Blue': 5, 'Purple': 10, 'Gold': 35, 'Red': 80 };
const DUST_SCORE_MODIFIER = 10; 

export const collectionPacks: CollectionPack[] = [
    { collectionName: 'Древние реликвии', dustCost: 200, description: 'Содержит 3 случайных предмета из коллекции "Древние реликвии".' },
    { collectionName: 'Дары природы', dustCost: 250, description: 'Содержит 3 случайных предмета из коллекции "Дары природы".' }
];

const shopItems: CollectibleItem[] = [
    { id: DUST_ITEM_ID, name: 'Магическая пыль', price: 0, rarity: 'White', stock: Infinity, description: 'Эссенция магии, полученная при разборе предметов. Используется для создания и улучшения.', collection: 'any', salvageValue: 0, isPurchasable: false },
    { id: 1, name: 'Древняя монета', price: 1000, rarity: 'White', stock: 99, description: 'Потертая монета неизвестного происхождения.', collection: 'Древние реликвии', salvageValue: 5, isPurchasable: true },
    { id: 13, name: 'Потускневший ключ', price: 1200, rarity: 'White', stock: 99, description: 'Кажется, он мог бы что-то открыть.', collection: 'Древние реликвии', salvageValue: 6, isPurchasable: true },
    { id: 17, name: 'Рунический камень', price: 9000, rarity: 'Blue', stock: 20, description: 'Древние символы на нем светятся в темноте.', collection: 'Древние реликвии', salvageValue: 45, isPurchasable: true },
    { id: 20, name: 'Запретный гримуар', price: 30000, rarity: 'Purple', stock: 5, description: 'Книга, содержащая темные и могущественные заклинания.', collection: 'Древние реликвии', salvageValue: 150, isPurchasable: true },
    { id: 2, name: 'Клевер Удачи', price: 2500, rarity: 'Green', stock: 50, description: 'Говорят, приносит удачу в азартных играх.', collection: 'Дары природы', salvageValue: 12, isPurchasable: true },
    { id: 15, name: 'Эльфийская стрела', price: 4000, rarity: 'Green', stock: 40, description: 'Легкая и острая, почти не имеет веса.', collection: 'Дары природы', salvageValue: 20, isPurchasable: true },
    { id: 21, name: 'Перо Феникса', price: 95000, rarity: 'Gold', stock: 2, description: 'Одно прикосновение исцеляет любые раны... или кошелек.', collection: 'Дары природы', salvageValue: 500, isPurchasable: true },
    { id: 18, name: 'Морозный кристалл', price: 11000, rarity: 'Blue', stock: 18, description: 'Холодный на ощупь, даже в самый жаркий день.', collection: 'Стихийные артефакты', salvageValue: 55, isPurchasable: true },
    { id: 6, name: 'Сердце вулкана', price: 120000, rarity: 'Red', stock: 2, description: 'Камень, что хранит в себе жар огненной горы.', collection: 'Стихийные артефакты', salvageValue: 600, isPurchasable: true },
    { id: 14, name: 'Старая кость', price: 1500, rarity: 'White', stock: 99, description: 'Кому она принадлежала? Загадка.', collection: 'any', salvageValue: 7, isPurchasable: true },
    { id: 7, name: 'Карта Джокера', price: 3333, rarity: 'Green', stock: 30, description: 'Дикая карта, способная изменить ход игры.', collection: 'any', salvageValue: 15, isPurchasable: true },
    { id: 3, name: 'Сапфировый глаз', price: 7000, rarity: 'Blue', stock: 25, description: 'Смотрит в самую душу, раскрывая тайны.', collection: 'any', salvageValue: 35, isPurchasable: true },
    { id: 4, name: 'Амулет Тени', price: 15000, rarity: 'Purple', stock: 10, description: 'Позволяет владельцу становиться невидимым... для неудач.', collection: 'any', salvageValue: 75, isPurchasable: true },
    { id: 5, name: 'Золотой Дракон', price: 50000, rarity: 'Gold', stock: 5, description: 'Статуэтка дракона, отлитая из чистого золота.', collection: 'any', salvageValue: 250, isPurchasable: true },
    { id: 8, name: 'Корона Короля', price: 75000, rarity: 'Gold', stock: 3, description: 'Символ абсолютной власти и несметного богатства.', collection: 'any', salvageValue: 375, isPurchasable: true },
    { id: 22, name: 'Философский камень', price: 250000, rarity: 'Red', stock: 1, description: 'Легендарный артефакт, превращающий CPN в... еще больше CPN.', collection: 'any', salvageValue: 1000, isPurchasable: true },
];

let userInventory: UserInventoryItem[] = [ { itemId: 1, quantity: 5 }, { itemId: 13, quantity: 1 }, { itemId: DUST_ITEM_ID, quantity: 50 }, ];

const collectiblesService = {
    state: { items: shopItems, inventory: userInventory },
    subscribers: [] as ((state: any) => void)[],
    subscribe(callback: (state: any) => void) { this.subscribers.push(callback); callback(this.state); },
    unsubscribe(callback: (state: any) => void) { this.subscribers = this.subscribers.filter(sub => sub !== callback); },
    notify() { this.subscribers.forEach(callback => callback(this.state)); },
    buyItem(itemId: number, userBalance: number): { success: boolean; message: string; newBalance?: number } {
        const item = this.state.items.find((i) => i.id === itemId);
        if (!item || !item.isPurchasable) return { success: false, message: "Предмет не найден или не продается!" };
        if (item.stock <= 0) return { success: false, message: "Этого предмета больше нет в наличии." };
        if (userBalance < item.price) return { success: false, message: "Недостаточно CPN для покупки." };
        const newShopItems = this.state.items.map(shopItem => shopItem.id === itemId ? { ...shopItem, stock: shopItem.stock - 1 } : shopItem);
        const inventoryEntry = this.state.inventory.find((invItem) => invItem.itemId === itemId);
        let newInventory;
        if (inventoryEntry) {
            newInventory = this.state.inventory.map(invItem => invItem.itemId === itemId ? { ...invItem, quantity: invItem.quantity + 1 } : invItem);
        } else {
            newInventory = [...this.state.inventory, { itemId: itemId, quantity: 1 }];
        }
        this.state = { items: newShopItems, inventory: newInventory };
        this.notify();
        const newBalance = userBalance - item.price;
        return { success: true, message: `Вы успешно купили "${item.name}"!`, newBalance };
    },
    salvageItem(itemId: number, quantity: number): { success: boolean, message: string } {
        const itemDetails = this.state.items.find(i => i.id === itemId);
        if (!itemDetails || itemDetails.id === DUST_ITEM_ID) return { success: false, message: 'Неверный предмет для разбора.' };
        const inventoryEntry = this.state.inventory.find(i => i.itemId === itemId);
        if (!inventoryEntry || inventoryEntry.quantity < quantity) return { success: false, message: 'Недостаточно предметов для разбора.' };
        const dustGained = itemDetails.salvageValue * quantity;
        const dustExists = this.state.inventory.some(i => i.itemId === DUST_ITEM_ID);
        let newInventory = this.state.inventory.map(invItem => {
            if (invItem.itemId === itemId) return { ...invItem, quantity: invItem.quantity - quantity };
            if (invItem.itemId === DUST_ITEM_ID) return { ...invItem, quantity: invItem.quantity + dustGained };
            return invItem;
        }).filter(invItem => invItem.quantity > 0);
        if (!dustExists && dustGained > 0) {
            newInventory = [...newInventory, { itemId: DUST_ITEM_ID, quantity: dustGained }];
        }
        this.state = { ...this.state, inventory: newInventory };
        this.notify();
        return { success: true, message: `Вы разобрали ${quantity}x "${itemDetails.name}" и получили ${dustGained} Магической пыли.` };
    },
    transferItem(targetUserId: string, itemId: number, quantity: number): { success: boolean, message: string } {
        const inventoryEntry = this.state.inventory.find(i => i.itemId === itemId);
        const itemDetails = this.state.items.find(i => i.id === itemId);
        if (!inventoryEntry || !itemDetails || inventoryEntry.quantity < quantity) return { success: false, message: 'Недостаточно предметов для передачи.' };
        const newInventory = this.state.inventory.map(invItem =>
            invItem.itemId === itemId ? { ...invItem, quantity: invItem.quantity - quantity } : invItem
        ).filter(invItem => invItem.quantity > 0);
        this.state = { ...this.state, inventory: newInventory };
        this.notify();
        return { success: true, message: `Вы успешно передали ${quantity}x "${itemDetails.name}" игроку ${targetUserId}.` };
    },
    deleteItem(itemId: number): { success: boolean, message: string } {
        const itemDetails = this.state.items.find(i => i.id === itemId);
        if (!itemDetails) return { success: false, message: 'Предмет не найден.' };
        const newInventory = this.state.inventory.filter(i => i.itemId !== itemId);
        this.state = { ...this.state, inventory: newInventory };
        this.notify();
        return { success: true, message: `Вы навсегда удалили все "${itemDetails.name}" из инвентаря.` };
    },
    getContractPreview(inputItems: CollectibleItem[], dustToAdd: number) {
        if (inputItems.length === 0) return null;
        const collectionCounts: Record<string, number> = {};
        inputItems.forEach(item => {
            if (item.collection !== 'any') {
                collectionCounts[item.collection] = (collectionCounts[item.collection] || 0) + 1;
            }
        });
        let targetCollection = 'any';
        let maxCount = 0;
        for (const collection in collectionCounts) {
            if (collectionCounts[collection] > maxCount) {
                maxCount = collectionCounts[collection];
                targetCollection = collection;
            }
        }
        const totalItemScore = inputItems.reduce((sum, item) => sum + RARITY_SCORES[item.rarity], 0);
        const dustScore = dustToAdd / DUST_SCORE_MODIFIER;
        const totalContractScore = totalItemScore + dustScore;
        const avgScore = totalContractScore / 5;
        const rarityWeights: Record<string, number> = {};
        let totalWeight = 0;
        RARITY_ORDER.forEach(rarity => {
            const score = RARITY_SCORES[rarity];
            const distance = Math.abs(score - avgScore);
            const weight = 1 / (Math.pow(distance, 1.5) + 1); // Сделал спад чуть резче
            rarityWeights[rarity] = weight;
            totalWeight += weight;
        });
        const chances = RARITY_ORDER.map(rarity => {
            const chance = (rarityWeights[rarity] / totalWeight) * 100;
            return {
                rarity,
                chance: chance < 0.1 && chance > 0 ? '<0.1' : chance.toFixed(1),
            };
        }).filter(r => parseFloat(r.chance) > 0 || r.chance === '<0.1');
        return {
            targetCollection,
            chances,
        };
    },
    performContract(inputItemIds: number[], dustToAdd: number): { success: boolean, message: string } {
        if (inputItemIds.length !== 5) return { success: false, message: 'Для контракта нужно 5 предметов.' };
        const inputItems = inputItemIds.map(id => this.state.items.find(i => i.id === id)).filter(Boolean) as CollectibleItem[];
        if (inputItems.length !== 5) return { success: false, message: 'Один или несколько предметов не найдены.' };
        const userDust = this.state.inventory.find(i => i.itemId === DUST_ITEM_ID)?.quantity ?? 0;
        if (userDust < dustToAdd) return { success: false, message: 'Недостаточно пыли.' };
        let tempInventoryCheck = [...this.state.inventory.map(i => ({...i}))];
        for (const id of inputItemIds) {
            const entry = tempInventoryCheck.find(i => i.itemId === id);
            if (!entry || entry.quantity < 1) return { success: false, message: `Недостаточно предмета для контракта.` };
            entry.quantity -= 1;
        }
        const preview = this.getContractPreview(inputItems, dustToAdd)!;
        const random = Math.random() * 100;
        let cumulativeChance = 0;
        let finalRarity: Rarity = 'White';
        for (const rarityChance of preview.chances) {
            const chance = parseFloat(rarityChance.chance === '<0.1' ? '0.09' : rarityChance.chance);
            cumulativeChance += chance;
            if (random < cumulativeChance) {
                finalRarity = rarityChance.rarity as Rarity;
                break;
            }
        }
        let lootTable = this.state.items.filter(i => i.collection === preview.targetCollection && i.rarity === finalRarity);
        if (lootTable.length === 0) {
            lootTable = this.state.items.filter(i => i.rarity === finalRarity && i.isPurchasable);
        }
        if (lootTable.length === 0) {
             // Если даже в any нет, даем случайный белый предмет
            lootTable = this.state.items.filter(i => i.rarity === 'White' && i.isPurchasable);
            if (lootTable.length === 0) return { success: false, message: 'Не удалось создать предмет. Ресурсы возвращены.' };
        }
        const resultItem = lootTable[Math.floor(Math.random() * lootTable.length)];
        let newInventory = [...this.state.inventory];
        inputItemIds.forEach(id => {
            const index = newInventory.findIndex(i => i.itemId === id);
            newInventory[index] = { ...newInventory[index], quantity: newInventory[index].quantity - 1 };
        });
        const dustIndex = newInventory.findIndex(i => i.itemId === DUST_ITEM_ID);
        if (dustIndex > -1) {
            newInventory[dustIndex] = { ...newInventory[dustIndex], quantity: newInventory[dustIndex].quantity - dustToAdd };
        }
        const resultIndex = newInventory.findIndex(i => i.itemId === resultItem.id);
        if (resultIndex > -1) {
            newInventory[resultIndex] = { ...newInventory[resultIndex], quantity: newInventory[resultIndex].quantity + 1 };
        } else {
            newInventory.push({ itemId: resultItem.id, quantity: 1 });
        }
        newInventory = newInventory.filter(i => i.quantity > 0);
        this.state = { ...this.state, inventory: newInventory };
        this.notify();
        return { success: true, message: `Контракт исполнен! Вы получили: [${resultItem.rarity}] "${resultItem.name}".` };
    },
    buyPack(collectionName: string): { success: boolean, message: string, itemsReceived?: string[] } {
        const packInfo = collectionPacks.find(p => p.collectionName === collectionName);
        if (!packInfo) return { success: false, message: 'Набор не найден.' };
        const userDustEntry = this.state.inventory.find(i => i.itemId === DUST_ITEM_ID);
        if (!userDustEntry || userDustEntry.quantity < packInfo.dustCost) return { success: false, message: 'Недостаточно пыли для покупки набора.' };
        const lootTable = this.state.items.filter(i => i.collection === collectionName);
        if (lootTable.length === 0) return { success: false, message: 'В этой коллекции нет предметов.' };
        const itemsReceived: string[] = [];
        let updatedInventory = [...this.state.inventory];
        for (let i = 0; i < 3; i++) {
            const randomItem = lootTable[Math.floor(Math.random() * lootTable.length)];
            itemsReceived.push(randomItem.name);
            const itemEntryIndex = updatedInventory.findIndex(inv => inv.itemId === randomItem.id);
            if (itemEntryIndex > -1) {
                updatedInventory = updatedInventory.map((item, index) => 
                    index === itemEntryIndex ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                updatedInventory = [...updatedInventory, { itemId: randomItem.id, quantity: 1 }];
            }
        }
        const finalInventory = updatedInventory.map(i => i.itemId === DUST_ITEM_ID ? {...i, quantity: i.quantity - packInfo.dustCost} : i);
        this.state = { ...this.state, inventory: finalInventory };
        this.notify();
        return { success: true, message: 'Набор успешно открыт!', itemsReceived };
    }
};

export default collectiblesService;