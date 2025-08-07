import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
	useRandomCosmetics,
	type CosmeticItem,
} from '../../hooks/useRandomCosmetics'

// Компонент для отображения одной карточки превью
const PreviewCard: React.FC<{ item: CosmeticItem }> = ({ item }) => (
	<div className='cosmetic-preview-item'>
		<img src={item.imageUrl} alt={item.name} />
		<h3>{item.name}</h3>
		<p>{item.description}</p>
		<span className='preview-price'>{item.price} CR</span>
	</div>
)

export const FeaturedCosmeticsSection: React.FC = () => {
	const { randomCosmetics, loading, error } = useRandomCosmetics()
	const navigate = useNavigate()

	const renderContent = () => {
		if (loading) {
			return <p>Загрузка случайной косметики...</p>
		}

		if (error) {
			return <p>Не удалось загрузить косметику: {error.message}</p>
		}

		// Собираем существующие предметы в массив для удобного рендеринга
		const itemsToDisplay = Object.values(randomCosmetics).filter(
			item => item !== null
		) as CosmeticItem[]

		if (itemsToDisplay.length === 0) {
			return <p>Косметические предметы не найдены.</p>
		}

		return (
			<div className='cosmetic-previews-container'>
				{itemsToDisplay.map(item => (
					<PreviewCard key={item.id} item={item} />
				))}
			</div>
		)
	}

	return (
		<section className='sectionstore section-cosmetics-link'>
			<h2>Случайная косметика</h2>
			{renderContent()}
			<button
				className='see-more-button'
				onClick={() => navigate('/cosmetics')}
			>
				Перейти в раздел косметики
			</button>
		</section>
	)
}
