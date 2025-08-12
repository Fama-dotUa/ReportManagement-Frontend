import { useMutation, useQueryClient } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_API_URL

interface LoginCredentials {
	identifier: string
	password: string
}

const loginApiCall = async (credentials: LoginCredentials) => {
	const res = await fetch(`${API_URL}/api/auth/local`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials),
	})

	const data = await res.json()

	if (!res.ok) {
		throw new Error(data?.error?.message || 'Неверный логин или пароль')
	}

	return data
}

export const useLogin = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: loginApiCall,
		onSuccess: data => {
			localStorage.setItem('jwt', data.jwt)
			queryClient.invalidateQueries({ queryKey: ['currentUser'] })
		},
	})
}
