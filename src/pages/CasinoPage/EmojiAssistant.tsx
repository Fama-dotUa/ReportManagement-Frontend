import React, { useState, useEffect, useRef } from 'react';
import { winPhrases, lossPhrases, shakePhrases } from './phrases';
import './EmojiAssistant.css';

type GameEventType = 'win' | 'loss' | 'idle';

const winEmojis = ['🥳', '🤩', '🎉', '🤑', '😎'];
const lossEmojis = ['😢', '😭', '😥', '😩', '🤯'];
const idleEmojis = ['😊', '🙂', '🤔', '😐', '🧐'];

const EmojiAssistant: React.FC = () => {
    const [position, setPosition] = useState({ x: 50, y: window.innerHeight - 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [message, setMessage] = useState('');
    const [emoji, setEmoji] = useState(() => idleEmojis[Math.floor(Math.random() * idleEmojis.length)]);
    const [animationKey, setAnimationKey] = useState(0);
    
    // --- ИЗМЕНЕНИЯ ДЛЯ КУЛДАУНА ТРЯСКИ ---
    const [canShake, setCanShake] = useState(true); 

    const assistantRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef({ x: 0, y: 0 });
    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastPosRef = useRef({ x: 0, y: 0, time: 0 });

    useEffect(() => {
        setAnimationKey(prevKey => prevKey + 1);
    }, [emoji]);

    const handleShake = () => {
        // Проверяем, можно ли сейчас трясти
        if (isShaking || !canShake) return;

        if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
        
        setCanShake(false); // Активируем кулдаун
        setIsShaking(true);
        setEmoji('😵');
        setMessage(shakePhrases[Math.floor(Math.random() * shakePhrases.length)]);

        // Сбрасываем состояние после анимации
        setTimeout(() => {
            setIsShaking(false);
            setEmoji(idleEmojis[Math.floor(Math.random() * idleEmojis.length)]);
            setMessage('');
        }, 4000);

        // Сбрасываем кулдаун через 10 секунд
        setTimeout(() => {
            setCanShake(true);
        }, 7000);
    };

    useEffect(() => {
        const handleGameEvent = (event: Event) => {
            const gameEvent = (event as CustomEvent<GameEventType>).detail;
            
            if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);

            if (gameEvent === 'win') {
                setEmoji(winEmojis[Math.floor(Math.random() * winEmojis.length)]);
                setMessage(winPhrases[Math.floor(Math.random() * winPhrases.length)]);
            } else if (gameEvent === 'loss') {
                setEmoji(lossEmojis[Math.floor(Math.random() * lossEmojis.length)]);
                setMessage(lossPhrases[Math.floor(Math.random() * lossPhrases.length)]);
            }

            messageTimeoutRef.current = setTimeout(() => {
                setEmoji(idleEmojis[Math.floor(Math.random() * idleEmojis.length)]);
                setMessage('');
            }, 4000);
        };

        window.addEventListener('gameEvent', handleGameEvent);

        return () => {
            window.removeEventListener('gameEvent', handleGameEvent);
            if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
        };
    }, []);


    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (assistantRef.current) {
            setIsDragging(true);
            const rect = assistantRef.current.getBoundingClientRect();
            offsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
            lastPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            const now = Date.now();
            const deltaX = e.clientX - lastPosRef.current.x;
            const deltaY = e.clientY - lastPosRef.current.y;
            const deltaTime = now - lastPosRef.current.time;
            
            if (deltaTime > 0) {
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const velocity = distance / deltaTime;

                // ИЗМЕНЕНИЕ: Увеличиваем порог скорости для меньшей чувствительности
                if (velocity > 5.8) {
                    handleShake();
                }
            }

            lastPosRef.current = { x: e.clientX, y: e.clientY, time: now };
            
            setPosition({
                x: e.clientX - offsetRef.current.x,
                y: e.clientY - offsetRef.current.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };



    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div className="emoji-assistant-container">
            <div
                ref={assistantRef}
                className={`emoji-assistant ${isShaking ? 'shaking' : ''}`}
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
                onMouseDown={handleMouseDown}
            >
                <div key={animationKey} className="emoji-character">{emoji}</div>
                {message && <div className="emoji-bubble">{message}</div>}
            </div>
        </div>
    );
};

export default EmojiAssistant;
