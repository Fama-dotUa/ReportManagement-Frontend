export const useCreateUser = () => {
	const token = localStorage.getItem('jwt')

	const createUser = async (user: any) => {
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					username: user.username,
					password: user.password,
					discord: user.discord,
					rank: user.rank,
					role: user.role,
					icon: user.icon, // по ситуации: URL или upload
				}),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error?.message || 'Ошибка')

			return { success: true, data }
		} catch (e: any) {
			return { success: false, message: e.message }
		}
	}

	return { createUser }
}
