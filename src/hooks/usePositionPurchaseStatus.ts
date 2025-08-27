// src/hooks/usePositionPurchaseStatus.ts
import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { useTrainingRequests } from './useTrainingRequests' // твой готовый хук
// status_request предполагаем: 'pending' | 'approved' | 'rejected'
// Если у тебя другие значения — подставь свои.

export type PositionPurchaseStatus =
	| 'owned'
	| 'pending'
	| 'canBuy'
	| 'insufficientFunds'

export function usePositionPurchaseStatus() {
	const { user } = useAuth()
	const userId = user?.id
	const userCR = Number(user?.CR || 0)

	// получаем список заявок пользователя
	const { data: requests = [] } = useTrainingRequests()

	const ownedPositionIds = useMemo(() => {
		// позиции, которые уже есть у пользователя (или аналогично — прошёл обучение)
		const positions = user?.positions || []
		return new Set<number>(positions.map((p: any) => Number(p.id)))
	}, [user])

	const pendingPositionIds = useMemo(() => {
		const set = new Set<number>()
		for (const r of requests) {
			if (
				['обучается', 'рассматривается', 'халтура начальства'].includes(
					String(r?.status_request).toLowerCase()
				) &&
				r?.position?.id
			) {
				set.add(Number(r.position.id))
			}
		}
		return set
	}, [requests])

	// функция-оценщик
	const getPositionStatus = (
		positionId: number,
		price: number
	): PositionPurchaseStatus => {
		if (ownedPositionIds.has(positionId)) return 'owned'
		if (pendingPositionIds.has(positionId)) return 'pending'
		if (userCR < Number(price)) return 'insufficientFunds'
		return 'canBuy'
	}

	return { getPositionStatus, ownedPositionIds, pendingPositionIds }
}
