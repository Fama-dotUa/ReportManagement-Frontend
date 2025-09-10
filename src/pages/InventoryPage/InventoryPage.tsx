import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DUST_ITEM_ID } from '../../services/collectiblesService';
import type { CollectibleItem } from '../../components/Types/collectibles';
import { useCollectibles } from '../../hooks/useCollectibles'; // <-- ИМПОРТ НАШЕГО ХУКА
import ItemActionsModal from './ItemActionsModal';
import CollectionPacksModal from './CollectionPacksModal';
import './InventoryPage.css';

export type OwnedItem = CollectibleItem & { quantity: number };

const InventoryPage: React.FC = () => {
    const navigate = useNavigate();
    // --- ИСПОЛЬЗУЕМ ХУК ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ ---
    const { items, inventory } = useCollectibles(); 
    
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [isPacksModalOpen, setIsPacksModalOpen] = useState(false);

    // --- ПЕРЕСЧИТЫВАЕМ ДАННЫЕ ПРИ КАЖДОМ РЕНДЕРЕ (ЭТО ЭФФЕКТИВНО) ---
    const { ownedItems, dustAmount } = useMemo(() => {
        const dustEntry = inventory.find(invItem => invItem.itemId === DUST_ITEM_ID);
        const currentDustAmount = dustEntry ? dustEntry.quantity : 0;

        const currentOwnedItems: OwnedItem[] = inventory
            .filter(invItem => invItem.itemId !== DUST_ITEM_ID)
            .map(invItem => {
                const itemDetails = items.find(shopItem => shopItem.id === invItem.itemId);
                return { ...itemDetails!, quantity: invItem.quantity };
            })
            .filter(item => item.id);

        return { ownedItems: currentOwnedItems, dustAmount: currentDustAmount };
    }, [items, inventory]); // useMemo будет пересчитывать только если items или inventory изменились

    const handleItemClick = (item: OwnedItem) => {
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
                    <div 
                        className="balance-display" 
                        style={{borderColor: '#ab47bc', cursor: 'pointer'}}
                        onClick={() => setIsPacksModalOpen(true)}
                    >
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