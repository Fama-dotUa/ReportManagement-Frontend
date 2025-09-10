import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStats } from '../CasinoPage/PlayerStatsContext';
import collectiblesService from '../../services/collectiblesService';
import { useCollectibles } from '../../hooks/useCollectibles'; // <-- ИМПОРТ НАШЕГО ХУКА
import './CollectiblesShopPage.css';

const CollectiblesShopPage: React.FC = () => {
    const navigate = useNavigate();
    const { balance, updateBalance } = usePlayerStats();
    // --- ИСПОЛЬЗУЕМ ХУК ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ ---
    const { items, inventory } = useCollectibles();

    // --- ВЫЧИСЛЯЕМ СПИСОК ТОВАРОВ ДЛЯ МАГАЗИНА ---
    const shopItems = useMemo(() => items.filter(item => item.isPurchasable), [items]);

    const handleBuy = (itemId: number) => {
        const result = collectiblesService.buyItem(itemId, balance);
        if (result.success && result.newBalance !== undefined) {
            updateBalance(result.newBalance);
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
                {shopItems.map(item => {
                    const canAfford = balance >= item.price;
                    const isOutOfStock = item.stock <= 0;
                    const ownedEntry = inventory.find(invItem => invItem.itemId === item.id);
                    const ownedQuantity = ownedEntry ? ownedEntry.quantity : 0;

                    return (
                        <div key={item.id} className={`item-card rarity-${item.rarity}`}>
                            {ownedQuantity > 0 && (
                                <span className="item-owned-count">В коллекции: {ownedQuantity}</span>
                            )}
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
                                <div className="item-price">{item.price} CPN</div>
                                <div className="item-stock">Осталось: {item.stock}</div>
                            </div>
                            <button 
                                onClick={() => handleBuy(item.id)}
                                disabled={!canAfford || isOutOfStock}
                            >
                                {isOutOfStock ? 'Нет в наличии' : 'Купить'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CollectiblesShopPage;