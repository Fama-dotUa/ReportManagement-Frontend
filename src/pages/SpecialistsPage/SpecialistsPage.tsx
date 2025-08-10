import React, { useMemo } from 'react'
import { PageHeader } from './PageHeader'
import { ContentSection } from './ContentSection'
import { PurchasableCard, type Item } from './PurchasableCard'
import {
	useGroupedPositions,
	type PositionItem,
} from '../../hooks/useGroupedPositions'
import './SpecialistsPage.css'

import type { HoverColor } from './PurchasableCard'

const themeMap: Record<string, HoverColor> = {
	'Воздушная Техника': 'sky',
	'Наземная Техника': 'orange',
	'Пехота и Специалисты': 'emerald',
}

export const SpecialistsPage: React.FC = () => {
	const { groupedData, loading, error } = useGroupedPositions()

	const allItems = useMemo(() => {
		return Object.values(groupedData).flat()
	}, [groupedData])

	const handleBuy = (id: Item['id']) => {
		const item = allItems.find(i => i.id === id)
		if (item) {
			alert(`Покупка: ${item.name} за ${item.CR} CR`)
		}
	}

	if (loading) {
		return (
			<div className='shop-container'>
				<h2>Загрузка специальностей...</h2>
			</div>
		)
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
				{Object.entries(groupedData).map(([sectionTitle, items]) => {
					const theme = themeMap[sectionTitle] || 'sky'

					return (
						<ContentSection
							key={sectionTitle}
							title={sectionTitle}
							theme={theme}
						>
							{items.map((item: PositionItem) => {
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
