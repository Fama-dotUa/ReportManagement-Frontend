import React from 'react';
import { Outlet } from 'react-router-dom';

// Импортируем все необходимое для общего макета
import { PlayerStatsProvider } from './PlayerStatsContext';
import { GameEventProvider } from './GameEventContext';
import EmojiAssistant from './EmojiAssistant';
import './CasinoPage.css'; // Используем общие стили

const CasinoLayout: React.FC = () => {
    return (
        // Оборачиваем все страницы казино в провайдеры
        <PlayerStatsProvider>
            <GameEventProvider>
                <EmojiAssistant />
                <div className='casino-page'>
                    {/* Outlet - это место, куда React Router будет вставлять дочерние компоненты: 
                        CasinoPage, CollectiblesShopPage, и т.д. */}
                    <Outlet />
                </div>
            </GameEventProvider>
        </PlayerStatsProvider>
    );
};

export default CasinoLayout;