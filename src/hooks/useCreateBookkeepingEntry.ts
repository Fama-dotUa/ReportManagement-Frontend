import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

interface BookkeepingPayload {
	type: 'выдача' | 'взыскание'
	sum: number
	boss: number
	soldier: number
	description: string
}

const createEntryRequest = async (payload: BookkeepingPayload) => {
	const token = localStorage.getItem('jwt')
	if (!token) throw new Error('Нет авторизации')

	const { data } = await axios.post(
		`${API_URL}/api/bookkeepings`,
		{ data: payload },
		{ headers: { Authorization: `Bearer ${token}` } }
	)
	return data.data
}

export const useCreateBookkeepingEntry = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createEntryRequest,
		onSuccess: () => {
			// Опционально: если у вас будет страница с историей бухгалтерии,
			// можно инвалидировать её кэш, чтобы список обновлялся.
			// queryClient.invalidateQueries({ queryKey: ['bookkeepingEntries'] });
		},
	})
}
