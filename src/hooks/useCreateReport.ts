const API_URL = import.meta.env.VITE_API_URL

export async function createReport({
	userId,
	reasonId,
	days,
	description,
	creatorId,
}: {
	userId: string | number
	reasonId: string | number
	days: number
	description: string
	creatorId?: string | number
}) {
	const token = localStorage.getItem('jwt')
	if (!token) throw new Error('JWT не найден в localStorage')

	const res = await fetch(`${API_URL}/api/reports`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			data: {
				user: Number(userId),
				reason: String(reasonId),
				time_to_free: Number(days),
				description: description,
				creator: Number(creatorId),
			},
		}),
	})

	if (!res.ok) throw new Error('Ошибка при создании рапорта')

	const json = await res.json()
	return json.data
}
