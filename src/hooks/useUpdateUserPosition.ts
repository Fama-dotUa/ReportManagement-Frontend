import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

type UserUpdateData = {
	positions?: {
		connect: number[]
	}
	CR?: number
	CR_for_all_time?: number
}

// 2. Используем этот тип в нашем payload
interface UpdateUserPayload {
	userId: number
	data: UserUpdateData // <-- Заменяем 'object' на наш новый точный тип
}
const updateUserRequest = async ({ userId, data }: UpdateUserPayload) => {
	const token = localStorage.getItem('jwt')
	if (!token) throw new Error('Нет авторизации')

	return axios.put(`${API_URL}/api/users/${userId}`, data, {
		headers: { Authorization: `Bearer ${token}` },
	})
}

export const useUpdateUserPosition = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: updateUserRequest,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['users'] })
			queryClient.invalidateQueries({ queryKey: ['user', variables.userId] })
			queryClient.invalidateQueries({ queryKey: ['currentUser'] })
		},
	})
}
