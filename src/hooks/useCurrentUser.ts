import { useQuery } from '@tanstack/react-query'

const fetchCurrentUser = async () => {
	const token = localStorage.getItem('jwt')
	if (!token) {
		return null
	}

	const API_URL = import.meta.env.VITE_API_URL
	const res = await fetch(`${API_URL}/api/users/me?populate=*`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!res.ok) {
		localStorage.removeItem('jwt')
		return null
	}

	return res.json()
}

export const useCurrentUser = () => {
	return useQuery({
		queryKey: ['currentUser'],
		queryFn: fetchCurrentUser,
		staleTime: Infinity,
		gcTime: Infinity,
	})
}
