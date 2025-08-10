import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { ShopHeader } from './ShopHeader'
import { ShopItemCard, type ShopItem } from './ShopItemCard'
import { FeaturedCosmeticsSection } from './FeaturedCosmeticsSection'

import { useAuth } from '../../hooks/useAuth'
import {
	useGroupedPositions,
	type PositionItem,
} from '../../hooks/useGroupedPositions'

import './Store.css'

export const Store: React.FC = () => {
	const { groupedData, loading, error } = useGroupedPositions()
	const { CR } = useAuth()
	const navigate = useNavigate()

	const allPositions = useMemo(() => {
		if (!groupedData) return []
		return Object.values(groupedData).flat()
	}, [groupedData])

	const featuredPositions = allPositions.slice(0, 5)

	const handleBuyItem = (id: number) => {
		const item = allPositions.find(p => p.id === id)
		if (item) {
			alert(`Попытка покупки "${item.name}" за ${item.CR} CR`)
		}
	}

	if (loading) {
		return <div className='store-loading'>Загрузка данных...</div>
	}

	if (error) {
		return (
			<div className='store-error'>Ошибка загрузки данных: {error.message}</div>
		)
	}

	return (
		<>
			<div className='blur-background'></div>
			<div className='shop-container'>
				<ShopHeader title='Военный Магазин' balance={CR} />

				<main className='main-content'>
					<section className='sectionstore section-positions'>
						<h2>Должности и Обучение</h2>
						<div className='cards-grid-shop positions-grid'>
							{featuredPositions.map((item: PositionItem) => {
								const cardItem: ShopItem = {
									id: item.id,
									title: item.name,
									description: item.description,
									price: item.CR,
								}
								return (
									<ShopItemCard
										key={item.id}
										item={cardItem}
										onBuy={handleBuyItem}
									/>
								)
							})}
							<button
								className='button card hover-blue'
								onClick={() => navigate('/specialists')}
							>
								<h3>Больше...</h3>
							</button>
						</div>
					</section>

					<FeaturedCosmeticsSection />
				</main>
			</div>
		</>
	)
}
