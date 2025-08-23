import React, { useState, useEffect, useRef } from 'react';
import { winPhrases, lossPhrases } from './phrases';
import './EmojiAssistant.css';

type GameEventType = 'win' | 'loss' | 'idle';

const EmojiAssistant: React.FC = () => {
    const [position, setPosition] = useState({ x: 50, y: window.innerHeight - 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [message, setMessage] = useState('');
    const [emoji, setEmoji] = useState('😊'); // Нейтральный
    const assistantRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef({ x: 0, y: 0 });
    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleGameEvent = (event: Event) => {
            const gameEvent = (event as CustomEvent<GameEventType>).detail;
            
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }

            if (gameEvent === 'win') {
                setEmoji('🥳');
                setMessage(winPhrases[Math.floor(Math.random() * winPhrases.length)]);
            } else if (gameEvent === 'loss') {
                setEmoji('😢');
                setMessage(lossPhrases[Math.floor(Math.random() * lossPhrases.length)]);
            }

            messageTimeoutRef.current = setTimeout(() => {
                setEmoji('😊');
                setMessage('');
            }, 4000); // Сообщение исчезнет через 4 секунды
        };

        window.addEventListener('gameEvent', handleGameEvent);

        return () => {
            window.removeEventListener('gameEvent', handleGameEvent);
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }
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
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
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
                className="emoji-assistant"
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
                onMouseDown={handleMouseDown}
            >
                <div className="emoji-character">{emoji}</div>
                {message && <div className="emoji-bubble">{message}</div>}
            </div>
        </div>
    );
};

export default EmojiAssistant;
