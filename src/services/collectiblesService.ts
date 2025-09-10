import type { CollectibleItem } from '../components/Types/collectibles';

// --- //! СИМУЛЯЦИЯ БАЗЫ ДАННЫХ НА СЕРВЕРЕ ---
const shopItems: CollectibleItem[] = [
    // White (Обычные)
    { id: 1, name: 'Древняя монета', price: 1000, rarity: 'White', stock: 99, image: '🪙' },
    { id: 13, name: 'Потускневший ключ', price: 1200, rarity: 'White', stock: 99, image: '🗝️' },
    { id: 14, name: 'Старая кость', price: 1500, rarity: 'White', stock: 99, image: '🦴' },

    // Green (Необычные)
    { id: 2, name: 'Клевер Удачи', price: 2500, rarity: 'Green', stock: 50, image: '🍀' },
    { id: 7, name: 'Карта Джокера', price: 3333, rarity: 'Green', stock: 30, image: '🃏' },
    { id: 15, name: 'Эльфийская стрела', price: 4000, rarity: 'Green', stock: 40, image: '🏹' },
    { id: 16, name: 'Зелье лечения', price: 5500, rarity: 'Green', stock: 25, image: '🧪' },

    // Blue (Редкие)
    { id: 3, name: 'Сапфировый глаз', price: 7000, rarity: 'Blue', stock: 25, image: '🧿' },
    { id: 17, name: 'Рунический камень', price: 9000, rarity: 'Blue', stock: 20, image: '🗿' },
    { id: 18, name: 'Морозный кристалл', price: 11000, rarity: 'Blue', stock: 18, image: '❄️' },
    
    // Purple (Эпические)
    { id: 4, name: 'Амулет Тени', price: 15000, rarity: 'Purple', stock: 10, image: '🔮' },
    { id: 19, name: 'Осколок Бездны', price: 22000, rarity: 'Purple', stock: 8, image: '🌌' },
    { id: 20, name: 'Запретный гримуар', price: 30000, rarity: 'Purple', stock: 5, image: '📖' },

    // Gold (Легендарные)
    { id: 5, name: 'Золотой Дракон', price: 50000, rarity: 'Gold', stock: 5, image: '🐲' },
    { id: 8, name: 'Корона Короля', price: 75000, rarity: 'Gold', stock: 3, image: '👑' },
    { id: 21, name: 'Перо Феникса', price: 95000, rarity: 'Gold', stock: 2, image: '🪶' },

    // Red (Мифические)
    { id: 6, name: 'Сердце вулкана', price: 120000, rarity: 'Red', stock: 2, image: '❤️‍🔥' },
    { id: 22, name: 'Философский камень', price: 250000, rarity: 'Red', stock: 1, image: '♦️' },
];

// //! Таблица в БД, хранящая предметы пользователя (user_id -> item_id[])
let userInventory: number[] = [1, 13]; // Предположим, у пользователя уже есть пара предметов

// ---------------------------------------------

const collectiblesService = {
    state: {
        items: shopItems,
        inventory: userInventory,
    },
    subscribers: [] as ((state: any) => void)[],

    subscribe(callback: (state: any) => void) {
        this.subscribers.push(callback);
        callback(this.state);
    },
    unsubscribe(callback: (state: any) => void) {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    },
    notify() {
        this.subscribers.forEach(callback => callback(this.state));
    },

    // --- //! ЛОГИКА ПОКУПКИ ПРЕДМЕТА НА СЕРВЕРЕ ---
    buyItem(itemId: number, userBalance: number): { success: boolean, message: string, newBalance?: number } {
        //! 1. Найти предмет в "базе данных" магазина.
        const item = this.state.items.find(i => i.id === itemId);

        if (!item) {
            return { success: false, message: 'Предмет не найден!' };
        }

        //! 2. Проверить, есть ли предмет в наличии.
        if (item.stock <= 0) {
            return { success: false, message: 'Этого предмета больше нет в наличии.' };
        }

        //! 3. Проверить, достаточно ли у пользователя средств.
        if (userBalance < item.price) {
            return { success: false, message: 'Недостаточно CPN для покупки.' };
        }
        
        //! 4. Проверить, нет ли у пользователя уже этого предмета.
        if (this.state.inventory.includes(itemId)) {
            return { success: false, message: 'У вас уже есть этот предмет.' };
        }

        //! 5. Все проверки пройдены. Начинаем "транзакцию".
        // Уменьшаем количество в магазине
        item.stock -= 1;
        // Добавляем предмет в инвентарь пользователя
        this.state.inventory.push(itemId);
        // Высчитываем новый баланс пользователя
        const newBalance = userBalance - item.price;

        console.log(`//! Пользователь купил ${item.name}. Списано ${item.price} CPN.`);

        // Уведомляем всех подписчиков об изменении состояния
        this.notify();

        //! 6. Возвращаем успешный результат и новый баланс.
        return { success: true, message: `Вы успешно купили "${item.name}"!`, newBalance };
    }
};

export default collectiblesService;