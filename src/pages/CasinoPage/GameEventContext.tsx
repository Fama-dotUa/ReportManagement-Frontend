import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

type GameEventType = 'win' | 'loss' | 'idle';

interface GameEventContextType {
    triggerGameEvent: (event: GameEventType) => void;
}

const GameEventContext = createContext<GameEventContextType | undefined>(undefined);

export const GameEventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Этот стейт будет передан в EmojiAssistant, но нам не нужен сам gameEvent здесь
    const [_, setGameEvent] = useState<GameEventType>('idle');

    const triggerGameEvent = useCallback((event: GameEventType) => {
        setGameEvent(event);
        // Создаем кастомное событие, которое будет слушать ассистент
        window.dispatchEvent(new CustomEvent('gameEvent', { detail: event }));
    }, []);

    const value = { triggerGameEvent };

    return (
        <GameEventContext.Provider value={value}>
            {children}
        </GameEventContext.Provider>
    );
};

export const useGameEvents = (): GameEventContextType => {
    const context = useContext(GameEventContext);
    if (context === undefined) {
        throw new Error('useGameEvents must be used within a GameEventProvider');
    }
    return context;
};
