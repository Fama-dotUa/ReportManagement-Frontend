import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CasinoPage.css';

// Импортируем компоненты и новые провайдеры/компоненты
import RouletteGame from './RouletteGame';
import BlackjackGame from './BlackjackGame';
import SlotsGame from './SlotsGame';
import CrashGame from './CrashGame'; // <-- Импорт новой игры
import CouponConverter from './CouponConverter';
import { PlayerStatsProvider } from './PlayerStatsContext';
import PlayerLevelBar from './PlayerLevelBar';
import { GameEventProvider } from './GameEventContext';
import EmojiAssistant from './EmojiAssistant';

const CasinoPage: React.FC = () => {
    const [view, setView] = useState<'menu' | 'game' | 'converter'>('menu');
    const [activeGame, setActiveGame] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSelectGame = (game: string) => {
        setActiveGame(game);
        setView('game');
    };

    const renderContent = () => {
        switch (view) {
            case 'converter':
                return <CouponConverter onBack={() => setView('menu')} />;
            case 'game':
                switch (activeGame) {
                    case 'roulette':
                        return <RouletteGame />;
                    case 'blackjack':
                        return <BlackjackGame />;
                    case 'slots':
                        return <SlotsGame />;
                    case 'crash': // <-- Добавляем новую игру
                        return <CrashGame />;
                    default:
                        setView('menu');
                        return null;
                }
            case 'menu':
            default:
                return (
                    <div className="game-selection">
                        <h2>Выберите игру</h2>
                        <div className="game-buttons">
                            <button onClick={() => handleSelectGame('roulette')}>Рулетка</button>
                            <button onClick={() => handleSelectGame('blackjack')}>Блекджек</button>
                            <button onClick={() => handleSelectGame('slots')}>Слоты</button>
                            <button onClick={() => handleSelectGame('crash')}>Crash</button> 
                        </div>
                    </div>
                );
        }
    };

    return (
        <PlayerStatsProvider> 
            <GameEventProvider>
                <EmojiAssistant />
                <div className="casino-page">
                    <div className="blur-background"></div>
                    <div className="casino-panel">
                        {view === 'menu' && (
                            <button className="back-button" onClick={() => navigate('/officer')}>
                                Назад
                            </button>
                        )}
                        
                        {view === 'menu' && (
                            <button className="coupon-button" onClick={() => setView('converter')}>
                                Перевести купоны
                            </button>
                        )}

                        <div className="casino-header">
                            <h1 className="animated-gradient-text">Казино "НЕ бритые яйца"</h1>
                            {view === 'game' && (
                                <button className="ingame-back-button" onClick={() => setView('menu')}>
                                    К выбору игр
                                </button>
                            )}
                        </div>

                        <div className="casino-content">
                            {renderContent()}
                        </div>

                        <PlayerLevelBar />
                    </div>
                </div>
            </GameEventProvider>
        </PlayerStatsProvider>
    );
};

export default CasinoPage;
