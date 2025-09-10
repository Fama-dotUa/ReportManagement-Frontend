import { useState, useEffect } from 'react';
import collectiblesService from '../services/collectiblesService';
import type { CollectibleItem, UserInventoryItem } from '../components/Types/collectibles';

interface CollectiblesState {
    items: CollectibleItem[];
    inventory: UserInventoryItem[];
}

export const useCollectibles = () => {
    const [state, setState] = useState<CollectiblesState>(collectiblesService.state);

    useEffect(() => {
        // Функция, которая будет вызываться сервисом при каждом обновлении
        const handleStateUpdate = (newState: CollectiblesState) => {
            setState(newState);
        };

        // Подписываемся на изменения при монтировании компонента
        collectiblesService.subscribe(handleStateUpdate);

        // Отписываемся при размонтировании, чтобы избежать утечек памяти
        return () => {
            collectiblesService.unsubscribe(handleStateUpdate);
        };
    }, []); // Пустой массив здесь правильный, т.к. хук управляет подпиской сам

    return state;
};