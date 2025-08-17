import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

interface PurchasePayload {
	applicantId: number
	positionId: number
}

const purchasePositionRequest = async ({
	applicantId,
	positionId,
}: PurchasePayload) => {
	const token = localStorage.getItem('jwt')
	if (!token) throw new Error('Нет авторизации')

	const { data } = await axios.post(
		`${API_URL}/api/training-requests`,
		{
			data: {
				status_request: 'рассматривается',
				applicant: applicantId,
				position: positionId,
			},
		},
		{ headers: { Authorization: `Bearer ${token}` } }
	)
	return data
}

export const usePurchasePosition = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: purchasePositionRequest,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['trainingRequests'] })
			queryClient.invalidateQueries({ queryKey: ['currentUser'] })
		},
		onError: (error: any) => {
			const errorMessage = error.response?.data?.error?.message || error.message
			alert(`Ошибка при создании заявки: ${errorMessage}`)
		},
	})
}
