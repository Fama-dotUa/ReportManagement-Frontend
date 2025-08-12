import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import dayjs from 'dayjs'
import type { Report } from '../intefaces/Report'

const API_URL = import.meta.env.VITE_API_URL

const transformReports = (data: any[]): Report[] => {
	return data.map((item: any) => ({
		id: item.id,
		createdAt: item.createdAt,
		reasonCipher: item.reason?.cipher || ' ',
		reasonNumber: item.reason?.number || 0,
		username: item.user.username,
	}))
}

const fetchReports = async () => {
	const token = localStorage.getItem('jwt')
	if (!token) throw new Error('Пользователь не авторизован')

	const date = dayjs().subtract(3, 'day').startOf('day').toISOString()

	const res = await axios.get(`${API_URL}/api/reports`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		params: {
			'filters[createdAt][$gte]': date,
			'sort[0]': 'createdAt:desc',
			'populate[user]': true,
			'populate[reason]': true,
		},
	})

	return res.data.data
}

export const useReports = () => {
	return useQuery({
		queryKey: ['reports'],
		queryFn: fetchReports,
		select: transformReports,
		staleTime: 10 * 60 * 1000,
	})
}
