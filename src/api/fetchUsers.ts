export const fetchUsers = async () => {
	const token = localStorage.getItem('jwt')
	if (!token) throw new Error('JWT не найден в localStorage')

	const res = await fetch(
		`${import.meta.env.VITE_API_URL}/api/users?populate[role][populate]=*
		&populate[rank][populate]=*
		&populate[Icon][populate]=*
		&populate[positions][filters][publishedAt][$notNull]=true
		&populate[fon_schildik_active][populate]=image
		&populate[framesfor_avatar_active][populate]=image
		&populate[profile_background_active][populate]=image
		&populate[fon_schildiks_all][filters][publishedAt][$notNull]=null
		&populate[fon_schildiks_all][populate]=image
		&populate[framesfor_avatars_all][filters][publishedAt][$notNull]=null
		&populate[framesfor_avatars_all][populate]=image
		&populate[profile_backgrounds_all][filters][publishedAt][$notNull]=null
		&populate[profile_backgrounds_all][populate]=image
`,
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
