import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollectibles } from '../../hooks/useCollectibles';
import collectiblesService, { DUST_ITEM_ID } from '../../services/collectiblesService';
import type { CollectibleItem } from '../../components/Types/collectibles';
import './ContractPage.css';

// Создаем локальный тип для удобства работы с инвентарем в этом компоненте
type InventoryDisplayItem = CollectibleItem & { userQuantity: number };

const ContractPage: React.FC = () => {
    const navigate = useNavigate();
    
    // Получаем всегда актуальные данные из нашего кастомного хука
    const { items, inventory } = useCollectibles();

    // Состояние для 5 слотов контракта. null означает пустой слот.
    const [slots, setSlots] = useState<(CollectibleItem | null)[]>([null, null, null, null, null]);
    // Состояние для количества пыли, добавленной через слайдер
    const [dustToAdd, setDustToAdd] = useState(0);

    // useMemo используется для оптимизации: эти сложные вычисления будут запускаться только
    // когда inventory, items или slots изменятся.
    const { userDust, availableItems } = useMemo(() => {
        const dust = inventory.find(i => i.itemId === DUST_ITEM_ID)?.quantity ?? 0;
        
        // Сначала считаем, сколько предметов каждого типа уже находится в слотах
        const slotCounts: Record<number, number> = {};
        slots.forEach(item => {
            if (item) {
                slotCounts[item.id] = (slotCounts[item.id] || 0) + 1;
            }
        });

        // Теперь формируем список доступных для добавления предметов.
        // Мы берем общее количество из инвентаря и вычитаем то, что уже в слотах.
        const available = inventory
            .filter(invItem => invItem.itemId !== DUST_ITEM_ID)
            .map(invItem => {
                const details = items.find(i => i.id === invItem.itemId)!;
                const quantityInSlots = slotCounts[invItem.itemId] || 0;
                return { ...details, userQuantity: invItem.quantity - quantityInSlots };
            })
            .filter(item => item.userQuantity > 0); // Показываем только те, что еще остались

        return { userDust: dust, availableItems: available };
    }, [inventory, items, slots]);

    // useMemo для прогноза. Пересчитывается только при изменении слотов или количества пыли.
    const preview = useMemo(() => {
        const filledSlots = slots.filter(Boolean) as CollectibleItem[];
        return collectiblesService.getContractPreview(filledSlots, dustToAdd);
    }, [slots, dustToAdd]);

    // Добавляет предмет в первый доступный пустой слот
    const handleAddItemToSlot = (item: InventoryDisplayItem) => {
        const nextEmptySlotIndex = slots.findIndex(slot => slot === null);
        if (nextEmptySlotIndex !== -1) {
            const newSlots = [...slots]; // Создаем новый массив
            newSlots[nextEmptySlotIndex] = item;
            setSlots(newSlots); // Обновляем состояние
        }
    };

    // Убирает предмет из слота по клику, делая слот снова пустым
    const handleRemoveItemFromSlot = (index: number) => {
        const newSlots = [...slots]; // Создаем новый массив
        newSlots[index] = null;
        setSlots(newSlots); // Обновляем состояние
    };

    // Выполняет контракт
    const handlePerformContract = () => {
        const itemIds = slots.map(item => item?.id).filter(Boolean) as number[];
        const result = collectiblesService.performContract(itemIds, dustToAdd);
        alert(result.message);
        if (result.success) {
            // Сбрасываем состояние после успешного контракта
            setSlots([null, null, null, null, null]);
            setDustToAdd(0);
        }
    };

    return (
        <div className="collectibles-page">
            <div className="collectibles-header">
                <button className="ingame-back-button" onClick={() => navigate('/casino/inventory')}>
                    Назад в инвентарь
                </button>
                <h2>Алхимический Контракт</h2>
                <div className="balance-display" style={{borderColor: '#ab47bc'}}>
                    Ваша пыль: {userDust} ✨
                </div>
            </div>
            <div className="contract-page">
                <div className="contract-inventory-panel">
                    <h3>Ваши предметы</h3>
                    <div className="inventory-list">
                        {availableItems.map(item => (
                            <div 
                                key={item.id} 
                                className={`inventory-item rarity-${item.rarity}`} 
                                onClick={() => handleAddItemToSlot(item)}
                                title="Нажмите, чтобы добавить в слот"
                            >
                                <div className={`item-icon inventory-item-icon rarity-${item.rarity}`}>{item.name.charAt(0)}</div>
                                <div className="inventory-item-name">{item.name}</div>
                                <div className="inventory-item-qty">x{item.userQuantity}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="contract-main-panel">
                    <div className="contract-slots">
                        {slots.map((item, index) => (
                            <div 
                                key={index} 
                                className={`contract-slot ${item ? `filled rarity-${item.rarity}` : ''}`} 
                                onClick={() => handleRemoveItemFromSlot(index)}
                                title={item ? "Нажмите, чтобы убрать предмет" : "Пустой слот"}
                            >
                                {item && <div className={`item-icon slot-item-icon rarity-${item.rarity}`}>{item.name.charAt(0)}</div>}
                            </div>
                        ))}
                    </div>
                    <div className="contract-controls">
                        <div className="dust-slider-group">
                            <label htmlFor="dust">Добавить пыль для повышения шанса: {dustToAdd} / {userDust}</label>
                            <input 
                                type="range" 
                                id="dust" 
                                className="dust-slider"
                                min="0" 
                                max={userDust}
                                value={dustToAdd}
                                onChange={e => setDustToAdd(Number(e.target.value))}
                            />
                        </div>
                        <div className="contract-preview">
                            {preview ? (
                                <>
                                    <h4>Прогноз результата</h4>
                                    <p>Целевая коллекция: {preview.targetCollection}</p>
                                    <p>Результат: {preview.baseRarity} (Шанс на {preview.nextRarity}: {preview.upgradeChance}%)</p>
                                </>
                            ) : <p>Добавьте предметы для прогноза</p>}
                        </div>
                        <button 
                            className="perform-contract-btn"
                            disabled={slots.some(s => s === null)}
                            onClick={handlePerformContract}
                        >
                            Исполнить контракт
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractPage;