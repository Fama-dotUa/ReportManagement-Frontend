import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

type CreateReportInput = {
	userId: string | number
	reasonId: string | number
	days: number
	description: string
	creatorId?: string | number
}

const createReportRequest = async (body: CreateReportInput) => {
	const payload = {
		data: {
			user: Number(body.userId),
			reason: String(body.reasonId),
			time_to_free: Number(body.days),
			description: body.description,
			creator: body.creatorId ? Number(body.creatorId) : undefined,
		},
	}
	const res = await api.post('/api/reports', payload)
	return res.data.data
}

export const useCreateReport = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: createReportRequest,
		onSuccess: (_data, variables) => {
			// keep caches in sync without blasting everything
			qc.invalidateQueries({ queryKey: ['reports'] })
			if (variables.userId) {
				qc.invalidateQueries({
					queryKey: ['reportsBySoldier', variables.userId],
				})
			}
		},
	})
}
