import { useState, useEffect } from 'react'

// --- Типизация ---

// Единый формат для всех косметических предметов после трансформации
export interface CosmeticItem {
	id: number
	name: string
	description: string
	price: number
	imageUrl: string
	type: 'frame' | 'background' | 'schildik'
}

// Формат данных, который будет возвращать хук
export interface RandomCosmeticsData {
	frame: CosmeticItem | null
	background: CosmeticItem | null
	schildik: CosmeticItem | null
}
const API_URL = import.meta.env.VITE_API_URL

const transformStrapiData = (
	item: any,
	type: CosmeticItem['type']
): CosmeticItem => {
	console.log('Transforming item:', item)

	return {
		id: item.id,
		name: item.name,
		description: item.description,
		price: item.CR,
		imageUrl: item.image.url
			? `${API_URL}${item.image.url}`
			: 'https://placehold.co/150x150/cccccc/ffffff?text=No+Image',
		type,
	}
}

// --- Основной хук ---

export const useRandomCosmetics = () => {
	const [data, setData] = useState<RandomCosmeticsData>({
		frame: null,
		background: null,
		schildik: null,
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		const fetchRandomItem = async (
			collectionName: string,
			type: CosmeticItem['type']
		) => {
			const countResponse = await fetch(
				`${API_URL}/api/${collectionName}?pagination[pageSize]=1&filters[buy]=true&filters[buy]=true`
			)
			if (!countResponse.ok)
				throw new Error(`Failed to fetch count for ${collectionName}`)
			const { meta } = await countResponse.json()
			const total = meta.pagination.total
			if (total === 0) return null

			const randomIndex = Math.floor(Math.random() * total)
			const itemResponse = await fetch(
				`${API_URL}/api/${collectionName}?populate=*&pagination[start]=${randomIndex}&pagination[limit]=1&filters[buy]=true`
			)
			if (!itemResponse.ok)
				throw new Error(`Failed to fetch random item from ${collectionName}`)
			const { data: itemData } = await itemResponse.json()

			return transformStrapiData(itemData[0], type)
		}

		const fetchAllRandomItems = async () => {
			try {
				setLoading(true)
				const [frame, background, schildik] = await Promise.all([
					fetchRandomItem('framesfor-avatars', 'frame'),
					fetchRandomItem('profile-backgrounds', 'background'),
					fetchRandomItem('fon-schildiks', 'schildik'),
				])
				setData({ frame, background, schildik })
			} catch (e: any) {
				setError(e)
			} finally {
				setLoading(false)
			}
		}

		fetchAllRandomItems()
	}, [])

	return { randomCosmetics: data, loading, error }
}
