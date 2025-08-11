import { useState, useEffect } from 'react'

import type {
	CosmeticItem,
	FrameItem,
	ProfileBgItem,
	ChevronBgItem,
} from '../pages/CosmeticsPage/CosmeticCard'

import type { User } from '../types/User'

export interface AllCosmeticsData {
	frames: FrameItem[]
	backgrounds: ProfileBgItem[]
	schildiks: ChevronBgItem[]
}

const API_URL = import.meta.env.VITE_API_URL

const transformStrapiCollection = (
	collection: any[],
	type: 'frame' | 'profile-bg' | 'chevron-bg',
	ownedItemIds: Set<number>
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
			canBuy: !ownedItemIds.has(item.id),
		}

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
				const exhaustiveCheck: never = type
				throw new Error(`Unhandled cosmetic type: ${exhaustiveCheck}`)
		}
	})
}

export const useAllCosmetics = (user: User | null) => {
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
						`${API_URL}/api/${collectionName}?populate=*&filters[buy]=true&filters[publishedAt][$notNull]=null`
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
				console.log(schildiksRes)
				const ownedFrames = new Set(
					user?.framesfor_avatars_all?.map(i => i.id) || []
				)
				const ownedBackgrounds = new Set(
					user?.profile_backgrounds_all?.map(i => i.id) || []
				)
				const ownedSchildiks = new Set(
					user?.fon_schildiks_all?.map(i => i.id) || []
				)

				setData({
					frames: transformStrapiCollection(
						framesRes.data,
						'frame',
						ownedFrames
					) as FrameItem[],
					backgrounds: transformStrapiCollection(
						backgroundsRes.data,
						'profile-bg',
						ownedBackgrounds
					) as ProfileBgItem[],
					schildiks: transformStrapiCollection(
						schildiksRes.data,
						'chevron-bg',
						ownedSchildiks
					) as ChevronBgItem[],
				})
			} catch (e: any) {
				setError(e)
			} finally {
				setLoading(false)
			}
		}

		fetchAllCollections()
	}, [user])

	return { allCosmetics: data, loading, error }
}
