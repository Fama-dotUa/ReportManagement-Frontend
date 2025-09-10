import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStats } from '../CasinoPage/PlayerStatsContext';
import collectiblesService from '../../services/collectiblesService';
import type { CollectibleItem } from '../../components/Types/collectibles';
import './CollectiblesShopPage.css';

const CollectiblesShopPage: React.FC = () => {
    const navigate = useNavigate();
    const { balance, updateBalance } = usePlayerStats();
    
    const [items, setItems] = useState<CollectibleItem[]>([]);
    const [inventory, setInventory] = useState<number[]>([]);

    useEffect(() => {
        const handleStateUpdate = (newState: { items: CollectibleItem[], inventory: number[] }) => {
            setItems(newState.items);
            setInventory(newState.inventory);
        };
        collectiblesService.subscribe(handleStateUpdate);
        return () => collectiblesService.unsubscribe(handleStateUpdate);
    }, []);

    const handleBuy = (itemId: number) => {
        const result = collectiblesService.buyItem(itemId, balance);
        if (result.success && result.newBalance !== undefined) {
            updateBalance(result.newBalance);
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="collectibles-page">
            <div className="collectibles-header">
                <button className="ingame-back-button" onClick={() => navigate('/casino')}>
                    Назад в казино
                </button>
                <h2>Магазин Коллекций</h2>
                <div className="balance-display">Баланс: {balance.toFixed(2)} CPN</div>
            </div>
            <div className="items-grid">
                {items.map(item => {
                    const isOwned = inventory.includes(item.id);
                    const canAfford = balance >= item.price;
                    const isOutOfStock = item.stock <= 0;

                    return (
                        <div key={item.id} className={`item-card rarity-${item.rarity}`}>
                            {isOwned && <span className="owned-badge">В коллекции</span>}
                            <div className="item-image-wrapper">
                                <div className="item-image">{item.image}</div>
                            </div>
                            <div className="item-name">{item.name}</div>
                            <div className="item-details">
                                <div className="item-price">{item.price} CPN</div>
                                <div className="item-stock">Осталось: {item.stock}</div>
                            </div>
                            <button 
                                onClick={() => handleBuy(item.id)}
                                disabled={isOwned || !canAfford || isOutOfStock}
                            >
                                {isOwned ? 'Куплено' : (isOutOfStock ? 'Нет в наличии' : 'Купить')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CollectiblesShopPage;