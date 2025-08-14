import React, { useMemo } from 'react'
import { PageHeader } from './PageHeader'
import { ContentSection } from './ContentSection'
import { PurchasableCard, type Item } from './PurchasableCard'
import {
	usePurchasablePositions,
	type PurchasablePositionItem,
} from '../../hooks/usePurchasablePositions' // <-- Импортируем только один нужный хук

import './SpecialistsPage.css'
import type { HoverColor } from './PurchasableCard'

const themeMap: Record<string, HoverColor> = {
	'Воздушная Техника': 'sky',
	'Наземная Техника': 'orange',
	'Пехота и Специалисты': 'emerald',
}

export const SpecialistsPage: React.FC = () => {
	const { purchasableData, error } = usePurchasablePositions()

	const allItems = useMemo(() => {
		if (!purchasableData) return []
		return Object.values(purchasableData).flat()
	}, [purchasableData])

	const handleBuy = (id: Item['id']) => {
		const item = allItems.find(i => i.id === id)
		if (item) {
			alert(`Покупка: ${item.name} за ${item.CR} CR`)
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
										onBuy={handleBuy}
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
