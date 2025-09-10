// --- START OF FILE src/components/CollectibleCard/CollectibleCard.tsx ---

import React from 'react';
import { Collectible, Rarity } from '../../types/collectibles';
import './CollectibleCard.css'; // Создадим этот CSS файл ниже

interface CollectibleCardProps {
    item: Collectible;
    quantity?: number; // Опционально для инвентаря
    onBuy?: (itemId: string) => void; // Опционально для магазина
    canBuy?: boolean; // Опционально для магазина, чтобы отключить кнопку
    availableQuantity?: number; // Опционально для магазина
}

const rarityColors: Record<Rarity, string> = {
    'Белый': '#e0e0e0', // Светло-серый
    'Зеленый': '#6dd47e', // Светло-зеленый
    'Синий': '#6d99d4', // Светло-синий
    'Фиолетовый': '#b06dd4', // Светло-фиолетовый
    'Золотой': '#d4b06d', // Золотистый
    'Красный': '#d46d6d', // Светло-красный
};

const CollectibleCard: React.FC<CollectibleCardProps> = ({ item, quantity, onBuy, canBuy = true, availableQuantity }) => {
    const cardStyle = {
        borderColor: rarityColors[item.rarity] || '#ccc',
        boxShadow: `0 0 10px ${rarityColors[item.rarity] || '#ccc'}`
    };

    return (
        <div className="collectible-card" style={cardStyle}>
            <div className="collectible-image-container">
                <img src={item.imageUrl} alt={item.name} className="collectible-image" />
            </div>
            <h3 className="collectible-name">{item.name}</h3>
            <p className="collectible-rarity" style={{ color: rarityColors[item.rarity] }}>
                {item.rarity}
            </p>
            {quantity !== undefined && <p className="collectible-quantity">Кол-во: {quantity}</p>}
            {onBuy && (
                <>
                    <p className="collectible-cost">Цена: {item.cost} CPN</p>
                    {availableQuantity !== undefined && (
                        <p className="collectible-available">Доступно: {availableQuantity}</p>
                    )}
                    <button
                        className="buy-button"
                        onClick={() => onBuy(item.id)}
                        disabled={!canBuy || availableQuantity === 0}
                    >
                        {availableQuantity === 0 ? 'Нет в наличии' : 'Купить'}
                    </button>
                </>
            )}
        </div>
    );
};

export default CollectibleCard;

// --- END OF FILE src/components/CollectibleCard/CollectibleCard.tsx ---