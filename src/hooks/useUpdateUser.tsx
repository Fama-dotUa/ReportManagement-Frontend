import { useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL

const getRoleIdByType = async (type: string): Promise<number | null> => {
	try {
		const token = localStorage.getItem('jwt')
		if (!token) return null

		const res = await fetch(`${API_URL}/api/users-permissions/roles`, {
			headers: { Authorization: `Bearer ${token}` },
		})
		const data = await res.json()
		const role = data.roles.find((r: any) => r.type === type)
		return role?.id || null
	} catch (err) {
		console.error('Ошибка при получении ID роли:', err)
		return null
	}
}

const getRankIdByName = async (name: string): Promise<number | null> => {
	try {
		const token = localStorage.getItem('jwt')
		if (!token) return null

		const res = await fetch(`${API_URL}/api/ranks?populate=* `, {
			headers: { Authorization: `Bearer ${token}` },
		})
		const data = await res.json()
		const match = data.data.find((r: any) => r.name === name)
		return match?.id || null
	} catch (err) {
		console.error('Ошибка при получении ID звания:', err)
		return null
	}
}

export const useUpdateUser = (currentUserId: number | null) => {
	const updateUser = useCallback(
		async (
			updatedUser: any
		): Promise<{ success: boolean; message?: string }> => {
			try {
				const token = localStorage.getItem('jwt')
				if (!token) return { success: false, message: 'Токен не найден' }

				const userId = updatedUser.id
				const isSelf = currentUserId === userId

				const payload: any = {
					username: updatedUser.username,
					discord: updatedUser.discord,
				}

				// Роль — по type → ID
				if (!isSelf && updatedUser.role) {
					const roleType =
						typeof updatedUser.role === 'object'
							? updatedUser.role.type
							: updatedUser.role
					const roleId = await getRoleIdByType(roleType)
					if (roleId !== null) {
						payload.role = roleId
					} else {
						console.warn('ID роли не найден')
					}
				}

				// Звание — по имени → ID
				if (updatedUser.rank) {
					const rankId = await getRankIdByName(updatedUser.rank)
					if (rankId !== null) {
						payload.rank = rankId
					} else {
						console.warn('ID звания не найден')
					}
				}

				if (updatedUser.icon) {
					payload.icon = updatedUser.icon
				}

				const res = await fetch(`${API_URL}/api/users/${userId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				})

				if (!res.ok) {
					const errorText = await res.text()
					throw new Error(errorText)
				}

				return { success: true }
			} catch (err: any) {
				console.error('Ошибка обновления пользователя:', err)
				return { success: false, message: err.message || 'Ошибка' }
			}
		},
		[currentUserId]
	)

	return { updateUser }
}
