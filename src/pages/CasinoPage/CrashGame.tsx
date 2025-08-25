import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStats } from './PlayerStatsContext';
import { useGameEvents } from './GameEventContext';
import './CrashGame.css';

// --- Конфигурация игры ---
const WAITING_TIME = 10; // Время ожидания перед стартом (в секундах)

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

    // Локальное состояние для ставок и UI игрока
    const [betAmount, setBetAmount] = useState(100);
    const [autoCashout, setAutoCashout] = useState(2.0);
    const [playerBet, setPlayerBet] = useState<number | null>(null);
    const [cashedOut, setCashedOut] = useState(false);

    // Состояние, синхронизированное с сервисом
    const [gameState, setGameState] = useState(crashService.state);
    const { gameState: currentPhase, countdown, multiplier, crashPoint, history } = gameState;

    // Подписка на обновления от сервиса
    useEffect(() => {
        const handleStateUpdate = (newState: any) => {
            setGameState(newState);
        };
        crashService.subscribe(handleStateUpdate);
        return () => crashService.unsubscribe(handleStateUpdate);
    }, []);

    // Проверка на авто-кэшаут при изменении множителя
    useEffect(() => {
        if (currentPhase === 'running' && playerBet && !cashedOut && autoCashout > 1 && multiplier >= autoCashout) {
            handleCashout(autoCashout);
        }
    }, [multiplier]);

    // Сброс ставки игрока после окончания раунда
    useEffect(() => {
        if (currentPhase === 'waiting' && playerBet) {
            if (!cashedOut) {
                triggerGameEvent('loss');
            }
            setPlayerBet(null);
            setCashedOut(false);
        }
    }, [currentPhase]);


    const handlePlaceBet = () => {
        if (betAmount > balance) {
            alert("Недостаточно средств!");
            return;
        }
        updateBalance(balance - betAmount);
        setPlayerBet(betAmount);
    };

    const handleCashout = (cashoutMultiplier: number) => {
        if (!playerBet || cashedOut) return;
        
        const winAmount = playerBet * cashoutMultiplier;
        updateBalance(balance + winAmount);
        addXp(winAmount - playerBet);
        triggerGameEvent('win');
        setCashedOut(true);
    };

    const renderGameState = () => {
        if (currentPhase === 'crashed') {
            return <div className="crash-message">CRASHED @ {crashPoint.toFixed(2)}x</div>;
        }
        return <div className="multiplier">{multiplier.toFixed(2)}x</div>;
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
                    <div 
                        className={`rocket ${currentPhase === 'running' ? 'flying' : ''} ${currentPhase === 'crashed' ? 'crashed' : ''}`}
                        style={{ 
                            left: `${Math.min(95, (multiplier / 10) * 100)}%`, 
                            bottom: `${Math.min(90, (multiplier / 10) * 100)}%` 
                        }}
                    >
                        ✈️
                    </div>
                </div>
                 {currentPhase === 'waiting' && <div className="countdown">Starting in {countdown}s...</div>}
            </div>
            <div className="controls-panel">
                <div className="bet-controls">
                    <div className="input-group">
                        <label>Bet Amount</label>
                        <input 
                            type="number" 
                            value={betAmount} 
                            onChange={e => setBetAmount(Number(e.target.value))}
                            disabled={!!playerBet}
                        />
                    </div>
                    <div className="input-group">
                        <label>Auto Cashout</label>
                        <input 
                            type="number" 
                            value={autoCashout}
                            onChange={e => setAutoCashout(Number(e.target.value))}
                            disabled={!!playerBet}
                        />
                    </div>
                </div>
                {currentPhase === 'waiting' && !playerBet && (
                    <button className="bet-btn" onClick={handlePlaceBet}>Place Bet</button>
                )}
                {currentPhase === 'waiting' && playerBet && (
                    <button className="bet-btn" disabled>Waiting for next round...</button>
                )}
                {currentPhase === 'running' && playerBet && !cashedOut && (
                    <button className="cashout-btn" onClick={() => handleCashout(multiplier)}>
                        Cash Out @ {multiplier.toFixed(2)}x
                    </button>
                )}
                 {currentPhase === 'running' && (!playerBet || cashedOut) && (
                    <button className="bet-btn" disabled>
                        {cashedOut ? `Cashed Out!` : 'Running...'}
                    </button>
                )}
                 {currentPhase === 'crashed' && (
                    <button className="bet-btn" disabled>
                        Crashed!
                    </button>
                )}
            </div>
        </div>
    );
};

export default CrashGame;
