import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Убедитесь, что путь правильный

// --- Конфигурация системы уровней ---
const MAX_LEVEL = 25;
const getXpForNextLevel = (level: number): number => {
    // Прогрессивная система: чем выше уровень, тем больше опыта нужно
    return 1500 * (level + 1.5);
};

// --- ИЗМЕНЕНИЕ: Добавляем поля для прогресса Супер Игры ---
interface PlayerStats {
    level: number;
    xp: number;
    xpToNextLevel: number;
    balance: number;
    initialBalance: number;
    superGameProgress: number; // <-- НОВОЕ
    addXp: (cpnWon: number) => void;
    updateBalance: (newBalance: number) => void;
    updateSuperGameProgress: (progress: number | ((prevProgress: number) => number)) => void; // <-- НОВОЕ
    getCommission: () => number;
}

// --- Создание контекста ---
const PlayerStatsContext = createContext<PlayerStats | undefined>(undefined);

// --- Провайдер контекста ---
export const PlayerStatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    // Используем функцию в useState, чтобы начальное значение было установлено только один раз
    const [initialBalance] = useState(() => user?.CPN || 5000);
    const [balance, setBalance] = useState(initialBalance);
    
    const [level, setLevel] = useState(0);
    const [xp, setXp] = useState(0);
    const [xpToNextLevel, setXpToNextLevel] = useState(getXpForNextLevel(0));
    
    // --- ИЗМЕНЕНИЕ: Добавляем состояние для прогресса в контекст ---
    const [superGameProgress, setSuperGameProgress] = useState(0);

    const addXp = (cpnWon: number) => {
        // Опыт начисляется только за выигрыш (cpnWon > 0) и если уровень не максимальный
        if (level >= MAX_LEVEL || cpnWon <= 0) return;

        // Новая формула: 7 xp за каждые 10 CPN
        const xpGained = (cpnWon / 10) * 7;
        
        let currentXp = xp + xpGained;
        let currentLevel = level;
        let requiredXp = xpToNextLevel;

        // Проверка на повышение уровня (возможно, несколько раз за раз)
        while (currentXp >= requiredXp && currentLevel < MAX_LEVEL) {
            currentLevel++;
            currentXp -= requiredXp;
            requiredXp = getXpForNextLevel(currentLevel);
            
            setLevel(currentLevel);
            setXpToNextLevel(requiredXp);
        }

        setXp(currentXp);
    };

    const updateBalance = (newBalance: number) => {
        setBalance(newBalance);
    };
    
    // --- ИЗМЕНЕНИЕ: Новая функция для обновления прогресса ---
    const updateSuperGameProgress = (progress: number | ((prevProgress: number) => number)) => {
        setSuperGameProgress(progress);
    };

    const getCommission = () => {
        const baseCommission = 30;
        const reduction = level; // 1% за каждый уровень
        const finalCommission = baseCommission - reduction;
        return Math.max(finalCommission, 5); // Минимальная комиссия 5%
    };

    const value = {
        level,
        xp,
        xpToNextLevel,
        balance,
        initialBalance,
        superGameProgress, // <-- Передаем
        addXp,
        updateBalance,
        updateSuperGameProgress, // <-- Передаем
        getCommission
    };

    return (
        <PlayerStatsContext.Provider value={value}>
            {children}
        </PlayerStatsContext.Provider>
    );
};

// --- Хук для использования контекста ---
export const usePlayerStats = (): PlayerStats => {
    const context = useContext(PlayerStatsContext);
    if (context === undefined) {
        throw new Error('usePlayerStats must be used within a PlayerStatsProvider');
    }
    return context;
};
