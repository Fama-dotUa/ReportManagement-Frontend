// --- START OF FILE src/hooks/useCollectibles.ts ---

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import collectiblesService from '../services/collectiblesService';
import { InventoryItem, ShopItem } from '../types/collectibles';

export const useShopItems = () => {
    return useQuery<ShopItem[], Error>({
        queryKey: ['shopItems'],
        queryFn: collectiblesService.getShopItems,
        staleTime: 1000 * 60 * 5, // Кэш на 5 минут
    });
};

export const usePlayerInventory = () => {
    return useQuery<InventoryItem[], Error>({
        queryKey: ['playerInventory'],
        queryFn: collectiblesService.getPlayerInventory,
        staleTime: 1000 * 60, // Кэш на 1 минуту
    });
};

export const useBuyCollectible = () => {
    const queryClient = useQueryClient();

    return useMutation<
        { success: boolean; message?: string; newBalance?: number },
        Error,
        { itemId: string; userId: string; quantity?: number }
    >({
        mutationFn: ({ itemId, userId, quantity }) =>
            collectiblesService.buyItem(itemId, userId, quantity),
        onSuccess: (data, variables) => {
            if (data.success) {
                // Инвалидация кэша магазина и инвентаря, чтобы данные обновились
                queryClient.invalidateQueries({ queryKey: ['shopItems'] });
                queryClient.invalidateQueries({ queryKey: ['playerInventory'] });
                // Можно также обновить баланс игрока в PlayerStatsContext, если он там хранится
                // queryClient.invalidateQueries({ queryKey: ['playerBalance'] }); // Если есть такой запрос
            }
        },
    });
};

// --- END OF FILE src/hooks/useCollectibles.ts ---