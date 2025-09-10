import React from 'react';
import collectiblesService, { collectionPacks } from '../../services/collectiblesService';
// --- ИСПРАВЛЕННЫЙ ИМПОРТ ---
import type { CollectionPack } from '../../components/Types/collectibles';
import './CollectionPacksModal.css';

interface CollectionPacksModalProps {
    userDust: number;
    onClose: () => void;
}

const CollectionPacksModal: React.FC<CollectionPacksModalProps> = ({ userDust, onClose }) => {

    const handleBuyPack = (collectionName: string) => {
        const result = collectiblesService.buyPack(collectionName);
        if (result.success) {
            alert(`Вы получили:\n- ${result.itemsReceived?.join('\n- ')}`);
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="pack-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Наборы коллекций</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    {collectionPacks.map(pack => (
                        <div key={pack.collectionName} className="pack-card">
                            <div className="pack-info">
                                <h4>{pack.collectionName}</h4>
                                <p>{pack.description}</p>
                            </div>
                            <div className="pack-buy-section">
                                <div className="pack-cost">{pack.dustCost} ✨</div>
                                <button 
                                    className="pack-buy-btn"
                                    disabled={userDust < pack.dustCost}
                                    onClick={() => handleBuyPack(pack.collectionName)}
                                >
                                    Купить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CollectionPacksModal;