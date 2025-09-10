import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import collectiblesService from '../../services/collectiblesService';
import type { CollectibleItem, UserInventoryItem } from '../../components/Types/collectibles';
import './InventoryPage.css';

type OwnedItem = CollectibleItem & { quantity: number };

const InventoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);

    useEffect(() => {
        const handleStateUpdate = (newState: { items: CollectibleItem[], inventory: UserInventoryItem[] }) => {
            const userOwned: OwnedItem[] = newState.inventory.map(invItem => {
                const itemDetails = newState.items.find(shopItem => shopItem.id === invItem.itemId);
                return { ...itemDetails!, quantity: invItem.quantity };
            }).filter(item => item.id);

            setOwnedItems(userOwned);
        };
        collectiblesService.subscribe(handleStateUpdate);
        return () => collectiblesService.unsubscribe(handleStateUpdate);
    }, []);

    return (
        <div className="collectibles-page">
            <div className="collectibles-header">
                <button className="ingame-back-button" onClick={() => navigate('/casino')}>
                    Назад в казино
                </button>
                <h2>Ваш Инвентарь</h2>
                <div></div>
            </div>
            {ownedItems.length > 0 ? (
                <div className="items-grid">
                    {ownedItems.map(item => (
                        <div key={item.id} className={`item-card rarity-${item.rarity}`}>
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

                            {/* ДОБАВЛЕН БЛОК ОПИСАНИЯ */}
                            <p className="item-description">{item.description}</p>
                            
                            <div className="item-details">
                                <span style={{color: '#ccc'}}>Стоимость:</span>
                                <span className="item-price">{item.price} CPN</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{color: 'white', fontSize: '1.2rem', marginTop: '50px'}}>Ваш инвентарь пуст. Посетите магазин, чтобы приобрести предметы!</p>
            )}
        </div>
    );
};

export default InventoryPage;