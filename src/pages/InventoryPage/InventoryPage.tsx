import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DUST_ITEM_ID } from '../../services/collectiblesService';
import type { CollectibleItem } from '../../components/Types/collectibles';
import { useCollectibles } from '../../hooks/useCollectibles';
import ItemActionsModal from './ItemActionsModal';
import CollectionPacksModal from './CollectionPacksModal';
import './InventoryPage.css';

// Экспортируем этот тип, так как он используется в дочернем компоненте ItemActionsModal
export type OwnedItem = CollectibleItem & { quantity: number };

const InventoryPage: React.FC = () => {
    const navigate = useNavigate();
    
    // Используем наш кастомный хук для получения всегда актуальных данных из сервиса
    const { items, inventory } = useCollectibles(); 
    
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [isPacksModalOpen, setIsPacksModalOpen] = useState(false);

    // Используем useMemo для эффективного пересчета данных только когда инвентарь или список предметов меняется
    const { ownedItems, dustAmount } = useMemo(() => {
        // Находим пыль в инвентаре пользователя
        const dustEntry = inventory.find(invItem => invItem.itemId === DUST_ITEM_ID);
        const currentDustAmount = dustEntry ? dustEntry.quantity : 0;

        // Формируем список остальных предметов, которые есть у пользователя, исключая пыль
        const currentOwnedItems: OwnedItem[] = inventory
            .filter(invItem => invItem.itemId !== DUST_ITEM_ID) // Исключаем пыль из основного списка
            .map(invItem => {
                const itemDetails = items.find(shopItem => shopItem.id === invItem.itemId);
                // Объединяем детали предмета с его количеством у пользователя
                return { ...itemDetails!, quantity: invItem.quantity };
            })
            .filter(item => item.id); // Убираем предметы, которые могли быть удалены из игры

        return { ownedItems: currentOwnedItems, dustAmount: currentDustAmount };
    }, [items, inventory]);

    // Обработчик клика по карточке предмета для открытия модального окна действий
    const handleItemClick = (item: OwnedItem) => {
        if (item.id === DUST_ITEM_ID) return; // На всякий случай, чтобы пыль не открывала это окно
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
                    <div 
                        className="balance-display" 
                        style={{borderColor: '#ab47bc', cursor: 'pointer'}}
                        onClick={() => setIsPacksModalOpen(true)}
                        title="Купить наборы коллекций"
                    >
                        Магическая пыль: {dustAmount} ✨
                    </div>
                </div>

                <button 
                    className="perform-contract-btn" 
                    style={{width: '100%', maxWidth: '500px', margin: '10px 0'}} 
                    onClick={() => navigate('/casino/contract')}
                >
                    Перейти к контрактам
                </button>

                {ownedItems.length > 0 ? (
                    <div className="items-grid">
                        {ownedItems.map(item => (
                            <div 
                                key={item.id} 
                                className={`item-card rarity-${item.rarity}`} 
                                onClick={() => handleItemClick(item)} 
                                style={{cursor: 'pointer'}}
                                title="Нажмите для действий с предметом"
                            >
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
            
            {/* Условный рендер модальных окон */}
            {selectedItem && (
                <ItemActionsModal 
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
            {isPacksModalOpen && (
                <CollectionPacksModal
                    userDust={dustAmount}
                    onClose={() => setIsPacksModalOpen(false)}
                />
            )}
        </>
    );
};

export default InventoryPage;