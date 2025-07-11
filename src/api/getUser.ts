const API_URL = import.meta.env.VITE_API_URL

export const getUser = async (userId: number) => {
	const token = localStorage.getItem('jwt')
	if (!token) throw new Error('JWT не найден в localStorage')

	try {
		const res = await fetch(`${API_URL}/api/users/${userId}?populate=*`, {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		})

		if (!res.ok) {
			throw new Error(`Ошибка загрузки пользователя: ${res.status}`)
		}

		const user = await res.json()
		return user
	} catch (error) {
		console.error('Ошибка при получении пользователя:', error)
		throw error
	}
}
