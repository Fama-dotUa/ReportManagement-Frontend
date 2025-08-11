import { useEffect, useState, useCallback } from 'react'
// Убедитесь, что импортируете ваш тип User
import type { User } from '../types/User'
import { transformUsers } from '../api/transformUsers'

const API_URL = import.meta.env.VITE_API_URL

export function useAuth() {
	const [token, setToken] = useState<string | null>(localStorage.getItem('jwt'))
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState<boolean>(true)

	const fetchFullUserData = useCallback(async (jwt: string) => {
		setLoading(true)
		try {
			const response = await fetch(`${API_URL}/api/users/me?populate=*`, {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			})

			if (!response.ok) {
				// Если токен невалидный, очищаем данные
				localStorage.removeItem('jwt')
				setToken(null)
				setUser(null)
				throw new Error('Не удалось получить данные пользователя.')
			}
			const fullUserData = await response.json()
			const transformUsersData = transformUsers([fullUserData])
			setUser(
				Array.isArray(transformUsersData)
					? transformUsersData[0]
					: transformUsersData
			)

			localStorage.setItem('user', JSON.stringify(fullUserData))
		} catch (error) {
			console.error('Ошибка при получении данных пользователя:', error)
			setUser(null)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		if (token) {
			fetchFullUserData(token)
		} else {
			setUser(null)
			setLoading(false)
		}
	}, [token, fetchFullUserData])

	return {
		isAuth: !!user && !!token,
		token,
		user,
		loading,
		role: user?.role || null,
		CR: user?.CR || 0,
	}
}
