import { useState, useEffect } from 'react'

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

/**
 * Кастомный хук для получения и группировки должностей по типу.
 * @returns {object} Объект с сгруппированными данными, состоянием загрузки и ошибкой.
 */
export const useGroupedPositions = () => {
	const [groupedData, setGroupedData] = useState<GroupedPositions>({})
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			try {
				setError(null)
				setLoading(true)

				const response = await fetch(
					`${
						import.meta.env.VITE_API_URL
					}/api/positions?populate=*&filters[buy]=true`
				)

				if (!response.ok) {
					throw new Error(`Ошибка сети: ${response.status}`)
				}

				const rawData = await response.json()
				const transformedItems: PositionItem[] = rawData.data.map(
					(item: any) => ({
						id: item.id,
						...item,
					})
				)

				const grouped = transformedItems.reduce(
					(acc: GroupedPositions, item: PositionItem) => {
						const key = item.type

						if (!acc[key]) {
							acc[key] = []
						}

						acc[key].push(item)

						return acc
					},
					{}
				)

				setGroupedData(grouped)
			} catch (e) {
				if (e instanceof Error) {
					setError(e)
				}
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	return { groupedData, loading, error }
}
