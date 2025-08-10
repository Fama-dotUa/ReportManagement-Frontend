import { useState, useEffect } from 'react'
// Импортируем наш основной тип из компонента, чтобы все было согласовано
import type {
	CosmeticItem,
	FrameItem,
	ProfileBgItem,
	ChevronBgItem,
} from '../pages/CosmeticsPage/CosmeticCard'

// --- Типизация ---

export interface AllCosmeticsData {
	frames: FrameItem[]
	backgrounds: ProfileBgItem[]
	schildiks: ChevronBgItem[]
}

// --- Вспомогательные функции ---

const API_URL = import.meta.env.VITE_API_URL

/**
 * ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ
 * Трансформирует коллекцию из Strapi в массив объектов,
 * соответствующих сложному типу CosmeticItem с вложенным объектом 'preview'.
 */
const transformStrapiCollection = (
	collection: any[],
	type: 'frame' | 'profile-bg' | 'chevron-bg'
): CosmeticItem[] => {
	return collection.map(item => {
		const imageUrl = item.image.url
			? `${API_URL}${item.image.url}`
			: 'https://placehold.co/150x150/cccccc/ffffff?text=No+Image'

		const baseItem = {
			id: item.id.toString(),
			title: item.name,
			description: item.description,
			price: item.CR,
		}

		// Создаем правильную структуру с вложенным объектом preview
		switch (type) {
			case 'frame':
				return {
					...baseItem,
					type: 'frame',
					preview: {
						imageUrl: imageUrl,
						style: 'default',
					},
				}
			case 'profile-bg':
				return {
					...baseItem,
					type: 'profile-bg',
					preview: {
						imageUrl: imageUrl,
					},
				}
			case 'chevron-bg':
				return {
					...baseItem,
					type: 'chevron-bg',
					preview: {
						imageUrl: imageUrl,
					},
				}
			default:
				// Эта ветка никогда не должна выполниться при правильных типах,
				// но она полезна для отладки и безопасности типов.
				const exhaustiveCheck: never = type
				throw new Error(`Unhandled cosmetic type: ${exhaustiveCheck}`)
		}
	})
}

// --- Основной хук ---

export const useAllCosmetics = () => {
	const [data, setData] = useState<AllCosmeticsData>({
		frames: [],
		backgrounds: [],
		schildiks: [],
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		const fetchAllCollections = async () => {
			try {
				setLoading(true)

				const fetchCollection = (collectionName: string) => {
					return fetch(
						`${API_URL}/api/${collectionName}?populate=*&filters[buy]=true`
					).then(res => {
						if (!res.ok) {
							throw new Error(`Failed to fetch ${collectionName}`)
						}
						return res.json()
					})
				}

				const [framesRes, backgroundsRes, schildiksRes] = await Promise.all([
					fetchCollection('framesfor-avatars'),
					fetchCollection('profile-backgrounds'),
					fetchCollection('fon-schildiks'),
				])

				setData({
					frames: transformStrapiCollection(
						framesRes.data,
						'frame'
					) as FrameItem[],
					backgrounds: transformStrapiCollection(
						backgroundsRes.data,
						'profile-bg'
					) as ProfileBgItem[],
					schildiks: transformStrapiCollection(
						schildiksRes.data,
						'chevron-bg'
					) as ChevronBgItem[],
				})
			} catch (e: any) {
				setError(e)
			} finally {
				setLoading(false)
			}
		}

		fetchAllCollections()
	}, [])

	return { allCosmetics: data, loading, error }
}
