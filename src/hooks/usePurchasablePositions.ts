import { useMemo } from 'react'
import { useGroupedPositions, type PositionItem } from './useGroupedPositions'
import { useAuth } from './useAuth'

export type PurchasablePositionItem = PositionItem & {
	purchaseStatus: 'owned' | 'canBuy' | 'insufficientFunds'
}

export const usePurchasablePositions = () => {
	const { data: groupedPositions, ...rest } = useGroupedPositions()
	const { user } = useAuth()

	const purchasableData = useMemo(() => {
		if (!groupedPositions || !user) return {}

		const userPositionIds = new Set(
			user.positions?.map((p: { id: any }) => p.id)
		)

		return Object.entries(groupedPositions).reduce((acc, [type, positions]) => {
			acc[type] = positions.map(position => {
				let purchaseStatus: PurchasablePositionItem['purchaseStatus'] = 'canBuy'

				if (userPositionIds.has(position.id)) {
					purchaseStatus = 'owned'
				} else if (user.CR < position.CR) {
					purchaseStatus = 'insufficientFunds'
				}

				return { ...position, purchaseStatus }
			})
			return acc
		}, {} as { [key: string]: PurchasablePositionItem[] })
	}, [groupedPositions, user])

	return { purchasableData, ...rest }
}
