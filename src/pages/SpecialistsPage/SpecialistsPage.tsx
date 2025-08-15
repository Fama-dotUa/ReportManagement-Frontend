import React, { useMemo } from 'react'
import { PageHeader } from './PageHeader'
import { ContentSection } from './ContentSection'
import { PurchasableCard, type Item } from './PurchasableCard'
import {
	usePurchasablePositions,
	type PurchasablePositionItem,
} from '../../hooks/usePurchasablePositions'

import './SpecialistsPage.css'
import type { HoverColor } from './PurchasableCard'
import { useAuth } from '../../hooks/useAuth'

import { usePurchasePosition } from '../../hooks/usePurchasePosition'
import { useUpdateUser } from '../../hooks/useUpdateUser'

const themeMap: Record<string, HoverColor> = {
	'Воздушная Техника': 'sky',
	'Наземная Техника': 'orange',
	'Пехота и Специалисты': 'emerald',
}

export const SpecialistsPage: React.FC = () => {
	const { purchasableData, error } = usePurchasablePositions()
	const { user } = useAuth()

	const { mutate: purchasePosition } = usePurchasePosition()
	const { updateUser } = useUpdateUser(user?.id)

	const allPositions = useMemo(() => {
		if (!purchasableData) return []
		return Object.values(purchasableData).flat()
	}, [purchasableData])

	const handleBuyItem = async (id: string | number) => {
		const numericId = typeof id === 'string' ? Number(id) : id
		const item = allPositions.find(p => p.id === numericId)
		if (!item || !user) return

		if (
			!window.confirm(
				`Вы уверены, что хотите купить "${item.name}" за ${item.CR} CR?`
			)
		) {
			return
		}

		try {
			const newBalance = user.CR - item.CR
			await updateUser({ id: user.id, CR: newBalance })

			purchasePosition({ applicantId: user.id, positionId: item.id })

			alert('Покупка успешна! Заявка отправлена на рассмотрение.')
		} catch (err) {
			console.error('Ошибка при покупке:', err)
		}
	}

	if (error) {
		return (
			<div className='shop-container'>
				<h2>Ошибка: {error.message}</h2>
			</div>
		)
	}

	return (
		<>
			<div className='blur-background'></div>
			<div className='shop-container'>
				<PageHeader title='Должности и Обучение' />

				{/* 3. ИСПРАВЛЕНИЕ: Итерируемся по purchasableData, а не groupedData */}
				{Object.entries(purchasableData || {}).map(([sectionTitle, items]) => {
					const theme = themeMap[sectionTitle] || 'sky'

					return (
						<ContentSection
							key={sectionTitle}
							title={sectionTitle}
							theme={theme}
						>
							{items.map((item: PurchasablePositionItem) => {
								const cardItem: Item = {
									id: item.id,
									title: item.name,
									description: item.description,
									price: item.CR,
								}
								return (
									<PurchasableCard
										key={item.id}
										item={cardItem}
										onBuy={handleBuyItem}
										hoverColor={theme}
										// Теперь item содержит purchaseStatus, и ошибки не будет
										status={item.purchaseStatus}
									/>
								)
							})}
						</ContentSection>
					)
				})}
			</div>
		</>
	)
}
