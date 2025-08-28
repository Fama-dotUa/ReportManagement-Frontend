// src/hooks/usePositionPurchaseStatus.ts
import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { useTrainingRequests } from './useTrainingRequests'

export type PositionPurchaseStatus =
	| 'owned'
	| 'pending'
	| 'canBuy'
	| 'insufficientFunds'

export function usePositionPurchaseStatus() {
	const { user } = useAuth()
	const userId = user?.id

	const { data: requests, isLoading, error } = useTrainingRequests()

	const myRequests = useMemo(() => {
		if (!userId) return []

		const list = requests ?? []
		return list.filter((r: any) => {
			const applicantId = r?.applicant?.id

			return String(applicantId) === String(userId)
		})
	}, [requests, userId])

	const pendingPositionIds = useMemo(() => {
		const PENDING_STATUSES = new Set([
			'обучается',
			'рассматривается',
			'халтура начальства',
		])
		return new Set<number>(
			myRequests
				.filter((r: any) => PENDING_STATUSES.has(String(r?.status_request)))
				.map((r: any) => Number(r?.position?.id))
				.filter((id: any) => Number.isFinite(id))
		)
	}, [myRequests])

	const ownedPositionIds = useMemo(() => {
		const DONE_STATUSES = new Set(['обучен'])
		return new Set<number>(
			myRequests
				.filter((r: any) => DONE_STATUSES.has(String(r?.status_request)))
				.map((r: any) => Number(r?.position?.id))
				.filter((id: any) => Number.isFinite(id))
		)
	}, [myRequests])

	const userCR = Number(user?.CR ?? user?.CR ?? 0)

	const getPositionStatus = (
		positionId: number,
		price: number
	): PositionPurchaseStatus => {
		if (ownedPositionIds.has(positionId)) return 'owned'
		if (pendingPositionIds.has(positionId)) return 'pending'
		if (userCR < Number(price)) return 'insufficientFunds'
		return 'canBuy'
	}

	return {
		getPositionStatus,
		ownedPositionIds,
		pendingPositionIds,
		isLoading,
		error,
	}
}
