import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollectibles } from '../../hooks/useCollectibles';
import collectiblesService, { DUST_ITEM_ID } from '../../services/collectiblesService';
import type { CollectibleItem } from '../../components/Types/collectibles';
import './ContractPage.css';

type InventoryDisplayItem = CollectibleItem & { userQuantity: number };

const ContractPage: React.FC = () => {
    const navigate = useNavigate();
    const { items, inventory } = useCollectibles();

    const [slots, setSlots] = useState<(CollectibleItem | null)[]>([null, null, null, null, null]);
    const [dustToAdd, setDustToAdd] = useState(0);

    const { userDust, availableItems, totalInputValue } = useMemo(() => {
        const dust = inventory.find(i => i.itemId === DUST_ITEM_ID)?.quantity ?? 0;
        
        const slotCounts: Record<number, number> = {};
        slots.forEach(item => {
            if (item) slotCounts[item.id] = (slotCounts[item.id] || 0) + 1;
        });

        const available = inventory
            .filter(invItem => invItem.itemId !== DUST_ITEM_ID)
            .map(invItem => {
                const details = items.find(i => i.id === invItem.itemId)!;
                const quantityInSlots = slotCounts[invItem.itemId] || 0;
                return { ...details, userQuantity: invItem.quantity - quantityInSlots };
            })
            .filter(item => item.userQuantity > 0);
        
        // --- НОВЫЙ РАСЧЕТ: Суммируем стоимость предметов в слотах ---
        const currentTotalValue = slots.reduce((sum, item) => sum + (item?.price || 0), 0);

        return { userDust: dust, availableItems: available, totalInputValue: currentTotalValue };
    }, [inventory, items, slots]);

    const preview = useMemo(() => {
        const filledSlots = slots.filter(Boolean) as CollectibleItem[];
        return collectiblesService.getContractPreview(filledSlots, dustToAdd);
    }, [slots, dustToAdd]);

    const handleAddItemToSlot = (item: InventoryDisplayItem) => {
        const nextEmptySlotIndex = slots.findIndex(slot => slot === null);
        if (nextEmptySlotIndex !== -1) {
            const newSlots = [...slots];
            newSlots[nextEmptySlotIndex] = item;
            setSlots(newSlots);
        }
    };

    const handleRemoveItemFromSlot = (index: number) => {
        const newSlots = [...slots];
        newSlots[index] = null;
        setSlots(newSlots);
    };

    const handlePerformContract = () => {
        const itemIds = slots.map(item => item?.id).filter(Boolean) as number[];
        // --- ИЗМЕНЕНИЕ: Теперь performContract будет возвращать и сам предмет ---
        const result = collectiblesService.performContract(itemIds, dustToAdd);
        
        // --- ИЗМЕНЕНИЕ: Формируем более информативное сообщение ---
        if (result.success) {
            const resultItemDetails = items.find(i => i.id === result.newItemId);
            const message = `Контракт исполнен!\n\nВы получили: [${resultItemDetails?.rarity}] "${resultItemDetails?.name}"\nСтоимость: ${resultItemDetails?.price} CPN`;
            alert(message);
            setSlots([null, null, null, null, null]);
            setDustToAdd(0);
        } else {
            alert(result.message);
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
                            <div key={item.id} className={`inventory-item rarity-${item.rarity}`} onClick={() => handleAddItemToSlot(item)}>
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
                            <div key={index} className={`contract-slot ${item ? `filled rarity-${item.rarity}` : ''}`} onClick={() => handleRemoveItemFromSlot(index)}>
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
                            <h4>Прогноз результата</h4>
                            {preview ? (
                                <>
                                    <p>Целевая коллекция: {preview.targetCollection}</p>
                                    <div className="chance-list">
                                        {preview.chances.map(c => (
                                            <span key={c.rarity} className={`rarity-${c.rarity}`}>
                                                {c.rarity}: {c.chance}%
                                            </span>
                                        ))}
                                    </div>
                                </>
                            ) : <p>Добавьте предметы для прогноза</p>}
                        </div>
                        
                        {/* --- НОВЫЙ БЛОК ДЛЯ ОТОБРАЖЕНИЯ СУММЫ --- */}
                        <div className="contract-summary">
                            Общая стоимость вложенных предметов: <span className="summary-value">{totalInputValue} CPN</span>
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