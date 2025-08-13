import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export interface TrainingRequest {
	documentId: string
	status_request:
		| 'рассматривается'
		| 'обучается'
		| 'обучен'
		| 'отклонён'
		| 'халтура начальства'
		| 'провалено'
	createdAt: string
	applicant: { id: number; username: string }
	instructor?: {
		id: number
		username: string
		CR: number
		CR_for_all_time: number
	}
	position: { id: number; name: string; description: string; CR: number }
	rejection_reason?: string
}

const fetchTrainingRequests = async (): Promise<TrainingRequest[]> => {
	const token = localStorage.getItem('jwt')
	if (!token) throw new Error('Нет авторизации')

	const { data } = await axios.get(`${API_URL}/api/training-requests`, {
		headers: { Authorization: `Bearer ${token}` },
		params: {
			populate: '*',
		},
	})
	return data.data.map((item: any) => ({
		id: item.documentId,
		...item,

		applicant: item.applicant,
		instructor: item.instructor,
		position: item.position,
	}))
}

export const useTrainingRequests = () => {
	return useQuery<TrainingRequest[]>({
		queryKey: ['trainingRequests'],
		queryFn: fetchTrainingRequests,
		staleTime: 5 * 60 * 1000, // 5 минут
	})
}
