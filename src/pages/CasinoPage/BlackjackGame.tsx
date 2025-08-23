import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
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
    const { user } = useAuth();
    const [balance, setBalance] = useState(user?.CPN || 1000);
    const [bet, setBet] = useState(0);
    const [betAmount, setBetAmount] = useState(10);
    
    const [deck, setDeck] = useState<Card[]>([]);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    
    const [gamePhase, setGamePhase] = useState<'betting' | 'playerTurn' | 'dealerTurn' | 'gameOver'>('betting');
    const [message, setMessage] = useState('Place your bet to start');

    const playerScore = calculateHandValue(playerHand);
    const dealerScore = calculateHandValue(dealerHand);

    // Эффект для управления ходом дилера
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
            }, 1000); // Дилер берет карту каждую секунду
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
        // Ограничение максимальной ставки
        if (betAmount > 200) {
            setMessage("Maximum bet is 200 CPN!");
            return;
        }

        setBalance(prev => prev - betAmount);
        setBet(betAmount);
        
        const newDeck = shuffleDeck(createDeck());
        const initialPlayerHand = [newDeck.pop()!, newDeck.pop()!];
        const initialDealerHand = [newDeck.pop()!, { ...newDeck.pop()!, hidden: true }];

        setDeck(newDeck);
        setPlayerHand(initialPlayerHand);
        setDealerHand(initialDealerHand);
        
        setGamePhase('playerTurn');
        setMessage('Your turn. Hit or Stand?');

        // Проверка на блекджек у игрока
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

        if (finalDealerScore > 21 || finalPlayerScore > finalDealerScore) {
            setMessage(`You win! 🎉 (${finalPlayerScore} vs ${finalDealerScore})`);
            setBalance(prev => prev + bet * 2);
        } else if (finalPlayerScore < finalDealerScore) {
            setMessage(`You lose. (${finalPlayerScore} vs ${finalDealerScore})`);
        } else {
            setMessage(`Push. (${finalPlayerScore} vs ${finalDealerScore})`);
            setBalance(prev => prev + bet);
        }
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
        // Ограничиваем значение от 1 до 400
        const clampedValue = Math.max(1, Math.min(value, 200));
        setBetAmount(clampedValue);
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
                <div className="balance-info">Balance: {balance} CPN</div>
                {gamePhase === 'betting' && (
                    <div className="betting-controls">
                        <input
                            type="number"
                            value={betAmount}
                            onChange={handleBetAmountChange}
                        />
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
