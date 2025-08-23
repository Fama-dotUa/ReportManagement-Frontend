import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CasinoPage.css';

// Импортируем компоненты игр и новый конвертер
import RouletteGame from './RouletteGame';
import BlackjackGame from './BlackjackGame';
import SlotsGame from './SlotsGame';
import CouponConverter from './CouponConverter';

const CasinoPage: React.FC = () => {
    // Состояние для отслеживания текущего вида: меню, игра или конвертер
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
                        // Если игра не найдена, вернуться в меню
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
        <div className="casino-page">
            <div className="blur-background"></div>
            <div className="casino-panel">
                {/* Кнопка "Назад" видна всегда, кроме главного меню */}
                {view === 'menu' && (
                     <button className="back-button" onClick={() => navigate('/officer')}>
                        Назад
                    </button>
                )}
                
                {/* Кнопка "Перевести купоны" видна только в главном меню */}
                {view === 'menu' && (
                    <button className="coupon-button" onClick={() => setView('converter')}>
                        Перевести купоны
                    </button>
                )}

                <div className="casino-header">
                    <h1>Казино</h1>
                    {/* Кнопка возврата к выбору игр из активной игры */}
                    {view === 'game' && (
                        <button className="ingame-back-button" onClick={() => setView('menu')}>
                            К выбору игр
                        </button>
                    )}
                </div>

                <div className="casino-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default CasinoPage;
