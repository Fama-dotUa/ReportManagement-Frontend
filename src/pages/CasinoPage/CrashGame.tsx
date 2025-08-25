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

    startGame() {
        const p = Math.random();
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

    resetGame() {
        this.state = { ...this.state, gameState: 'waiting', countdown: WAITING_TIME, multiplier: 1.00 };
        this.notify();
    }
};
crashService.start();
// ---------------------------------------------

const CrashGame: React.FC = () => {
    const { balance, updateBalance, addXp } = usePlayerStats();
    const { triggerGameEvent } = useGameEvents();

    const [bets, setBets] = useState<BetState[]>([
        { id: 1, betAmount: 100, autoCashout: 2.0, isAutoBet: false, isAutoCashoutEnabled: true, playerBet: null, cashedOut: false },
        { id: 2, betAmount: 250, autoCashout: 3.0, isAutoBet: false, isAutoCashoutEnabled: true, playerBet: null, cashedOut: false },
        { id: 3, betAmount: 500, autoCashout: 1.5, isAutoBet: false, isAutoCashoutEnabled: true, playerBet: null, cashedOut: false },
        { id: 4, betAmount: 1000, autoCashout: 5.0, isAutoBet: false, isAutoCashoutEnabled: true, playerBet: null, cashedOut: false },
    ]);

    const [gameState, setGameState] = useState(crashService.state);
    const { gameState: currentPhase, countdown, multiplier, crashPoint, history } = gameState;
    
    // --- НОВОЕ СОСТОЯНИЕ: для управления анимацией облаков ---
    const [isCruising, setIsCruising] = useState(false);


    useEffect(() => {
        const handleStateUpdate = (newState: any) => {
            setGameState(newState);
        };
        crashService.subscribe(handleStateUpdate);
        return () => crashService.unsubscribe(handleStateUpdate);
    }, []);

    useEffect(() => {
        if (currentPhase === 'running') {
            // Активируем анимацию облаков при достижении множителя
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
        if (currentPhase === 'waiting' || currentPhase === 'crashed') {
            // Сбрасываем анимацию облаков в конце раунда
            setIsCruising(false);
            
            const updatedBets = bets.map(bet => {
                if (bet.playerBet && !bet.cashedOut) {
                    triggerGameEvent('loss');
                }
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

    const handlePlaceBet = (id: number, isAuto: boolean = false) => {
        const bet = bets.find(b => b.id === id);
        if (!bet || bet.betAmount > balance) {
            if (!isAuto) alert("Недостаточно средств!");
            updateBetState(id, 'isAutoBet', false);
            return null;
        }
        updateBalance(balance - bet.betAmount);
        updateBetState(id, 'playerBet', bet.betAmount);
        return bet.betAmount;
    };

    const handleCancelBet = (id: number) => {
        const bet = bets.find(b => b.id === id);
        if (!bet || !bet.playerBet) return;

        updateBalance(balance + bet.playerBet);
        updateBetState(id, 'playerBet', null);
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

    const renderGameState = () => {
        if (currentPhase === 'crashed') {
            return <div className="crash-message">CRASHED @ {crashPoint.toFixed(2)}x</div>;
        }
        return <div className="multiplier">{multiplier.toFixed(2)}x</div>;
    };

    // --- Функция для вычисления позиции самолетика ---
    const getRocketPosition = () => {
        if (isCruising) {
            // Фиксируем позицию, когда облака активны
            const cruisePosition = (CRUISE_START_MULTIPLIER / 10) * 100;
            return {
                left: `${Math.min(95, cruisePosition)}%`,
                bottom: `${Math.min(90, cruisePosition)}%`
            };
        }
        // Обычное движение
        const position = (multiplier / 10) * 100;
        return {
            left: `${Math.min(95, position)}%`,
            bottom: `${Math.min(90, position)}%`
        };
    };

    return (
        <div className="crash-game">
            <div className="game-area">
                <div className="history-bar">
                    {history.map((val, i) => (
                        <span key={i} className={val < 2 ? 'history-bad' : 'history-good'}>
                            {val.toFixed(2)}x
                        </span>
                    ))}
                </div>
                <div className="graph-container">
                    {renderGameState()}
                    
                    {/* --- НОВЫЙ БЛОК: Контейнер для облаков --- */}
                    {isCruising && (
                        <div className="clouds-container">
                            <div className="cloud cloud1">☁️</div>
                            <div className="cloud cloud2">☁️</div>
                            <div className="cloud cloud3">☁️</div>
                        </div>
                    )}

                    <div 
                        className={`rocket ${currentPhase === 'running' ? 'flying' : ''} ${currentPhase === 'crashed' ? 'crashed' : ''} ${isCruising ? 'cruising' : ''}`}
                        style={getRocketPosition()}
                    >
                        ✈️
                    </div>
                </div>
                 {currentPhase === 'waiting' && <div className="countdown">Starting in {countdown}s...</div>}
            </div>
            <div className="controls-panel-grid">
                {bets.map(bet => (
                    <div className="controls-panel" key={bet.id}>
                        <div className="bet-controls">
                            <div className="input-group">
                                <label>Bet Amount</label>
                                <input 
                                    type="number" 
                                    value={bet.betAmount} 
                                    onChange={e => updateBetState(bet.id, 'betAmount', Number(e.target.value))}
                                    disabled={!!bet.playerBet}
                                />
                            </div>
                            <div className="input-group">
                                <label>Auto Cashout</label>
                                <input 
                                    type="number" 
                                    value={bet.autoCashout}
                                    onChange={e => updateBetState(bet.id, 'autoCashout', Number(e.target.value))}
                                    disabled={!bet.isAutoCashoutEnabled || !!bet.playerBet}
                                />
                                <input 
                                    type="checkbox"
                                    checked={bet.isAutoCashoutEnabled}
                                    onChange={e => updateBetState(bet.id, 'isAutoCashoutEnabled', e.target.checked)}
                                    disabled={!!bet.playerBet}
                                />
                            </div>
                        </div>
                        {currentPhase === 'waiting' && !bet.playerBet && (
                            <button className="bet-btn" onClick={() => handlePlaceBet(bet.id)}>Place Bet</button>
                        )}
                        {currentPhase === 'waiting' && bet.playerBet && (
                            <button className="cancel-btn" onClick={() => handleCancelBet(bet.id)}>Cancel Bet</button>
                        )}
                        {currentPhase === 'running' && bet.playerBet && !bet.cashedOut && (
                            <button className="cashout-btn" onClick={() => handleCashout(bet.id, multiplier)}>
                                Cash Out @ {multiplier.toFixed(2)}x
                            </button>
                        )}
                         {currentPhase === 'running' && (!bet.playerBet || bet.cashedOut) && (
                            <button className="bet-btn" disabled>
                                {bet.cashedOut ? `Cashed Out!` : 'Running...'}
                            </button>
                        )}
                         {currentPhase === 'crashed' && (
                            <button className="bet-btn" disabled>Crashed!</button>
                        )}
                        <button 
                            className={`autobet-btn ${bet.isAutoBet ? 'active' : ''}`}
                            onClick={() => updateBetState(bet.id, 'isAutoBet', !bet.isAutoBet)}
                        >
                            Auto Bet
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CrashGame;
