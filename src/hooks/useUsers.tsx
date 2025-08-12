import { useQuery } from '@tanstack/react-query'
import { fetchUsers } from '../api/fetchUsers'
import { transformUsers } from '../api/transformUsers'

export const useUsers = () => {
	return useQuery({
		queryKey: ['users'],
		queryFn: fetchUsers,
		select: transformUsers,
		staleTime: 5 * 60 * 1000, // 5 минут
	})
}
