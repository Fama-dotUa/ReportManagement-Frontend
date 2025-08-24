import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Предполагаем, что хук вернет и CPN
import './CasinoPage.css';

interface CouponConverterProps {
    onBack: () => void;
}

const CouponConverter: React.FC<CouponConverterProps> = ({ onBack }) => {
    // Получаем текущие балансы пользователя
    // Вам нужно будет добавить CPN в данные, возвращаемые useAuth
    const { user } = useAuth(); 
    const currentUserCR = user?.CR || 0;
    const currentUserCPN = user?.CPN || 0; // ЗАГЛУШКА: Предполагаемый баланс CPN

    const [crToCpnAmount, setCrToCpnAmount] = useState('');
    const [cpnToCrAmount, setCpnToCrAmount] = useState('');

    const handleExchange = (from: string, to: string, amount: string) => {
        const numericAmount = parseInt(amount, 10);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert('Пожалуйста, введите корректное число больше нуля.');
            return;
        }

        // Здесь должна быть логика отправки запроса на ваш API для обновления балансов
        console.log(`Exchanging ${numericAmount} ${from} to ${to} for user ${user?.id}`);
        alert(`Запрос на обмен ${numericAmount} ${from} на ${to} отправлен (симуляция).`);
        
        // В идеале, после успешного ответа от сервера, нужно обновить состояние пользователя
        // через React Query (invalidateQueries) или другой менеджер состояний.
    };


    return (
        <div className="coupon-converter">
            <button className="ingame-back-button back-to-main" onClick={onBack}>
                Назад в казино
            </button>
            <h2>Обмен валют</h2>
            <div className="converter-forms">
                {/* Форма CR -> CPN */}
                <div className="converter-form">
                    <h3>CR в CPN</h3>
                    <p>Ваш баланс: {currentUserCR} CR</p>
                    <input
                        type="number"
                        placeholder="Сумма CR"
                        value={crToCpnAmount}
                        onChange={(e) => setCrToCpnAmount(e.target.value)}
                        min="1"
                    />
                    <button onClick={() => handleExchange('CR', 'CPN', crToCpnAmount)}>
                        Обменять
                    </button>
                </div>

                {/* Форма CPN -> CR */}
                <div className="converter-form">
                    <h3>CPN в CR</h3>
                    <p>Ваш баланс: {currentUserCPN} CPN</p>
                    <input
                        type="number"
                        placeholder="Сумма CPN"
                        value={cpnToCrAmount}
                        onChange={(e) => setCpnToCrAmount(e.target.value)}
                        min="1"
                    />
                    <button onClick={() => handleExchange('CPN', 'CR', cpnToCrAmount)}>
                        Обменять
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CouponConverter;
