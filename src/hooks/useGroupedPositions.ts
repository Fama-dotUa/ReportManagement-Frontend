import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface PositionItem {
	id: number
	name: string
	description: string
	CR: number
	type: string
}

export interface GroupedPositions {
	[key: string]: PositionItem[]
}

const fetchPositions = async (): Promise<PositionItem[]> => {
	const { data } = await axios.get(
		`${import.meta.env.VITE_API_URL}/api/positions?populate=*&filters[buy]=true`
	)

	return data.data.map((item: any) => ({
		id: item.id,
		...item,
	}))
}

const groupPositionsByType = (items: PositionItem[]): GroupedPositions => {
	return items.reduce((acc: GroupedPositions, item: PositionItem) => {
		const key = item.type
		if (!acc[key]) {
			acc[key] = []
		}
		acc[key].push(item)
		return acc
	}, {})
}

export const useGroupedPositions = () => {
	return useQuery({
		queryKey: ['positions'],
		queryFn: fetchPositions,
		select: groupPositionsByType,
		staleTime: 60 * 60 * 1000,
	})
}
