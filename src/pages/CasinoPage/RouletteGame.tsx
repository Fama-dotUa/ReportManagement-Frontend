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
// Этот объект имитирует единое состояние игры для всех пользователей.
const rouletteService = {
    state: {
        countdown: 20,
        isSpinning: false,
        winningNumber: null as number | null,
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
        this.state = {
            ...this.state,
            isSpinning: true,
            winningNumber: Math.floor(Math.random() * 37)
        };
        this.notify();

        setTimeout(() => {
            this.state = { ...this.state, isSpinning: false, countdown: 20 };
            this.notify();
        }, 7000); // 7 секунд анимации
    }
};

// Запускаем "сервер" один раз при загрузке кода
rouletteService.start();
// ---------------------------------------------


// Создаем массив номеров для ленты рулетки
const rouletteNumbers = Array.from({ length: 37 }, (_, i) => i);
const wheelNumbers = [...rouletteNumbers, ...rouletteNumbers, ...rouletteNumbers, ...rouletteNumbers]; // Добавим еще один блок для плавного перехода

const RouletteGame: React.FC = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(user?.CPN || 1000);
    const [betAmount, setBetAmount] = useState(10);
    const [bets, setBets] = useState<{ [key: string]: number }>({});
    const [spinResult, setSpinResult] = useState<{ number: number; color: string } | null>(null);
    const [totalWin, setTotalWin] = useState(0);
    const [betsAccepted, setBetsAccepted] = useState(false);
    
    // Состояние игры, синхронизированное с "сервисом"
    const [gameState, setGameState] = useState(rouletteService.state);
    const [lastWinningNumber, setLastWinningNumber] = useState<number | null>(0); // Хранит позицию для остановки
    const { isSpinning, countdown, winningNumber } = gameState;

    useEffect(() => {
        const handleStateUpdate = (newState: any) => {
            if (gameState.isSpinning && !newState.isSpinning) {
                calculateWinnings(newState.winningNumber);
                setSpinResult({ number: newState.winningNumber, color: numberColors[newState.winningNumber] });
                setBetsAccepted(false); 
                setLastWinningNumber(newState.winningNumber); // Сохраняем последнее число для плавной остановки
            }
            setGameState(newState);
        };

        rouletteService.subscribe(handleStateUpdate);
        return () => rouletteService.unsubscribe(handleStateUpdate);
    }, [gameState.isSpinning, bets, betsAccepted]);

    const placeBet = (betType: string) => {
        if (betsAccepted) {
            alert("Ставки уже приняты, дождитесь следующего раунда.");
            return;
        }
        if (betAmount > balance) {
            alert("Недостаточно средств для ставки!");
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
            let conditionMet = false;
            if (betType.startsWith('number_')) {
                if (parseInt(betType.split('_')[1]) === winner) {
                    winnings += betValue * 36;
                }
            } else {
                switch (betType) {
                    case 'red': if (winnerColor === 'red') conditionMet = true; break;
                    case 'black': if (winnerColor === 'black') conditionMet = true; break;
                    case 'even': if (winner !== 0 && winner % 2 === 0) conditionMet = true; break;
                    case 'odd': if (winner !== 0 && winner % 2 !== 0) conditionMet = true; break;
                    case '1-18': if (winner >= 1 && winner <= 18) conditionMet = true; break;
                    case '19-36': if (winner >= 19 && winner <= 36) conditionMet = true; break;
                    case '1-12': if (winner >= 1 && winner <= 12) conditionMet = true; break;
                    case '13-24': if (winner >= 13 && winner <= 24) conditionMet = true; break;
                    case '25-36': if (winner >= 25 && winner <= 36) conditionMet = true; break;
                    case 'col1': if (winner > 0 && winner % 3 === 1) conditionMet = true; break;
                    case 'col2': if (winner > 0 && winner % 3 === 2) conditionMet = true; break;
                    case 'col3': if (winner > 0 && winner % 3 === 0) conditionMet = true; break;
                }

                if (conditionMet) {
                    const multiplier = ['red', 'black', 'even', 'odd', '1-18', '19-36'].includes(betType) ? 2 : 3;
                    winnings += betValue * multiplier;
                }
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

    // Функция для вычисления смещения translateX
    const getTransformValue = () => {
        // Смещение для центрирования блока (половина ширины контейнера - половина ширины блока)
        // Предполагаем, что ширина контейнера около 900px, поэтому центр 450px.
        // 450 - 50 (половина ширины блока 100px) = 400
        const centeringOffset = 500;

        // Цель для анимации находится в третьем блоке чисел
        const spinTarget = (37 * 2) + (winningNumber ?? 0);
        const spinTranslateX = -(spinTarget * 100 - centeringOffset);

        // Позиция покоя находится во втором блоке чисел
        const restingTarget = (37 * 1) + (lastWinningNumber ?? 0);
        const restingTranslateX = -(restingTarget * 100 - centeringOffset);

        return isSpinning ? spinTranslateX : restingTranslateX;
    };

    return (
        <div className="roulette-game">
            <div className="roulette-wheel-container">
                <div className="roulette-pointer"></div>
                <div className={`roulette-wheel ${isSpinning ? 'spinning' : ''}`}
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
                    <div className="bet-option" onClick={() => placeBet('col1')}>2 to 1 {getBetDisplay('col1')}</div>
                    <div className="bet-option" onClick={() => placeBet('col2')}>2 to 1 {getBetDisplay('col2')}</div>
                    <div className="bet-option" onClick={() => placeBet('col3')}>2 to 1 {getBetDisplay('col3')}</div>
                </div>
                <div className="bet-dozens">
                    <div className="bet-option wide" onClick={() => placeBet('1-12')}>1st 12 {getBetDisplay('1-12')}</div>
                    <div className="bet-option wide" onClick={() => placeBet('13-24')}>2nd 12 {getBetDisplay('13-24')}</div>
                    <div className="bet-option wide" onClick={() => placeBet('25-36')}>3rd 12 {getBetDisplay('25-36')}</div>
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
