import { useMemo } from 'react'

type Searchable = {
	username: string
	discord: string
}

export const useSearch = <T extends Searchable>(
	data: T[],
	searchQuery: string
): T[] => {
	return useMemo(() => {
		if (searchQuery.trim().length < 2) return data

		const lower = searchQuery.toLowerCase()
		return data.filter(
			item =>
				item.username.toLowerCase().includes(lower) ||
				item.discord.toLowerCase().includes(lower)
		)
	}, [data, searchQuery])
}
