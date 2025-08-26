import React, { useState, useEffect } from 'react';
import { usePlayerStats } from './PlayerStatsContext'; 
import { useGameEvents } from './GameEventContext'; // <-- 1. ИМПОРТ
import './BlackjackGame.css';

// Определяем типы для карт и рук
type Suit = '♥' | '♦' | '♣' | '♠';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
    suit: Suit;
    rank: Rank;
    value: number;
    hidden?: boolean;
}

// --- Логика игры ---
const suits: Suit[] = ['♥', '♦', '♣', '♠'];
const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const createDeck = (): Card[] => {
    const deck: Card[] = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            let value = parseInt(rank);
            if (['J', 'Q', 'K'].includes(rank)) value = 10;
            if (rank === 'A') value = 11;
            deck.push({ suit, rank, value });
        }
    }
    return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

const calculateHandValue = (hand: Card[]): number => {
    let value = hand.reduce((sum, card) => sum + (card.hidden ? 0 : card.value), 0);
    let aceCount = hand.filter(card => !card.hidden && card.rank === 'A').length;

    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }
    return value;
};


const BlackjackGame: React.FC = () => {
    const { balance, updateBalance, addXp } = usePlayerStats(); 
    const { triggerGameEvent } = useGameEvents(); // <-- 2. ПОЛУЧЕНИЕ ФУНКЦИИ
    
    const [bet, setBet] = useState(25);
    const [betAmount, setBetAmount] = useState(25);
    
    const [deck, setDeck] = useState<Card[]>([]);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    
    const [gamePhase, setGamePhase] = useState<'betting' | 'playerTurn' | 'dealerTurn' | 'gameOver'>('betting');
    const [message, setMessage] = useState('Place your bet to start');

    const playerScore = calculateHandValue(playerHand);
    const dealerScore = calculateHandValue(dealerHand);

    useEffect(() => {
        if (gamePhase === 'dealerTurn') {
            const dealerInterval = setInterval(() => {
                const currentDealerScore = calculateHandValue(dealerHand);
                if (currentDealerScore < 17) {
                    drawCard('dealer');
                } else {
                    clearInterval(dealerInterval);
                    determineWinner();
                }
            }, 1000);
            return () => clearInterval(dealerInterval);
        }
    }, [gamePhase, dealerHand]);
    
    const placeBetAndDeal = () => {
        if (betAmount > balance) {
            setMessage("Insufficient balance!");
            return;
        }
        if (betAmount <= 0) {
            setMessage("Bet must be positive!");
            return;
        }
        if (betAmount > 251) {
            setMessage("Maximum bet is 250 CPN!");
            return;
        }

        updateBalance(balance - betAmount);
        setBet(betAmount);
        
        const newDeck = shuffleDeck(createDeck());
        const initialPlayerHand = [newDeck.pop()!, newDeck.pop()!];
        const initialDealerHand = [newDeck.pop()!, { ...newDeck.pop()!, hidden: true }];

        setDeck(newDeck);
        setPlayerHand(initialPlayerHand);
        setDealerHand(initialDealerHand);
        
        setGamePhase('playerTurn');
        setMessage('Your turn. Hit or Stand?');

        if (calculateHandValue(initialPlayerHand) === 21) {
            stand();
        }
    };

    const drawCard = (target: 'player' | 'dealer') => {
        if (deck.length === 0) return;
        const newCard = deck.pop()!;
        setDeck([...deck]);

        if (target === 'player') {
            const newHand = [...playerHand, newCard];
            setPlayerHand(newHand);
            if (calculateHandValue(newHand) > 21) {
                setMessage('Bust! You lose.');
                triggerGameEvent('loss');
                setGamePhase('gameOver');
            }
        } else {
            setDealerHand(prev => [...prev, newCard]);
        }
    };

    const stand = () => {
        const revealedDealerHand = dealerHand.map(card => ({ ...card, hidden: false }));
        setDealerHand(revealedDealerHand);
        setGamePhase('dealerTurn');
        setMessage("Dealer's turn...");
    };

    const determineWinner = () => {
        const finalPlayerScore = calculateHandValue(playerHand);
        const finalDealerScore = calculateHandValue(dealerHand.map(c => ({...c, hidden: false})));
        let newBalance = balance;

        if (finalDealerScore > 21 || (finalPlayerScore <= 21 && finalPlayerScore > finalDealerScore)) {
            const totalReturn = bet * 2;
            const netWin = bet;
            setMessage(`You win! 🎉 (${finalPlayerScore} vs ${finalDealerScore})`);
            triggerGameEvent('win');
            newBalance += totalReturn;
            addXp(netWin); 
        } else if (finalPlayerScore < finalDealerScore) {
            setMessage(`You lose. (${finalPlayerScore} vs ${finalDealerScore})`);
            triggerGameEvent('loss');
        } else {
            setMessage(`Push. (${finalPlayerScore} vs ${finalDealerScore})`);
            newBalance += bet;
        }
        updateBalance(newBalance);
        setGamePhase('gameOver');
    };

    const newGame = () => {
        setGamePhase('betting');
        setMessage('Place your bet to start');
        setPlayerHand([]);
        setDealerHand([]);
        setBet(0);
    };

    const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 1;
        const clampedValue = Math.max(1, Math.min(value, 250));
        setBetAmount(clampedValue);
    };

    // --- ИЗМЕНЕНИЕ: Функция для добавления к ставке ---
    const addToBet = (amount: number) => {
        setBetAmount(prev => {
            const newValue = prev + amount;
            return Math.min(newValue, 250); // Ограничение максимальной ставки
        });
    };

    const renderCard = (card: Card, index: number) => (
        <div key={index} className={`card ${card.hidden ? 'hidden' : ''} ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}`}>
            {!card.hidden && <span>{card.rank}{card.suit}</span>}
        </div>
    );

    return (
        <div className="blackjack-game">
            <div className="game-table">
                <div className="hand-container">
                    <h3>Dealer's Hand ({gamePhase !== 'playerTurn' ? dealerScore : '?'})</h3>
                    <div className="hand">{dealerHand.map(renderCard)}</div>
                </div>
                
                <div className="game-message">{message}</div>

                <div className="hand-container">
                    <h3>Your Hand ({playerScore})</h3>
                    <div className="hand">{playerHand.map(renderCard)}</div>
                </div>
            </div>

            <div className="controls">
                <div className="balance-info">Balance: {balance.toFixed(2)} CPN</div>
                {gamePhase === 'betting' && (
                    <div className="betting-controls">
                        <div className="bet-input-group">
                            <input
                                type="number"
                                value={betAmount}
                                onChange={handleBetAmountChange}
                                min="25"
                                max="250"
                            />
                            {/* --- ИЗМЕНЕНИЕ: Добавлена структура кнопок и ползунка из рулетки --- */}
                            <div className="slider-and-buttons-wrapper">
                                <div className="bet-increments">
                                    <button className="bet-increment-btn" onClick={() => addToBet(25)}>+25</button>
                                    <button className="bet-increment-btn" onClick={() => addToBet(50)}>+50</button>
                                    <button className="bet-increment-btn" onClick={() => addToBet(100)}>+100</button>
                                </div>
                                <input
                                    type="range"
                                    min="25"
                                    max="250"
                                    step="25"
                                    value={betAmount}
                                    onChange={handleBetAmountChange}
                                    className="bet-slider"
                                />
                            </div>
                        </div>
                        <button onClick={placeBetAndDeal}>Place Bet</button>
                    </div>
                )}
                {gamePhase === 'playerTurn' && (
                    <div className="action-controls">
                        <button onClick={() => drawCard('player')}>Hit</button>
                        <button onClick={stand}>Stand</button>
                    </div>
                )}
                {gamePhase === 'gameOver' && (
                    <div className="action-controls">
                        <button onClick={newGame}>New Game</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlackjackGame;
