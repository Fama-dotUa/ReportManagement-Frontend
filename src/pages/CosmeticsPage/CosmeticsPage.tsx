// src/components/CosmeticsPage/CosmeticsPage.tsx
import React from 'react'
import { PageHeader } from '../SpecialistsPage/PageHeader'
import { ContentSection } from '../SpecialistsPage/ContentSection'
import { CosmeticCard, type HoverColor } from './CosmeticCard'
import { useAllCosmetics } from '../../hooks/useAllCosmetics' // ✅ Импортируем наш новый хук
import './CosmeticsPage.css'

export const CosmeticsPage: React.FC = () => {
	const { allCosmetics, loading, error } = useAllCosmetics()

	const handleBuy = (id: string) => {
		const allItems = [
			...allCosmetics.frames,
			...allCosmetics.backgrounds,
			...allCosmetics.schildiks,
		]
		const item = allItems.find(i => i.id.toString() === id)
		if (item) {
			alert(`Покупка: ${item.title} за ${item.price} CR`)
		}
	}

	if (loading) {
		return (
			<div className='shop-container'>
				<h2>Загрузка косметики...</h2>
			</div>
		)
	}

	if (error) {
		return (
			<div className='shop-container'>
				<h2>Ошибка загрузки: {error.message}</h2>
			</div>
		)
	}

	// ✅ Рендерим компонент с данными из хука
	return (
		<div className='shop-container'>
			<PageHeader title='Магазин Косметики' />

			<main className='main-content'>
				<ContentSection title='Рамки на Аватарку' theme='green'>
					<div className='cards-grid frames-grid'>
						{allCosmetics.frames.map(item => (
							<CosmeticCard
								key={item.id}
								item={item}
								onBuy={handleBuy}
								hoverColor={'green' as HoverColor}
							/>
						))}
					</div>
				</ContentSection>

				<ContentSection title='Фон Профиля' theme='blue'>
					<div className='cards-grid profile-backgrounds-grid'>
						{allCosmetics.backgrounds.map(item => (
							<CosmeticCard
								key={item.id}
								item={item}
								onBuy={handleBuy}
								hoverColor={'blue' as HoverColor}
							/>
						))}
					</div>
				</ContentSection>

				<ContentSection title='Фон Шильдика' theme='red'>
					<div className='cards-grid chevron-backgrounds-grid'>
						{allCosmetics.schildiks.map(item => (
							<CosmeticCard
								key={item.id}
								item={item}
								onBuy={handleBuy}
								hoverColor={'red' as HoverColor}
							/>
						))}
					</div>
				</ContentSection>
			</main>
		</div>
	)
}
