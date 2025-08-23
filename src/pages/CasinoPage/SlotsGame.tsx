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
    const { balance, updateBalance, addXp } = usePlayerStats();
    
    const [betAmount, setBetAmount] = useState(10);
    const [reels, setReels] = useState<string[][]>(() => Array(reelCount).fill(Array(visibleSymbols).fill('❓')));
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState('Place your bet and spin!');
    const [superGameProgress, setSuperGameProgress] = useState(0);
    const [freeSpins, setFreeSpins] = useState(0);
    const [isAutoSpin, setIsAutoSpin] = useState(false);
    const [isWinning, setIsWinning] = useState(false);
    const [winningSymbols, setWinningSymbols] = useState<[number, number][]>([]);

    // --- НОВЫЕ СОСТОЯНИЯ ДЛЯ ЛОГИКИ "ОХЛАЖДЕНИЯ" ---
    const [consecutiveWins, setConsecutiveWins] = useState(0);
    const [cooldownSpins, setCooldownSpins] = useState(0);


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

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ГЕНЕРАЦИИ И АНАЛИЗА ---
    const findConsecutiveSequences = (line: string[]): { symbol: string, count: number, startIndex: number }[] => {
        if (line.length === 0) return [];
        const sequences: { symbol: string, count: number, startIndex: number }[] = [];
        let currentSymbol = line[0];
        let currentCount = 1;
        let startIndex = 0;
        for (let i = 1; i < line.length; i++) {
            if (line[i] === currentSymbol) {
                currentCount++;
            } else {
                sequences.push({ symbol: currentSymbol, count: currentCount, startIndex });
                currentSymbol = line[i];
                currentCount = 1;
                startIndex = i;
            }
        }
        sequences.push({ symbol: currentSymbol, count: currentCount, startIndex });
        return sequences;
    };

    const analyzeWinnings = (finalReels: string[][]) => {
        let totalMultiplier = 0;
        const winMessages: string[] = [];
        let winningCombos = 0;
        const newWinningCoords: [number, number][] = [];

        // Горизонтальная
        const centerLine = finalReels.map(reel => reel[Math.floor(visibleSymbols / 2)]);
        const horizontalSequences = findConsecutiveSequences(centerLine);
        for (const seq of horizontalSequences) {
            if (payouts[seq.symbol] && payouts[seq.symbol][seq.count]) {
                totalMultiplier += payouts[seq.symbol][seq.count];
                winMessages.push(`${seq.count} x ${seq.symbol} (H)`);
                winningCombos++;
                for (let i = 0; i < seq.count; i++) newWinningCoords.push([seq.startIndex + i, Math.floor(visibleSymbols / 2)]);
            }
        }

        // Вертикальная
        finalReels.forEach((reel, reelIndex) => {
            const verticalSequences = findConsecutiveSequences(reel);
            for (const seq of verticalSequences) {
                if (payouts[seq.symbol] && payouts[seq.symbol][seq.count] && seq.count >= 3) {
                    totalMultiplier += payouts[seq.symbol][seq.count];
                    winMessages.push(`${seq.count} x ${seq.symbol} (V)`);
                    winningCombos++;
                    for (let i = 0; i < seq.count; i++) newWinningCoords.push([reelIndex, seq.startIndex + i]);
                }
            }
        });

        // Диагонали \
        for (let k = -(visibleSymbols - 1); k < reelCount; k++) {
            const diagLine: string[] = [], diagCoords: [number, number][] = [];
            for (let c = 0; c < reelCount; c++) {
                const r = c - k;
                if (r >= 0 && r < visibleSymbols) {
                    diagLine.push(finalReels[c][r]);
                    diagCoords.push([c, r]);
                }
            }
            if (diagLine.length < 3) continue;
            const diagSequences = findConsecutiveSequences(diagLine);
            for (const seq of diagSequences) {
                if (payouts[seq.symbol] && payouts[seq.symbol][seq.count] && seq.count >= 3) {
                    totalMultiplier += payouts[seq.symbol][seq.count];
                    winMessages.push(`${seq.count} x ${seq.symbol} (D)`);
                    winningCombos++;
                    for (let i = 0; i < seq.count; i++) newWinningCoords.push(diagCoords[seq.startIndex + i]);
                }
            }
        }

        // Диагонали /
        for (let k = 0; k < reelCount + visibleSymbols - 1; k++) {
            const antiDiagLine: string[] = [], antiDiagCoords: [number, number][] = [];
            for (let c = 0; c < reelCount; c++) {
                const r = k - c;
                if (r >= 0 && r < visibleSymbols) {
                    antiDiagLine.push(finalReels[c][r]);
                    antiDiagCoords.push([c, r]);
                }
            }
            if (antiDiagLine.length < 3) continue;
            const antiDiagSequences = findConsecutiveSequences(antiDiagLine);
            for (const seq of antiDiagSequences) {
                if (payouts[seq.symbol] && payouts[seq.symbol][seq.count] && seq.count >= 3) {
                    totalMultiplier += payouts[seq.symbol][seq.count];
                    winMessages.push(`${seq.count} x ${seq.symbol} (D)`);
                    winningCombos++;
                    for (let i = 0; i < seq.count; i++) newWinningCoords.push(antiDiagCoords[seq.startIndex + i]);
                }
            }
        }
        
        return { winningCombos, totalMultiplier, winMessages, newWinningCoords };
    };

    // --- ОБНОВЛЕННЫЙ HANDLESPIN С ЛОГИКОЙ "ОХЛАЖДЕНИЯ" ---
    const handleSpin = () => {
        if (spinning) return;
        if (freeSpins === 0 && betAmount > balance) {
            setMessage("Insufficient balance!");
            setIsAutoSpin(false); 
            return;
        }

        setWinningSymbols([]);
        if (freeSpins > 0) {
            setFreeSpins(prev => prev - 1);
        } else {
            updateBalance(balance - betAmount);
        }
        
        setSpinning(true);
        setMessage('Spinning...');

        let finalReels: string[][];
        let animationReels: string[][];

        if (cooldownSpins > 0) {
            let hasWins;
            do {
                animationReels = Array.from({ length: reelCount }, () => createReelStrip());
                finalReels = animationReels.map(strip => strip.slice(-visibleSymbols));
                const analysis = analyzeWinnings(finalReels);
                hasWins = analysis.winningCombos > 0;
            } while (hasWins);
            
            setCooldownSpins(prev => {
                const newCooldown = prev - 1;
                if (newCooldown > 0) {
                    setMessage(`Cooldown active for ${newCooldown} more spin(s)...`);
                }
                return newCooldown;
            });
        } else {
            animationReels = Array.from({ length: reelCount }, () => createReelStrip());
            finalReels = animationReels.map(strip => strip.slice(-visibleSymbols));
        }

        setReels(animationReels);

        setTimeout(() => {
            setReels(finalReels);
            setSpinning(false);
            calculateWinnings(finalReels);
        }, 2000); 
    };

    // --- ОБНОВЛЕННЫЙ CALCULATEWINNINGS ДЛЯ ОТСЛЕЖИВАНИЯ ПОБЕД ---
    const calculateWinnings = (finalReels: string[][]) => {
        const { winningCombos, totalMultiplier, winMessages, newWinningCoords } = analyzeWinnings(finalReels);

        if (winningCombos > 0) {
            const newWinCount = consecutiveWins + 1;
            setConsecutiveWins(newWinCount);

            if (newWinCount >= 3) {
                const newCooldown = Math.floor(Math.random() * 5) + 1; // 1 to 5
                setCooldownSpins(newCooldown);
                setConsecutiveWins(0); // Сбрасываем счетчик
            }

            const uniqueCoords = Array.from(new Set(newWinningCoords.map(JSON.stringify)), JSON.parse);
            setWinningSymbols(uniqueCoords);

            const finalMultiplier = totalMultiplier - (winningCombos > 1 ? (winningCombos - 1) : 0);
            const effectiveBet = freeSpins > 0 ? 5 : betAmount;
            const winAmount = effectiveBet * finalMultiplier;
            const netWin = winAmount - effectiveBet;

            let finalMessage = `Win! ${winMessages.join(' & ')} pays ${winAmount.toFixed(1)} CPN!`;
            if (newWinCount >= 3) {
                finalMessage += ` Cooldown for ${cooldownSpins} spins activated!`;
            }
            setMessage(finalMessage);

            updateBalance(balance - effectiveBet + winAmount);
            if (netWin > 0) addXp(netWin);
            
            setIsWinning(true);
            setTimeout(() => setIsWinning(false), 2000);

            if (freeSpins <= 0) updateSuperGame(winAmount, effectiveBet);
        } else {
            setConsecutiveWins(0); // Сбрасываем счетчик при проигрыше
            if (cooldownSpins <= 0) {
                setMessage('You lose. Try again!');
            }
        }
    };

    const updateSuperGame = (winAmount: number, currentBet: number) => {
        const progressToAdd = (winAmount / currentBet) / 2;
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
                                    <div 
                                        key={symbolIndex} 
                                        className={`symbol ${winningSymbols.some(coord => coord[0] === reelIndex && coord[1] === symbolIndex) ? 'highlight' : ''}`}
                                    >
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
