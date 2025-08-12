import { useQuery } from '@tanstack/react-query'
import { transformUsers } from '../api/transformUsers'

const API_URL = import.meta.env.VITE_API_URL

const fetchAuthenticatedUser = async () => {
	const token = localStorage.getItem('jwt')
	if (!token) {
		return null
	}
	const response = await fetch(`${API_URL}/api/users/me?populate=*`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
	if (!response.ok) {
		localStorage.removeItem('jwt')
		throw new Error('Сессия истекла или невалидна.')
	}
	// Просто возвращаем JSON как есть
	return response.json()
}

export function useAuth() {
	const {
		data: user,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['currentUser'],
		queryFn: fetchAuthenticatedUser,
		staleTime: Infinity,
		select: rawUserData => {
			if (!rawUserData) {
				return null
			}
			const transformed = transformUsers([rawUserData])
			return Array.isArray(transformed) ? transformed[0] : transformed
		},
	})

	const token = localStorage.getItem('jwt')

	return {
		isAuth: !!user && !!token,
		token,
		user: user || null,
		loading: isLoading,
		isError,
		error,
		role: user?.role || null,
		CR: user?.CR || 0,
	}
}
