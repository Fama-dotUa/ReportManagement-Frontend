import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './RouletteGame.css';

// Определяем цвета для номеров по принципу: нечетные - красные, четные - черные
const numberColors: { [key: number]: string } = {
    0: 'green',  1: 'red',  2: 'black', 3: 'red',  4: 'black', 5: 'red',  6: 'black',
    7: 'red',  8: 'black', 9: 'red', 10: 'black', 11: 'red', 12: 'black',
    13: 'red', 14: 'black', 15: 'red', 16: 'black', 17: 'red', 18: 'black',
    19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black',
    25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'red', 30: 'black',
    31: 'red', 32: 'black', 33: 'red', 34: 'black', 35: 'red', 36: 'black',
};

// --- СИМУЛЯЦИЯ СЕРВЕРА ДЛЯ СИНХРОНИЗАЦИИ ---
const rouletteService = {
    state: {
        countdown: 60,
        isSpinning: false,
        winningNumber: null as number | null,
        history: [] as number[], 
    },
    subscribers: [] as ((state: any) => void)[],
    timerId: null as NodeJS.Timeout | null,

    subscribe(callback: (state: any) => void) {
        this.subscribers.push(callback);
        callback(this.state);
    },

    unsubscribe(callback: (state: any) => void) {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    },

    notify() {
        this.subscribers.forEach(callback => callback(this.state));
    },

    start() {
        if (this.timerId) return;
        this.timerId = setInterval(() => {
            if (!this.state.isSpinning) {
                const newCountdown = this.state.countdown - 1;
                this.state = { ...this.state, countdown: newCountdown };
                
                if (newCountdown <= 0) {
                    this.spin();
                } else {
                    this.notify();
                }
            }
        }, 1000);
    },

    spin() {
        if (this.state.isSpinning) return;
        const newWinningNumber = Math.floor(Math.random() * 37);
        this.state = {
            ...this.state,
            isSpinning: true,
            winningNumber: newWinningNumber,
        };
        this.notify();

        setTimeout(() => {
            const newHistory = [...this.state.history, newWinningNumber];
            if (newHistory.length > 15) newHistory.shift(); 
            
            this.state = { ...this.state, isSpinning: false, countdown: 60, history: newHistory };
            this.notify();
        }, 7000); 
    }
};

rouletteService.start();
// ---------------------------------------------

// Вспомогательная функция для получения случайного числа
const getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const rouletteNumbers = Array.from({ length: 37 }, (_, i) => i);
const wheelNumbers = Array.from({ length: 20 }).flatMap(() => rouletteNumbers); // Увеличим длину ленты на всякий случай

const RouletteGame: React.FC = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(user?.CPN || 5000);
    const [betAmount, setBetAmount] = useState(10);
    const [bets, setBets] = useState<{ [key: string]: number }>({});
    const [spinResult, setSpinResult] = useState<{ number: number; color: string } | null>(null);
    const [totalWin, setTotalWin] = useState(0);
    const [betsAccepted, setBetsAccepted] = useState(false);
    
    const [gameState, setGameState] = useState(rouletteService.state);
    const { isSpinning, countdown, winningNumber, history } = gameState;

    const [spinCount, setSpinCount] = useState(0);
    const [lastSpinTranslateX, setLastSpinTranslateX] = useState(-500);
    const [isResetting, setIsResetting] = useState(false);
    // Новое состояние для случайных оборотов
    const [randomRotations, setRandomRotations] = useState(() => getRandomNumber(3, 7));

    useEffect(() => {
        const handleStateUpdate = (newState: any) => {
            // Когда начинается новый спин
            if (!gameState.isSpinning && newState.isSpinning) {
                setRandomRotations(getRandomNumber(3, 7)); // Генерируем новое случайное число
            }

            // Когда спин заканчивается
            if (gameState.isSpinning && !newState.isSpinning) {
                calculateWinnings(newState.winningNumber);
                setSpinResult({ number: newState.winningNumber, color: numberColors[newState.winningNumber] });
                setBetsAccepted(false); 

                const centeringOffset = 500;
                // Используем `randomRotations` для расчета конечной точки
                const finalTarget = (37 * (randomRotations + spinCount)) + (newState.winningNumber ?? 0);
                const finalTranslateX = -(finalTarget * 100 - centeringOffset);
                setLastSpinTranslateX(finalTranslateX);
                
                // Логика сброса, чтобы лента не уходила за экран
                if (spinCount > 5) {
                    setTimeout(() => {
                        setIsResetting(true);
                        setSpinCount(1);
                        const resetTarget = (37 * (randomRotations + 1)) + (newState.winningNumber ?? 0);
                        const resetTranslateX = -(resetTarget * 100 - centeringOffset);
                        setLastSpinTranslateX(resetTranslateX);
                        
                        setTimeout(() => setIsResetting(false), 50);
                    }, 50);
                } else {
                    setSpinCount(prev => prev + 1);
                }
            }
            setGameState(newState);
        };

        rouletteService.subscribe(handleStateUpdate);
        return () => rouletteService.unsubscribe(handleStateUpdate);
    }, [gameState.isSpinning, bets, betsAccepted, spinCount, randomRotations]); // Добавляем randomRotations в зависимости

    const placeBet = (betType: string) => {
        if (betsAccepted) {
            alert("Ставки уже приняты, дождитесь следующего раунда.");
            return;
        }
        if (betAmount > balance) {
            alert("Недостаточно средств для ставки!");
            return;
        }
        
        // Проверка на максимальную ОБЩУЮ ставку
        const totalCurrentBet = Object.values(bets).reduce((sum, current) => sum + current, 0);
        if (totalCurrentBet + betAmount > 500) {
            alert("Общая сумма ставок не может превышать 500 CPN!");
            return;
        }

        setBalance(prev => prev - betAmount);
        setBets(prev => ({
            ...prev,
            [betType]: (prev[betType] || 0) + betAmount
        }));
    };

    const handleAcceptBets = () => {
        if (Object.keys(bets).length === 0) {
            alert("Сделайте хотя бы одну ставку!");
            return;
        }
        setBetsAccepted(true);
        setSpinResult(null); 
    };

    const handleCancelBets = () => {
        if (betsAccepted) return;
        let totalBetAmount = 0;
        for (const betType in bets) {
            totalBetAmount += bets[betType];
        }
        setBalance(prev => prev + totalBetAmount);
        setBets({});
    };

    const calculateWinnings = (winner: number) => {
        if (!betsAccepted) return;

        let winnings = 0;
        const winnerColor = numberColors[winner];

        for (const betType in bets) {
            const betValue = bets[betType];
            let isWin = false;
            let multiplier = 0;

            if (betType.startsWith('number_')) {
                if (parseInt(betType.split('_')[1]) === winner) {
                    isWin = true;
                    multiplier = 36;
                }
            } else {
                switch (betType) {
                    case 'red': if (winnerColor === 'red') isWin = true; break;
                    case 'black': if (winnerColor === 'black') isWin = true; break;
                    case 'even': if (winner !== 0 && winner % 2 === 0) isWin = true; break;
                    case 'odd': if (winner !== 0 && winner % 2 !== 0) isWin = true; break;
                    case '1-18': if (winner >= 1 && winner <= 18) isWin = true; break;
                    case '19-36': if (winner >= 19 && winner <= 36) isWin = true; break;
                    case '1-12': if (winner >= 1 && winner <= 12) isWin = true; break;
                    case '13-24': if (winner >= 13 && winner <= 24) isWin = true; break;
                    case '25-36': if (winner >= 25 && winner <= 36) isWin = true; break;
                    case 'col1': if (winner > 0 && winner % 3 === 1) isWin = true; break;
                    case 'col2': if (winner > 0 && winner % 3 === 2) isWin = true; break;
                    case 'col3': if (winner > 0 && winner % 3 === 0) isWin = true; break;
                }

                if (isWin) {
                    multiplier = ['red', 'black', 'even', 'odd', '1-18', '19-36'].includes(betType) ? 2 : 3;
                }
            }

            if (isWin) {
                winnings += betValue * multiplier;
            }
        }
        setBalance(prev => prev + winnings);
        setTotalWin(winnings);
        setBets({});
    };

    const getBetDisplay = (betType: string) => {
        if (bets[betType]) {
            return <div className="bet-chip">{bets[betType]}</div>;
        }
        return null;
    };

    const getTransformValue = () => {
        const centeringOffset = 500;
        
        if (isSpinning) {
            const spinTarget = (37 * (randomRotations + spinCount)) + (winningNumber ?? 0);
            return -(spinTarget * 100 - centeringOffset);
        } else {
            return lastSpinTranslateX;
        }
    };

    return (
        <div className="roulette-game">
            <div className="roulette-history">
                <span>Last 5:</span>
                {history.map((num: number, index: number) => (
                    <div key={index} className={`history-number ${numberColors[num]}`}>
                        {num}
                    </div>
                ))}
            </div>
            <div className="roulette-wheel-container">
                <div className="roulette-pointer"></div>
                <div className={`roulette-wheel ${isSpinning ? 'spinning' : ''} ${isResetting ? 'no-transition' : ''}`}
                     style={{ transform: `translateX(${getTransformValue()}px)` }}>
                    {wheelNumbers.map((num, index) => (
                        <div key={index} className={`roulette-number ${numberColors[num]}`}>
                            {num}
                        </div>
                    ))}
                </div>
            </div>

            <div className="roulette-info-bar">
                {isSpinning ? (
                    <div className="info-text">Вращение...</div>
                ) : betsAccepted ? (
                    <div className="info-text accepted">Ставки приняты! Спин через: {countdown} сек.</div>
                ) : (
                    <div className="info-text">Следующий спин через: {countdown} сек.</div>
                )}
            </div>

            {spinResult && (
                <div className="result-display">
                    Выпало число: <span className={spinResult.color}>{spinResult.number}</span>.
                    {totalWin > 0 ? ` Ваш выигрыш: ${totalWin} CPN!` : (betsAccepted ? ' Ставка проиграла.' : '')}
                </div>
            )}

            <div className="roulette-controls">
                <span>Баланс: {balance} CPN</span>
                <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={isSpinning || betsAccepted}
                />
                <button onClick={handleAcceptBets} disabled={isSpinning || betsAccepted || Object.keys(bets).length === 0}>
                    Принять ставки
                </button>
                <button onClick={handleCancelBets} disabled={isSpinning || betsAccepted || Object.keys(bets).length === 0}>
                    Отменить ставки
                </button>
            </div>

            <div className={`betting-grid ${betsAccepted || isSpinning ? 'disabled' : ''}`}>
                <div className="bet-zero" onClick={() => placeBet('number_0')}>0 {getBetDisplay('number_0')}</div>
                <div className="bet-numbers">
                    {[...Array(3)].map((_, colIndex) => (
                        <div className="number-column" key={colIndex}>
                            {[...Array(12)].map((_, rowIndex) => {
                                const number = 3 - colIndex + (rowIndex * 3);
                                return (
                                    <div key={number} className={`bet-number-cell ${numberColors[number]}`} onClick={() => placeBet(`number_${number}`)}>
                                        {number}
                                        {getBetDisplay(`number_${number}`)}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                
                <div className="bet-columns">
                    <div className="bet-option wide" onClick={() => placeBet('1-12')}>1-12 {getBetDisplay('1-12')}</div>
                    <div className="bet-option wide" onClick={() => placeBet('13-24')}>13-24 {getBetDisplay('13-24')}</div>
                    <div className="bet-option wide" onClick={() => placeBet('25-36')}>25-36 {getBetDisplay('25-36')}</div>
                </div>
                <div className="bet-dozens">
                    <div className="bet-option" onClick={() => placeBet('col1')}>1st {getBetDisplay('col1')}</div>
                    <div className="bet-option" onClick={() => placeBet('col2')}>2nd {getBetDisplay('col2')}</div>
                    <div className="bet-option" onClick={() => placeBet('col3')}>3rd {getBetDisplay('col3')}</div>
                </div>
                
                <div className="bet-outside">
                    <div className="bet-option" onClick={() => placeBet('1-18')}>1-18 {getBetDisplay('1-18')}</div>
                    <div className="bet-option" onClick={() => placeBet('even')}>Even {getBetDisplay('even')}</div>
                    <div className="bet-option red" onClick={() => placeBet('red')}>Red {getBetDisplay('red')}</div>
                    <div className="bet-option black" onClick={() => placeBet('black')}>Black {getBetDisplay('black')}</div>
                    <div className="bet-option" onClick={() => placeBet('odd')}>Odd {getBetDisplay('odd')}</div>
                    <div className="bet-option" onClick={() => placeBet('19-36')}>19-36 {getBetDisplay('19-36')}</div>
                </div>
            </div>
        </div>
    );
};

export default RouletteGame;
