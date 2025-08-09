export const fetchUsers = async () => {
	const token = localStorage.getItem('jwt')
	if (!token) throw new Error('JWT не найден в localStorage')

	const res = await fetch(
		`${import.meta.env.VITE_API_URL}/api/users?populate=*`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		}
	)
	if (!res.ok) throw new Error('Не удалось загрузить пользователей')
	const rawUsers = await res.json()

	if (!Array.isArray(rawUsers)) {
		throw new Error('Ответ Strapi не является массивом пользователей')
	}
	return await rawUsers
}
