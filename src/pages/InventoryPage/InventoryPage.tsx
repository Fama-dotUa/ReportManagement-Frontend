import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import collectiblesService, { DUST_ITEM_ID } from '../../services/collectiblesService';
import type { CollectibleItem, UserInventoryItem } from '../../components/Types/collectibles';
import ItemActionsModal from './ItemActionsModal';
import './InventoryPage.css';

export type OwnedItem = CollectibleItem & { quantity: number };

const InventoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
    const [dustAmount, setDustAmount] = useState(0); // <-- НОВОЕ СОСТОЯНИЕ ДЛЯ ПЫЛИ
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);

    useEffect(() => {
        const handleStateUpdate = (newState: { items: CollectibleItem[], inventory: UserInventoryItem[] }) => {
            // --- ИЗМЕНЕНИЕ: Разделяем логику для пыли и остальных предметов ---

            // 1. Находим пыль в инвентаре пользователя
            const dustEntry = newState.inventory.find(invItem => invItem.itemId === DUST_ITEM_ID);
            setDustAmount(dustEntry ? dustEntry.quantity : 0);

            // 2. Формируем список остальных предметов, исключая пыль
            const userOwned: OwnedItem[] = newState.inventory
                .filter(invItem => invItem.itemId !== DUST_ITEM_ID) // Исключаем пыль из списка
                .map(invItem => {
                    const itemDetails = newState.items.find(shopItem => shopItem.id === invItem.itemId);
                    return { ...itemDetails!, quantity: invItem.quantity };
                })
                .filter(item => item.id);

            setOwnedItems(userOwned);
        };
        collectiblesService.subscribe(handleStateUpdate);
        return () => collectiblesService.unsubscribe(handleStateUpdate);
    }, []);

    const handleItemClick = (item: OwnedItem) => {
        // Запрещаем открывать модальное окно для пыли, если она вдруг попадет в список
        if (item.id === DUST_ITEM_ID) return;
        setSelectedItem(item);
    };

    return (
        <>
            <div className="collectibles-page">
                <div className="collectibles-header">
                    <button className="ingame-back-button" onClick={() => navigate('/casino')}>
                        Назад в казино
                    </button>
                    <h2>Ваш Инвентарь</h2>
                    {/* --- НОВЫЙ БЛОК ДЛЯ ОТОБРАЖЕНИЯ ПЫЛИ --- */}
                    <div className="balance-display" style={{borderColor: '#ab47bc'}}>
                        Магическая пыль: {dustAmount} ✨
                    </div>
                </div>
                {ownedItems.length > 0 ? (
                    <div className="items-grid">
                        {ownedItems.map(item => (
                            <div key={item.id} className={`item-card rarity-${item.rarity}`} onClick={() => handleItemClick(item)} style={{cursor: 'pointer'}}>
                                <span className="item-owned-count">Количество: {item.quantity}</span>
                                <div className={`item-icon rarity-${item.rarity}`}>
                                    {item.name.charAt(0)}
                                </div>
                                <div className="item-name-wrapper">
                                    <div className="item-name">{item.name}</div>
                                    {item.collection !== 'any' && (
                                        <div className="item-collection">[{item.collection}]</div>
                                    )}
                                </div>
                                <p className="item-description">{item.description}</p>
                                <div className="item-details">
                                    <span style={{color: '#ccc'}}>Стоимость:</span>
                                    <span className="item-price">{item.price > 0 ? `${item.price} CPN` : '-'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{color: 'white', fontSize: '1.2rem', marginTop: '50px'}}>У вас нет коллекционных предметов.</p>
                )}
            </div>
            {selectedItem && (
                <ItemActionsModal 
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </>
    );
};

export default InventoryPage;