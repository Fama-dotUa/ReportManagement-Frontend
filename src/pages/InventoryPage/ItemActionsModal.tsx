import React, { useState } from 'react';
import type { OwnedItem } from './InventoryPage'; // Импортируем тип из родителя
import collectiblesService from '../../services/collectiblesService';
import './ItemActionsModal.css';

interface ItemActionsModalProps {
    item: OwnedItem;
    onClose: () => void;
}

const ItemActionsModal: React.FC<ItemActionsModalProps> = ({ item, onClose }) => {
    const [salvageQuantity, setSalvageQuantity] = useState(1);
    const [transferQuantity, setTransferQuantity] = useState(1);
    const [targetUser, setTargetUser] = useState('');

    const handleSalvage = () => {
        const result = collectiblesService.salvageItem(item.id, salvageQuantity);
        alert(result.message);
        if (result.success) onClose();
    };
    
    const handleTransfer = () => {
        if (!targetUser) {
            alert('Введите имя пользователя для передачи.');
            return;
        }
        const result = collectiblesService.transferItem(targetUser, item.id, transferQuantity);
        alert(result.message);
        if (result.success) onClose();
    };

    const handleDelete = () => {
        if (window.confirm(`Вы уверены, что хотите УДАЛИТЬ ВСЕ ${item.quantity}x "${item.name}"? Это действие необратимо.`)) {
            const result = collectiblesService.deleteItem(item.id);
            alert(result.message);
            if (result.success) onClose();
        }
    };
    
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{item.name}</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    {/* Секция Передачи/Продажи */}
                    <div className="action-section">
                        <h4>Передать предмет</h4>
                        <div className="input-group">
                            <label>Имя игрока:</label>
                            <input type="text" value={targetUser} onChange={e => setTargetUser(e.target.value)} placeholder="Username" />
                            <label>Количество (макс: {item.quantity}):</label>
                            <input type="number" value={transferQuantity} onChange={e => setTransferQuantity(Math.max(1, Math.min(item.quantity, Number(e.target.value))))} min="1" max={item.quantity} />
                        </div>
                        <button className="action-btn btn-transfer" onClick={handleTransfer}>Передать</button>
                    </div>

                    {/* Секция Разбора */}
                    {item.salvageValue > 0 && (
                        <div className="action-section">
                            <h4>Разобрать на пыль</h4>
                             <div className="input-group">
                                <label>Количество (макс: {item.quantity}):</label>
                                <input type="number" value={salvageQuantity} onChange={e => setSalvageQuantity(Math.max(1, Math.min(item.quantity, Number(e.target.value))))} min="1" max={item.quantity} />
                                <p>Вы получите: {item.salvageValue * salvageQuantity} Магической пыли</p>
                            </div>
                            <button className="action-btn btn-salvage" onClick={handleSalvage}>Разобрать</button>
                        </div>
                    )}

                     {/* Секция Удаления */}
                    <div className="action-section">
                        <h4>Опасная зона</h4>
                        <button className="action-btn btn-delete" onClick={handleDelete}>Удалить все предметы</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemActionsModal;