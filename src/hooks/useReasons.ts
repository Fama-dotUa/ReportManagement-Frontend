import { useQuery } from '@tanstack/react-query'
import { getReasons } from '../api/getReasons' // Ваша существующая функция

export const useReasons = () => {
	return useQuery({
		queryKey: ['reasons'],
		queryFn: getReasons,
		staleTime: 60 * 60 * 1000, // Причины редко меняются, кэшируем на час
	})
}
