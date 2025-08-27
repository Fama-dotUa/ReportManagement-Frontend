import { useQuery } from '@tanstack/react-query'
import api from '../api/client'
import dayjs from 'dayjs'

type ReportView = {
	id: number
	time_to_free: number
	createdAt: string
	description: string
	creatorName: string
	reason: {
		cipher: string
		number: number
		description: string
	}
}

const fetchReportsBySoldier = async (soldierId: number | string) => {
	const { data } = await api.get(`/api/reports`, {
		params: {
			'filters[user][id][$eq]': soldierId,
			populate: '*',
			'sort[0]': 'createdAt:desc',
			'pagination[pageSize]': 50,
		},
	})

	return (data.data ?? []).map(
		(r: any): ReportView => ({
			id: r.id,
			time_to_free: r.time_to_free,
			createdAt: r.createdAt,
			description: r.description,
			creatorName: r.creator?.username ?? '—',
			reason: {
				cipher: r.reason?.cipher ?? '',
				number: r.reason?.number ?? 0,
				description: r.reason?.description ?? '',
			},
		})
	)
}

export const useReportsBySoldier = (soldierId: number | string | null) => {
	return useQuery({
		enabled: !!soldierId,
		queryKey: ['reportsBySoldier', soldierId],
		queryFn: () => fetchReportsBySoldier(soldierId!),
		staleTime: 10 * 60 * 1000,
		select: list =>
			list.map(
				(item: {
					createdAt: string | number | Date | dayjs.Dayjs | null | undefined
				}) => ({
					...item,
					// any lightweight derived data stays here
					createdAt: dayjs(item.createdAt).toISOString(),
				})
			),
	})
}
