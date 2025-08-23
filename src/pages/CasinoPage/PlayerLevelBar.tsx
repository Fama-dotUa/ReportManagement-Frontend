import React from 'react';
import { usePlayerStats } from './PlayerStatsContext';
import './CasinoPage.css'; // Используем тот же CSS файл для стилей

const PlayerLevelBar: React.FC = () => {
    const { level, xp, xpToNextLevel } = usePlayerStats();

    const progressPercentage = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;

    return (
        <div className="player-level-bar">
            <div className="level-display">
                Уровень: <strong>{level}</strong>
            </div>
            <div className="xp-bar-container">
                <div className="xp-bar-progress" style={{ width: `${progressPercentage}%` }}></div>
                <div className="xp-text">
                    {Math.floor(xp)} / {Math.floor(xpToNextLevel)} XP
                </div>
            </div>
        </div>
    );
};

export default PlayerLevelBar;
