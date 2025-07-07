export const useCreateUser = () => {
	const token = localStorage.getItem('jwt')

	const createUser = async (user: any) => {
		try {
			const roleName = user.role || 'Authenticated'

			const rolesRes = await fetch(
				`${import.meta.env.VITE_API_URL}/api/users-permissions/roles`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			const rolesData = await rolesRes.json()

			type Role = { id: number; name: string; [key: string]: any }
			const matchedRole = Object.values(rolesData.roles).find(
				(r: any) => (r as Role).name === roleName
			) as Role | undefined

			if (!matchedRole) {
				throw new Error(`Роль "${roleName}" не найдена`)
			}

			console.log('user.rank:', user.rank)

			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					username: user.username,
					password: user.password,
					email: `${user.username}_${Date.now()}@local.fake`,
					discord: user.discord,
					rank: user.rank - 1,
					role: matchedRole?.id,
					icon: user.icon,
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
