import React from 'react';

// --- ИСПРАВЛЕННЫЙ ПУТЬ ---
import type { CollectibleItem } from '../Types/collectibles'; 
// -------------------------

import './CollectibleCard.css'; // Предполагаем, что стили будут в этом файле

// Определяем props для компонента
interface CollectibleCardProps {
    item: CollectibleItem;
    quantity?: number; // Количество, опционально (для инвентаря)
    onBuy?: (itemId: number) => void; // Функция покупки, опционально (для магазина)
    isShopCard: boolean; // Флаг, чтобы различать карточку магазина и инвентаря
    balance?: number; // Баланс игрока, нужен для магазина
}

const CollectibleCard: React.FC<CollectibleCardProps> = ({ item, quantity, onBuy, isShopCard, balance }) => {
    
    const canAfford = isShopCard ? (balance ?? 0) >= item.price : false;
    const isOutOfStock = item.stock <= 0;

    return (
        <div className={`item-card rarity-${item.rarity}`}>
            {quantity !== undefined && (
                <span className="item-owned-count">
                    {isShopCard ? `В коллекции: ${quantity}` : `Количество: ${quantity}`}
                </span>
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

            {isShopCard ? (
                // --- Разметка для магазина ---
                <>
                    <div className="item-details">
                        <div className="item-price">{item.price} CPN</div>
                        <div className="item-stock">Осталось: {item.stock}</div>
                    </div>
                    <button 
                        onClick={() => onBuy && onBuy(item.id)}
                        disabled={!canAfford || isOutOfStock}
                    >
                        {isOutOfStock ? 'Нет в наличии' : 'Купить'}
                    </button>
                </>
            ) : (
                // --- Разметка для инвентаря ---
                <div className="item-details">
                    <span style={{color: '#ccc'}}>Стоимость:</span>
                    <span className="item-price">{item.price} CPN</span>
                </div>
            )}
        </div>
    );
};

export default CollectibleCard;