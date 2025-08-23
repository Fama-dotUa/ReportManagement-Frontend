import React, { useState, useEffect } from 'react';
// ИЗМЕНЕНИЕ: Используем глобальный контекст для статистики игрока вместо useAuth
import { usePlayerStats } from './PlayerStatsContext'; 
import './SlotsGame.css';

// --- Игровая логика и настройки ---
// Шансы на победу изменены, частые символы сделаны реже
const symbols = [
    // Редкие
    '7️⃣', '⭐', '7️⃣', '⭐',
    // Нечастые
    '🍉', '🍇', '🍊', '🍉', '🍇', '🍊','🍉', '🍇',
    // Частые
    '🍋', '🍒', '🍋', '🍒', '🍋', '🍒', '🍋', '🍒', '🍋', '🍒', '🍊', '🍒', '🍊',
];
const reelCount = 7;
const visibleSymbols = 5; 

// Обновленная таблица выплат с максимальным множителем x10
// Эта таблица теперь используется и для вертикальных комбинаций
const payouts: { [key: string]: { [count: number]: number } } = {
    '🍒': { 3: 1.1, 4: 1.2, 5: 1.3, 6: 1.4, 7: 1.5 },
    '🍋': { 3: 1.2, 4: 1.4, 5: 1.6, 6: 1.8, 7: 2.0 },
    '🍊': { 3: 1.3, 4: 1.6, 5: 1.9, 6: 2.2, 7: 2.5 },
    '🍇': { 3: 1.5, 4: 2.0, 5: 2.5, 6: 3.0, 7: 3.5 },
    '🍉': { 3: 1.8, 4: 2.6, 5: 3.2, 6: 3.8, 7: 4.4 },
    '⭐': { 3: 2.0, 4: 2.8, 5: 3.6, 6: 4.4, 7: 5.2 },
    '7️⃣': { 3: 3.0, 4: 4.0, 5: 5.0, 6: 6.0, 7: 10 },
};

// Создаем длинную ленту символов для анимации каждого барабана
const createReelStrip = (length = 50) => {
    return Array.from({ length }, () => symbols[Math.floor(Math.random() * symbols.length)]);
};

const SlotsGame: React.FC = () => {
    // ИЗМЕНЕНИЕ: Получаем данные из глобального контекста
    const { balance, updateBalance, addXp } = usePlayerStats();
    
    const [betAmount, setBetAmount] = useState(10);
    const [reels, setReels] = useState<string[][]>(() => Array(reelCount).fill(Array(visibleSymbols).fill('❓')));
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState('Place your bet and spin!');
    const [superGameProgress, setSuperGameProgress] = useState(0);
    const [freeSpins, setFreeSpins] = useState(0);
    const [isAutoSpin, setIsAutoSpin] = useState(false);
    const [isWinning, setIsWinning] = useState(false);

    // Логика для авто-спина
    useEffect(() => {
        let autoSpinTimeout: NodeJS.Timeout;
        if (isAutoSpin && !spinning && freeSpins === 0) {
            if (betAmount > balance) {
                setMessage("Insufficient balance for Auto-Spin!");
                setIsAutoSpin(false);
            } else {
                autoSpinTimeout = setTimeout(handleSpin, 2300);
            }
        }
        return () => clearTimeout(autoSpinTimeout);
    }, [isAutoSpin, spinning, balance]);

    const handleSpin = () => {
        if (spinning) return;
        if (freeSpins === 0 && betAmount > balance) {
            setMessage("Insufficient balance!");
            setIsAutoSpin(false); 
            return;
        }

        if (freeSpins > 0) {
            setFreeSpins(prev => prev - 1);
        } else {
            // ИЗМЕНЕНИЕ: Обновляем глобальный баланс
            updateBalance(balance - betAmount);
        }
        
        setSpinning(true);
        setMessage('Spinning...');

        const reelStrips = Array.from({ length: reelCount }, () => createReelStrip());
        setReels(reelStrips);

        setTimeout(() => {
            const finalReels: string[][] = [];
            for (let i = 0; i < reelCount; i++) {
                const resultStrip = reelStrips[i].slice(-visibleSymbols);
                finalReels.push(resultStrip);
            }
            setReels(finalReels);
            setSpinning(false);
            calculateWinnings(finalReels);
        }, 2000); 
    };

    // --- НОВАЯ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ---
    // Находит все последовательные комбинации символов в линии или колонке
    const findConsecutiveCounts = (line: string[]): { [key: string]: number[] } => {
        if (line.length === 0) return {};

        const allCounts: { [key: string]: number[] } = {};
        let currentSymbol = line[0];
        let currentCount = 1;

        for (let i = 1; i < line.length; i++) {
            if (line[i] === currentSymbol) {
                currentCount++;
            } else {
                if (!allCounts[currentSymbol]) allCounts[currentSymbol] = [];
                allCounts[currentSymbol].push(currentCount);
                
                currentSymbol = line[i];
                currentCount = 1;
            }
        }
        // Добавляем последнюю найденную последовательность
        if (!allCounts[currentSymbol]) allCounts[currentSymbol] = [];
        allCounts[currentSymbol].push(currentCount);

        return allCounts;
    };

    // --- ОБНОВЛЕННАЯ ЛОГИКА РАСЧЕТА ВЫИГРЫШЕЙ С УЧЕТОМ СОСЕДНИХ СИМВОЛОВ ---
    const calculateWinnings = (finalReels: string[][]) => {
        const effectiveBet = freeSpins > 0 ? 5 : betAmount;
        let totalMultiplier = 0;
        const winMessages: string[] = [];
        let winningCombos = 0;

        // Функция для обработки найденных комбинаций
        const processCounts = (counts: { [key: string]: number[] }, type: '(H)' | '(V)') => {
            for (const symbol in counts) {
                for (const count of counts[symbol]) {
                    if (payouts[symbol] && payouts[symbol][count]) {
                        const multiplier = payouts[symbol][count];
                        totalMultiplier += multiplier;
                        winMessages.push(`${count} x ${symbol} ${type}`);
                        winningCombos++;
                    }
                }
            }
        };

        // --- 1. Горизонтальная проверка (только соседние) ---
        const centerLine = finalReels.map(reel => reel[Math.floor(visibleSymbols / 2)]);
        const horizontalConsecutiveCounts = findConsecutiveCounts(centerLine);
        processCounts(horizontalConsecutiveCounts, '(H)');

        // --- 2. Вертикальная проверка (только соседние) ---
        finalReels.forEach((reel) => {
            const verticalConsecutiveCounts = findConsecutiveCounts(reel);
            processCounts(verticalConsecutiveCounts, '(V)');
        });

        // --- 3. Итоговый расчет ---
        if (winningCombos > 0) {
            const finalMultiplier = totalMultiplier - (winningCombos > 1 ? (winningCombos - 1) : 0);
            const winAmount = effectiveBet * finalMultiplier;
            const netWin = winAmount - effectiveBet;

            const finalMessage = `Win! ${winMessages.join(' & ')} pays ${winAmount.toFixed(1)} CPN!`;
            setMessage(finalMessage);

            updateBalance(balance - effectiveBet + winAmount);
            if (netWin > 0) {
                addXp(netWin);
            }
            
            setIsWinning(true);
            setTimeout(() => setIsWinning(false), 2000);

            if (freeSpins <= 0) {
                updateSuperGame(winAmount, effectiveBet);
            }
        } else {
            setMessage('You lose. Try again!');
        }
    };

    const updateSuperGame = (winAmount: number, currentBet: number) => {
        const progressToAdd = (winAmount / currentBet) * 2;
        
        setSuperGameProgress(prev => {
            const newProgress = prev + progressToAdd;
            if (newProgress >= 100) {
                setMessage("SUPER GAME! You won 10 Freespins!");
                setFreeSpins(10);
                return 0;
            }
            return newProgress;
        });
    };

    const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 1;
        const clampedValue = Math.max(1, Math.min(value, 250));
        setBetAmount(clampedValue);
    };

    const toggleAutoSpin = () => {
        if (!isAutoSpin && betAmount > balance) {
            setMessage("Insufficient balance to start Auto-Spin!");
            return;
        }
        setIsAutoSpin(!isAutoSpin);
    }

    return (
        <div className="slots-game">
            <div className={`slots-display ${isWinning ? 'win-animation' : ''}`}>
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
                    {/* ИЗМЕНЕНИЕ: Отображаем глобальный баланс */}
                    <span>Balance: {balance.toFixed(1)} CPN</span>
                    {freeSpins > 0 && <span className="freespins-info">Freespins: {freeSpins}</span>}
                </div>
                <div className="betting-controls">
                    <input
                        type="number"
                        value={betAmount}
                        onChange={handleBetAmountChange}
                        disabled={spinning || freeSpins > 0 || isAutoSpin}
                    />
                    <button onClick={handleSpin} disabled={spinning || isAutoSpin}>
                        {spinning ? 'Spinning...' : (freeSpins > 0 ? `Free Spin (${freeSpins})` : 'Spin')}
                    </button>
                    <button onClick={toggleAutoSpin} disabled={spinning || freeSpins > 0} className={isAutoSpin ? 'autospin-active' : ''}>
                        {isAutoSpin ? 'Stop Auto' : 'Start Auto'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SlotsGame;
