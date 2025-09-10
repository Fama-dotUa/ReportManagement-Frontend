import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import collectiblesService from '../../services/collectiblesService';
import type { CollectibleItem } from '../../components/Types/collectibles';
import './InventoryPage.css';

const InventoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [ownedItems, setOwnedItems] = useState<CollectibleItem[]>([]);

    useEffect(() => {
        const handleStateUpdate = (newState: { items: CollectibleItem[], inventory: number[] }) => {
            const userOwned = newState.items.filter(item => newState.inventory.includes(item.id));
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
                <div></div> {/* Пустой div для выравнивания */}
            </div>
            {ownedItems.length > 0 ? (
                <div className="items-grid">
                    {ownedItems.map(item => (
                        <div key={item.id} className={`item-card rarity-${item.rarity}`}>
                            <div className="item-image-wrapper">
                                <div className="item-image">{item.image}</div>
                            </div>
                            <div className="item-name">{item.name}</div>
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