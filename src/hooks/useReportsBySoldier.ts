import { useEffect, useState } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'

export interface ReportView {
	id: number
	text: string
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
				`${API_URL}/api/reports?filters[user][id][$eq]=${soldierId}&populate=reason`,
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

				const result: ReportView[] = raw.map((r: any) => {
					const reason = r.reason
					const created = dayjs(r.createdAt)

					const whenIssued = created.format('DD.MM.YY HH:mm:ss')
					const status =
						r.time_to_free === 0
							? 'Бессрочно'
							: `Активно еще ${
									r.time_to_free - dayjs().diff(created, 'day')
							  } дн.`

					const text = `${reason.cipher}-${reason.number} | ${reason.description} | ${status} ${whenIssued}`

					return {
						id: r.id,
						text,
					}
				})

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
