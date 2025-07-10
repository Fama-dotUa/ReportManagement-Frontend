import { useEffect, useState } from 'react'
import axios from 'axios'

type ReportView = {
	id: number
	time_to_free: number
	createdAt: string
	description: string
	creatorName: string
	reason: {
		cipher: string
		number: number
		description: string
	}
}

export const useReportsBySoldier = (soldierId: string | null) => {
	const [reports, setReports] = useState<ReportView[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const API_URL = import.meta.env.VITE_API_URL

	useEffect(() => {
		if (!soldierId) return

		const token = localStorage.getItem('jwt')
		if (!token) {
			setError('Пользователь не авторизован')
			return
		}

		setLoading(true)
		setError(null)

		axios
			.get(
				`${API_URL}/api/reports?filters[user][id][$eq]=${soldierId}&populate=*`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			.then(res => {
				const raw = res.data?.data

				if (!Array.isArray(raw)) {
					console.error('Некорректный формат данных:', res.data)
					setError('Неверный ответ от сервера')
					return
				}
				const result: ReportView[] = raw.map((r: any) => ({
					id: r.id,
					time_to_free: r.time_to_free,
					createdAt: r.createdAt,
					description: r.description,
					creatorName: r.creator?.username || '',
					reason: {
						cipher: r.reason?.cipher || '',
						number: r.reason?.number || 0,
						description: r.reason?.description || '',
					},
				}))

				setReports(result)
			})
			.catch(err => {
				console.error('Ошибка запроса:', err)
				setError('Не удалось загрузить рапорты')
			})
			.finally(() => setLoading(false))
	}, [soldierId])

	return { reports, loading, error }
}
