import { useEffect, useMemo, useState } from 'react'

export function useAuth() {
	const token = localStorage.getItem('jwt')
	const rawUser = localStorage.getItem('user')
	const [CR, setCR] = useState<number>(0)
	const user = useMemo(() => {
		try {
			return rawUser ? JSON.parse(rawUser) : null
		} catch {
			return null
		}
	}, [rawUser])

	const [role, setRole] = useState<string | null>(null)

	useEffect(() => {
		if (!user?.id || !token) return

		const fetchRole = async () => {
			try {
				const res = await fetch(
					`${import.meta.env.VITE_API_URL}/api/users/${user.id}?populate=role`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)

				if (!res.ok) throw new Error('Не удалось получить роль')

				const data = await res.json()
				setCR(data.CR || 0)
				const roleName = data.role?.name || null

				if (roleName) {
					setRole(roleName)
					localStorage.setItem('role', roleName) // на будущее
				}
			} catch (err) {
				console.error('Ошибка при получении роли:', err)
			}
		}

		fetchRole()
	}, [user?.id, token])

	return {
		isAuth: !!token,
		token,
		user,
		role,
		CR,
	}
}
