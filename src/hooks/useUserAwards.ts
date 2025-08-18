import { useState, useEffect } from 'react'

// Определяем типы для большей ясности
type AwardImage = {
	url: string
}

type MedalAndOrder = {
	id: number
	name: string
	type: 'медаль' | 'орден'
	image: AwardImage
}

export type ProcessedAward = {
	id: number
	name: string
	type: 'медаль' | 'орден'
	imageUrl: string
	count: number
	presentation: string
}

const API_URL = import.meta.env.VITE_API_URL

export const useUserAwards = (userId: number | undefined) => {
	const [awards, setAwards] = useState<ProcessedAward[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		// Не делаем запрос, если ID пользователя не предоставлен
		if (!userId) {
			setLoading(false)
			return
		}

		const fetchAwards = async () => {
			setLoading(true)
			setError(null)

			const query = `?filters[soldier][id][$eq]=${userId}&populate=medals_and_order.image`
			try {
				const response = await fetch(`${API_URL}/api/awards-users${query}`)
				if (!response.ok) {
					throw new Error('Ошибка при загрузке наград')
				}
				const data = await response.json()

				const awardsMap = new Map<number, ProcessedAward>()

				data.data.forEach((entry: any) => {
					const award: MedalAndOrder = entry.medals_and_order
					const presentationDate = new Date(entry.presentation)

					let formattedTitle = award.name

					if (entry.presentation && !isNaN(presentationDate.getTime())) {
						// 2. Форматируем дату и время в локальный стандарт (напр., для Украины)
						const formattedDateTime = presentationDate.toLocaleString('uk-UA', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
						})

						// 3. Собираем title с переносом строки (\n)
						formattedTitle = `\n${formattedDateTime}`
					}

					if (!award) return

					if (awardsMap.has(award.id)) {
						// Если такая награда уже есть в нашей карте, увеличиваем счетчик
						const existingAward = awardsMap.get(award.id)!
						existingAward.count += 1
					} else {
						// Если награды еще нет, добавляем её в карту
						awardsMap.set(award.id, {
							id: award.id,
							name: award.name,
							type: award.type,
							imageUrl: award.image?.url,
							count: 1,
							presentation: formattedTitle,
						})
					}
				})

				const processedAwards = Array.from(awardsMap.values())

				processedAwards.sort((a, b) => {
					if (a.type === b.type) {
						return 0
					}
					return a.type === 'орден' ? -1 : 1
				})

				setAwards(processedAwards)
			} catch (err: any) {
				setError(err.message)
				console.error('Ошибка при загрузке наград:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchAwards()
	}, [userId])

	return { awards, loading, error }
}
