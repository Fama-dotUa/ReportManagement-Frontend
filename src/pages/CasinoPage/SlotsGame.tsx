import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './SlotsGame.css';

// --- Игровая логика и настройки ---
// Шансы на победу снижены за счет добавления более частых символов
const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '7️⃣', '🍒', '🍋', '🍊', '🍇', '🍒', '🍋'];
const reelCount = 7;
const visibleSymbols = 5; // Теперь отображается 5 символов

// Таблица выплат: [символ]: { [количество_совпадений]: множитель_ставки }
const payouts: { [key: string]: { [count: number]: number } } = {
    '🍒': { 3: 2, 4: 5, 5: 10, 6: 20, 7: 50 },
    '🍋': { 3: 2, 4: 5, 5: 10, 6: 20, 7: 50 },
    '🍊': { 3: 3, 4: 8, 5: 15, 6: 30, 7: 75 },
    '🍇': { 3: 3, 4: 8, 5: 15, 6: 30, 7: 75 },
    '🍉': { 3: 5, 4: 10, 5: 25, 6: 50, 7: 100 },
    '⭐': { 3: 10, 4: 25, 5: 50, 6: 100, 7: 250 },
    '7️⃣': { 3: 20, 4: 50, 5: 100, 6: 250, 7: 500 },
};

// Создаем длинную ленту символов для анимации каждого барабана
const createReelStrip = (length = 50) => {
    return Array.from({ length }, () => symbols[Math.floor(Math.random() * symbols.length)]);
};

const SlotsGame: React.FC = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(user?.CPN || 1000);
    const [betAmount, setBetAmount] = useState(10);
    const [reels, setReels] = useState<string[][]>(() => Array(reelCount).fill(Array(visibleSymbols).fill('❓')));
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState('Place your bet and spin!');
    const [superGameProgress, setSuperGameProgress] = useState(0);
    const [freeSpins, setFreeSpins] = useState(0);

    const handleSpin = () => {
        if (freeSpins === 0 && betAmount > balance) {
            setMessage("Insufficient balance!");
            return;
        }

        if (freeSpins > 0) {
            setFreeSpins(prev => prev - 1);
        } else {
            setBalance(prev => prev - betAmount);
        }
        
        setSpinning(true);
        setMessage('Spinning...');

        const reelStrips = Array.from({ length: reelCount }, () => createReelStrip());

        // Устанавливаем начальное состояние для анимации
        setReels(reelStrips);

        setTimeout(() => {
            const finalReels: string[][] = [];
            for (let i = 0; i < reelCount; i++) {
                // Последние 5 символов в ленте - это наш результат
                const resultStrip = reelStrips[i].slice(-visibleSymbols);
                finalReels.push(resultStrip);
            }
            setReels(finalReels);
            setSpinning(false);
            calculateWinnings(finalReels);
        }, 3000); // Длительность анимации
    };

    const calculateWinnings = (finalReels: string[][]) => {
        const centerLine = finalReels.map(reel => reel[Math.floor(visibleSymbols / 2)]); // Центральная линия для 5 символов (индекс 2)
        const counts: { [key: string]: number } = {};
        
        for (const symbol of centerLine) {
            counts[symbol] = (counts[symbol] || 0) + 1;
        }

        let winAmount = 0;
        let winMessage = 'You lose. Try again!';

        for (const symbol in counts) {
            const count = counts[symbol];
            if (payouts[symbol] && payouts[symbol][count]) {
                const multiplier = payouts[symbol][count];
                winAmount = betAmount * multiplier;
                winMessage = `Win! ${count} x ${symbol} pays ${winAmount} CPN!`;
                break; // Выплачиваем только за одну выигрышную комбинацию
            }
        }

        if (winAmount > 0) {
            setBalance(prev => prev + winAmount);
            // Обновляем шкалу супер-игры только при выигрыше и если это не фриспин
            if (freeSpins <= 0) {
                updateSuperGame(winAmount, betAmount);
            }
        }
        setMessage(winMessage);
    };

    const updateSuperGame = (winAmount: number, currentBet: number) => {
        // Прогресс зависит от множителя выигрыша. Выигрыш x10 дает 10% прогресса.
        const progressToAdd = (winAmount / currentBet);
        
        setSuperGameProgress(prev => {
            const newProgress = prev + progressToAdd;
            if (newProgress >= 100) {
                // Запускаем супер-игру: даем 10 фриспинов
                setMessage("SUPER GAME! You won 10 Freespins!");
                setFreeSpins(10);
                return 0; // Сбрасываем шкалу
            }
            return newProgress;
        });
    };

    const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 1;
        const clampedValue = Math.max(1, Math.min(value, 500)); // Макс. ставка 500
        setBetAmount(clampedValue);
    };

    return (
        <div className="slots-game">
            <div className="slots-display">
                <div className="reels-container">
                    {reels.map((reel, reelIndex) => (
                        <div key={reelIndex} className="reel">
                            <div className={`reel-strip ${spinning ? 'spinning' : ''}`}>
                                {reel.map((symbol, symbolIndex) => (
                                    <div key={symbolIndex} className="symbol">
                                        {symbol}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="win-line"></div>
            </div>

            <div className="super-game-bar-container">
                <span>Super Game</span>
                <div className="bar-background">
                    <div className="bar-progress" style={{ width: `${superGameProgress}%` }}></div>
                </div>
                <span>{Math.floor(superGameProgress)}%</span>
            </div>

            <div className="game-message">{message}</div>

            <div className="controls">
                <div className="balance-info">
                    <span>Balance: {balance} CPN</span>
                    {freeSpins > 0 && <span className="freespins-info">Freespins: {freeSpins}</span>}
                </div>
                <div className="betting-controls">
                    <input
                        type="number"
                        value={betAmount}
                        onChange={handleBetAmountChange}
                        disabled={spinning || freeSpins > 0}
                    />
                    <button onClick={handleSpin} disabled={spinning}>
                        {spinning ? 'Spinning...' : (freeSpins > 0 ? `Free Spin (${freeSpins})` : 'Spin')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SlotsGame;
