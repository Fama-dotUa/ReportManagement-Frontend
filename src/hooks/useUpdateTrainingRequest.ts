import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

interface UpdatePayload {
	requestId: string
	data: Partial<{
		status_request: string
		instructor: number
		rejection_reason: string
	}>
}

const updateRequest = async ({ requestId, data }: UpdatePayload) => {
	const token = localStorage.getItem('jwt')
	if (!token) throw new Error('Нет авторизации')

	return axios.put(
		`${API_URL}/api/training-requests/${requestId}`,
		{ data },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	)
}

export const useUpdateTrainingRequest = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: updateRequest,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['trainingRequests'] })
		},
	})
}
