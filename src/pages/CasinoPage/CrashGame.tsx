import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStats } from './PlayerStatsContext';
import { useGameEvents } from './GameEventContext';
import './CrashGame.css';

// --- Тип для состояния ставки ---
interface BetState {
    id: number;
    betAmount: number;
    autoCashout: number;
    isAutoBet: boolean;
    isAutoCashoutEnabled: boolean;
    playerBet: number | null;
    cashedOut: boolean;
}

// --- Конфигурация игры ---
const WAITING_TIME = 10; // Время ожидания перед стартом (в секундах)
const CRUISE_START_MULTIPLIER = 1.5; // Множитель для начала анимации облаков

// --- СИМУЛЯЦИЯ СЕРВЕРА ДЛЯ СИНХРОНИЗАЦИИ ИГРЫ ---
const crashService = {
    state: {
        gameState: 'waiting' as 'waiting' | 'running' | 'crashed',
        countdown: WAITING_TIME,
        multiplier: 1.00,
        crashPoint: 1.00,
        history: [] as number[],
        activeBetsCount: 0, // --- ИЗМЕНЕНИЕ: Счетчик активных ставок
    },
    subscribers: [] as ((state: any) => void)[],
    gameTimer: null as NodeJS.Timeout | null,
    animationFrameId: null as number | null,

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

    // --- ИЗМЕНЕНИЕ: Методы для отслеживания ставок ---
    placeBet() {
        this.state.activeBetsCount++;
    },
    cancelBet() {
        this.state.activeBetsCount--;
    },

    start() {
        if (this.gameTimer) return;
        this.gameTimer = setInterval(() => {
            if (this.state.gameState === 'waiting') {
                const newCountdown = this.state.countdown - 1;
                if (newCountdown <= 0) {
                    this.startGame();
                } else {
                    this.state = { ...this.state, countdown: newCountdown };
                    this.notify();
                }
            }
        }, 1000);
    },

    // --- ИЗМЕНЕНИЕ: Логика генерации точки краша ---
    startGame() {
        const hasActiveBets = this.state.activeBetsCount > 0;
        let p = Math.random();

        // Если ставок нет, есть 30% шанс на большой коэффициент
        if (!hasActiveBets && Math.random() < 0.3) {
            const highMultiplier = Math.random() * 40 + 10; // от 10x до 50x
            p = 1 - (1 / highMultiplier);
        }
        
        const newCrashPoint = parseFloat((1 / (1 - p)).toFixed(2));
        
        this.state = { 
            ...this.state, 
            gameState: 'running', 
            multiplier: 1.00,
            crashPoint: Math.max(1.01, newCrashPoint)
        };
        this.notify();

        const startTime = Date.now();
        const animate = () => {
            const elapsedTime = (Date.now() - startTime) / 1000;
            const newMultiplier = parseFloat((Math.pow(1.05, elapsedTime)).toFixed(2));

            if (newMultiplier >= this.state.crashPoint) {
                this.endGame(this.state.crashPoint);
            } else {
                this.state = { ...this.state, multiplier: newMultiplier };
                this.notify();
                this.animationFrameId = requestAnimationFrame(animate);
            }
        };
        this.animationFrameId = requestAnimationFrame(animate);
    },

    endGame(point: number) {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        const newHistory = [point, ...this.state.history.slice(0, 9)];
        this.state = { ...this.state, gameState: 'crashed', history: newHistory };
        this.notify();
        setTimeout(() => this.resetGame(), 3000);
    },

    // --- ИЗМЕНЕНИЕ: Сброс счетчика ставок ---
    resetGame() {
        this.state = { ...this.state, gameState: 'waiting', countdown: WAITING_TIME, multiplier: 1.00, activeBetsCount: 0 };
        this.notify();
    }
};
crashService.start();
// ---------------------------------------------

const CrashGame: React.FC = () => {
    const { balance, updateBalance, addXp } = usePlayerStats();
    const { triggerGameEvent } = useGameEvents();

    const [bets, setBets] = useState<BetState[]>([
        { id: 1, betAmount: 100, autoCashout: 2.0, isAutoBet: false, isAutoCashoutEnabled: false, playerBet: null, cashedOut: false },
        { id: 2, betAmount: 250, autoCashout: 3.0, isAutoBet: false, isAutoCashoutEnabled: true, playerBet: null, cashedOut: false },
        { id: 3, betAmount: 500, autoCashout: 2.0, isAutoBet: false, isAutoCashoutEnabled: false, playerBet: null, cashedOut: false },
        { id: 4, betAmount: 500, autoCashout: 5.0, isAutoBet: false, isAutoCashoutEnabled: true, playerBet: null, cashedOut: false },
    ]);

    const [gameState, setGameState] = useState(crashService.state);
    const { gameState: currentPhase, countdown, multiplier, crashPoint, history } = gameState;
    
    const [isCruising, setIsCruising] = useState(false);
    const [crashPosition, setCrashPosition] = useState({ left: '0%', bottom: '0%' });

    useEffect(() => {
        const handleStateUpdate = (newState: any) => {
            setGameState(newState);
        };
        crashService.subscribe(handleStateUpdate);
        return () => crashService.unsubscribe(handleStateUpdate);
    }, []);

    useEffect(() => {
        if (currentPhase === 'running') {
            if (multiplier >= CRUISE_START_MULTIPLIER && !isCruising) {
                setIsCruising(true);
            }

            bets.forEach(bet => {
                if (bet.playerBet && !bet.cashedOut && bet.isAutoCashoutEnabled && multiplier >= bet.autoCashout) {
                    handleCashout(bet.id, bet.autoCashout);
                }
            });
        }
    }, [multiplier]);

    useEffect(() => {
        if (currentPhase === 'crashed') {
            const finalPosition = (crashPoint / 10) * 100;
            const finalCruisePosition = (CRUISE_START_MULTIPLIER / 10) * 100;
            const isCruisingAtCrash = crashPoint >= CRUISE_START_MULTIPLIER;

            setCrashPosition({
                left: `${Math.min(95, isCruisingAtCrash ? finalCruisePosition : finalPosition)}%`,
                bottom: `${Math.min(90, isCruisingAtCrash ? finalCruisePosition : finalPosition)}%`
            });
            setIsCruising(false);
            
            bets.forEach(bet => {
                if (bet.playerBet && !bet.cashedOut) {
                    triggerGameEvent('loss');
                }
            });
        }

        if (currentPhase === 'waiting') {
            setIsCruising(false);
            
            const updatedBets = bets.map(bet => {
                let newPlayerBet = null;
                if (bet.isAutoBet) {
                    newPlayerBet = handlePlaceBet(bet.id, true);
                }
                return { ...bet, playerBet: newPlayerBet, cashedOut: false };
            });
            setBets(updatedBets);
        }
    }, [currentPhase]);

    const updateBetState = (id: number, field: keyof BetState, value: any) => {
        setBets(bets.map(bet => bet.id === id ? { ...bet, [field]: value } : bet));
    };

    const handleBetAmountChange = (id: number, value: string) => {
        let numericValue = parseInt(value, 10);
        if (numericValue > 1 && numericValue % 50 === 1) {
            numericValue -= 1;
        }
        const clampedValue = Math.max(1, Math.min(numericValue, 500));
        updateBetState(id, 'betAmount', isNaN(clampedValue) ? 1 : clampedValue);
    };

    const handleAutoCashoutChange = (id: number, value: string) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            updateBetState(id, 'autoCashout', 2.0);
            return;
        }
        updateBetState(id, 'autoCashout', numericValue);
    };
    
    const handleAutoCashoutBlur = (id: number, value: string) => {
        const numericValue = parseFloat(value);
        const clampedValue = Math.max(2.0, numericValue);
        updateBetState(id, 'autoCashout', isNaN(clampedValue) ? 2.0 : clampedValue);
    };

    const handlePlaceBet = (id: number, isAuto: boolean = false) => {
        const bet = bets.find(b => b.id === id);
        if (!bet) return null;

        if (bet.betAmount < 1 || bet.betAmount > 500) {
            if (!isAuto) alert("Сумма ставки должна быть от 1 до 500 CR.");
            return null;
        }
        if (bet.isAutoCashoutEnabled && bet.autoCashout < 2.0) {
            if (!isAuto) alert("Auto Cashout не может быть ниже 2.0x.");
            updateBetState(id, 'autoCashout', 2.0);
            return null;
        }
        if (bet.betAmount > balance) {
            if (!isAuto) {
                alert("Недостаточно средств!");
                updateBetState(id, 'isAutoBet', false);
            }
            return null;
        }
        updateBalance(balance - bet.betAmount);
        updateBetState(id, 'playerBet', bet.betAmount);
        crashService.placeBet(); // --- ИЗМЕНЕНИЕ: Сообщаем "серверу" о ставке
        return bet.betAmount;
    };

    const handleCancelBet = (id: number) => {
        const bet = bets.find(b => b.id === id);
        if (!bet || !bet.playerBet) return;
        updateBalance(balance + bet.playerBet);
        updateBetState(id, 'playerBet', null);
        crashService.cancelBet(); // --- ИЗМЕНЕНИЕ: Сообщаем "серверу" об отмене
    };

    const handleCashout = (id: number, cashoutMultiplier: number) => {
        const bet = bets.find(b => b.id === id);
        if (!bet || !bet.playerBet || bet.cashedOut) return;
        const winAmount = bet.playerBet * cashoutMultiplier;
        updateBalance(balance + winAmount);
        addXp(winAmount - bet.playerBet);
        triggerGameEvent('win');
        updateBetState(id, 'cashedOut', true);
    };

    const getMultiplierClassName = () => {
        if (multiplier >= 10) return 'gold-glow';
        if (multiplier >= 5) return 'pink-glow';
        if (multiplier >= 2) return 'green-glow';
        return '';
    };

    const renderGameState = () => {
        if (currentPhase === 'crashed') {
            return <div className="crash-message">CRASHED @ {crashPoint.toFixed(2)}x</div>;
        }
        return <div className={`multiplier ${getMultiplierClassName()}`}>{multiplier.toFixed(2)}x</div>;
    };

    const getRocketPosition = () => {
        if (isCruising) {
            const cruisePosition = (CRUISE_START_MULTIPLIER / 10) * 100;
            return { left: `${Math.min(95, cruisePosition)}%`, bottom: `${Math.min(90, cruisePosition)}%` };
        }
        const position = (multiplier / 10) * 100;
        return { left: `${Math.min(95, position)}%`, bottom: `${Math.min(90, position)}%` };
    };

    const activeBets = bets.filter(bet => bet.playerBet !== null);

    return (
        <div className="crash-game">
            <div className="game-area">
                <div className="history-bar">
                    {history.map((val, i) => (
                        <span key={i} className={val < 2 ? 'history-bad' : 'history-good'}>{val.toFixed(2)}x</span>
                    ))}
                </div>
                <div className={`graph-container ${currentPhase === 'running' ? 'game-running' : ''}`}>
                    <div className="stars-wrapper">
                        <div className="stars"></div>
                        <div className="stars2"></div>
                        <div className="stars3"></div>
                    </div>
                    {renderGameState()}
                    {isCruising && (
                        <div className="clouds-container">
                            <div className="cloud cloud1">☁️</div>
                            <div className="cloud cloud2">☁️</div>
                            <div className="cloud cloud3">☁️</div>
                        </div>
                    )}
                    {currentPhase === 'crashed' && (<div className="crash-building" style={crashPosition}>🕌</div>)}
                    {currentPhase === 'running' && (
                        <div className={`rocket flying ${isCruising ? 'cruising' : ''}`} style={getRocketPosition()}>🚀</div>
                    )}
                    {currentPhase === 'running' && activeBets.map((bet, index) => {
                        if (bet.cashedOut) {
                            return (
                                <div key={bet.id} className="rocket cashed-out-rocket" style={{ ...getRocketPosition(), transform: `translate(${(index + 1) * -35}px, ${(index + 1) * 20}px)` }}>💲</div>
                            );
                        }
                        return (
                            <div key={bet.id} className={`rocket ghost-rocket flying ${isCruising ? 'cruising' : ''}`} style={{ ...getRocketPosition(), transform: `translate(${(index + 1) * -35}px, ${(index + 1) * 20}px)` }}>🚀</div>
                        );
                    })}
                    {currentPhase === 'crashed' && (<div className="rocket crashed" style={crashPosition}>💥</div>)}
                </div>
                {currentPhase === 'waiting' && <div className="countdown">Starting in {countdown}s...</div>}
            </div>
            
            <div className="balance-display">Баланс: {balance.toFixed(2)} CR</div>

            <div className="controls-panel-grid">
                {bets.map(bet => (
                    <div className="controls-panel" key={bet.id}>
                        <div className="bet-controls">
                            <div className="input-group">
                                <label>Bet Amount</label>
                                <input type="number" value={bet.betAmount} onChange={e => handleBetAmountChange(bet.id, e.target.value)} disabled={!!bet.playerBet} min="1" max="500" />
                                <input type="range" min="1" max="501" step="50" value={bet.betAmount} onChange={e => handleBetAmountChange(bet.id, e.target.value)} className="bet-slider" disabled={!!bet.playerBet} />
                            </div>
                            <div className="input-group auto-cashout-group">
                                <div className="label-with-presets">
                                    <label>Auto Cashout</label>
                                    <div className="preset-buttons">
                                        <button className="preset-btn" onClick={() => updateBetState(bet.id, 'autoCashout', 2.0)} disabled={!bet.isAutoCashoutEnabled || !!bet.playerBet}>2x</button>
                                        <button className="preset-btn" onClick={() => updateBetState(bet.id, 'autoCashout', 3.0)} disabled={!bet.isAutoCashoutEnabled || !!bet.playerBet}>3x</button>
                                        <button className="preset-btn" onClick={() => updateBetState(bet.id, 'autoCashout', 5.0)} disabled={!bet.isAutoCashoutEnabled || !!bet.playerBet}>5x</button>
                                    </div>
                                </div>
                                <div className="input-with-checkbox">
                                    <input type="number" value={bet.autoCashout} onChange={e => handleAutoCashoutChange(bet.id, e.target.value)} onBlur={e => handleAutoCashoutBlur(bet.id, e.target.value)} disabled={!bet.isAutoCashoutEnabled || !!bet.playerBet} min="2.0" step="0.1" />
                                    <input type="checkbox" checked={bet.isAutoCashoutEnabled} onChange={e => updateBetState(bet.id, 'isAutoCashoutEnabled', e.target.checked)} disabled={!!bet.playerBet} />
                                </div>
                            </div>
                        </div>
                        {currentPhase === 'waiting' && !bet.playerBet && (<button className="bet-btn" onClick={() => handlePlaceBet(bet.id)}>Place Bet</button>)}
                        {currentPhase === 'waiting' && bet.playerBet && (<button className="cancel-btn" onClick={() => handleCancelBet(bet.id)}>Cancel Bet</button>)}
                        {currentPhase === 'running' && bet.playerBet && !bet.cashedOut && (
                            <button className="cashout-btn" onClick={() => handleCashout(bet.id, multiplier)}>
                                Cash Out @ {(bet.betAmount * multiplier).toFixed(2)} CR
                            </button>
                        )}
                        {currentPhase === 'running' && (!bet.playerBet || bet.cashedOut) && (<button className="bet-btn" disabled>{bet.cashedOut ? `Cashed Out!` : 'Running...'}</button>)}
                        
                        {currentPhase === 'crashed' && (
                            bet.cashedOut ? (
                                <button className="bet-btn" disabled>
                                    Cashed Out!
                                </button>
                            ) : bet.playerBet ? (
                                <button className="bet-btn" disabled style={{ backgroundColor: '#d9534f', color: 'white' }}>
                                    Crashed
                                </button>
                            ) : (
                                <button className="bet-btn" disabled>
                                    Waiting...
                                </button>
                            )
                        )}

                        <button className={`autobet-btn ${bet.isAutoBet ? 'active' : ''}`} onClick={() => updateBetState(bet.id, 'isAutoBet', !bet.isAutoBet)}>Auto Bet</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CrashGame;
