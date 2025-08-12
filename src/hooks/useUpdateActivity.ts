import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const updateLastSeenRequest = async (userId: number) => {
	const token = localStorage.getItem('jwt')
	if (!token || !userId) {
		return
	}

	return axios.put(
		`${API_URL}/api/users/${userId}`,
		{
			last_seen: new Date().toISOString(),
		},
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	)
}

export const useUpdateActivity = () => {
	return useMutation({
		mutationFn: updateLastSeenRequest,
	})
}
