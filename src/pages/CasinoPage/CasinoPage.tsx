import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CasinoPage.css';

// Импортируем компоненты и новый провайдер
import RouletteGame from './RouletteGame';
import BlackjackGame from './BlackjackGame';
import SlotsGame from './SlotsGame';
import CouponConverter from './CouponConverter';
import { PlayerStatsProvider } from './PlayerStatsContext'; // <-- Импорт провайдера
import PlayerLevelBar from './PlayerLevelBar'; // <-- Импорт компонента уровня

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
                        </div>
                    </div>
                );
        }
    };

    return (
        // Оборачиваем все в провайдер
        <PlayerStatsProvider> 
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

                    {/* Добавляем компонент уровня, он будет виден всегда */}
                    <PlayerLevelBar />
                </div>
            </div>
        </PlayerStatsProvider>
    );
};

export default CasinoPage;
