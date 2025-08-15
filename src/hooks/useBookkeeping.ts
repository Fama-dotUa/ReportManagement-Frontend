import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export interface BookkeepingEntry {
	id: number
	type: 'выдача' | 'взыскание'
	sum: number
	description: string
	createdAt: string
	boss: {
		username: string
	}
	soldier: {
		username: string
	}
}

const fetchBookkeepingEntries = async (): Promise<BookkeepingEntry[]> => {
	const token = localStorage.getItem('jwt')
	if (!token) throw new Error('Нет авторизации')

	const { data } = await axios.get(`${API_URL}/api/bookkeepings`, {
		headers: { Authorization: `Bearer ${token}` },
		params: {
			'populate[boss]': true,
			'populate[soldier]': true,
			'sort[0]': 'createdAt:desc',
		},
	})

	return data.data.map((item: any) => ({
		id: item.id,
		...item,

		boss: item.boss,
		soldier: item.soldier,
	}))
}

export const useBookkeeping = () => {
	return useQuery<BookkeepingEntry[]>({
		queryKey: ['bookkeepingEntries'],
		queryFn: fetchBookkeepingEntries,
		staleTime: 5 * 60 * 1000,
	})
}
