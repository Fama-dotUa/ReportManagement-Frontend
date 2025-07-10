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

	console.log('Creating report with data:', {
		userId,
		reasonId,
		days,
		description,
	})

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

	if (!res.ok) {
		const err = await res.json()
		throw new Error(err?.message || 'Ошибка создания рапорта')
	}

	return await res.json()
}
