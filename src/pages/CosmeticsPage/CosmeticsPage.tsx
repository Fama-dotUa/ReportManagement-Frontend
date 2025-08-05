// src/components/CosmeticsPage/CosmeticsPage.tsx
import React from 'react'
import { PageHeader } from '../SpecialistsPage/PageHeader'
import {
	ContentSection,
	type SectionTheme,
} from '../SpecialistsPage/ContentSection'
import {
	CosmeticCard,
	type CosmeticItem,
	type HoverColor,
} from './CosmeticCard'
import './CosmeticsPage.css'

// Моковые данные, имитирующие ответ от API
const cosmeticsData: {
	frames: {
		theme: SectionTheme
		items: CosmeticItem[]
	}
	profileBgs: {
		theme: SectionTheme
		items: CosmeticItem[]
	}
	chevronBgs: {
		theme: SectionTheme
		items: CosmeticItem[]
	}
} = {
	frames: {
		theme: 'sky',
		items: [
			{
				id: 'frame_camo',
				type: 'frame' as const,
				title: 'Рамка "Камуфляж"',
				description: 'Добавьте камуфляжную рамку к своей аватарке для стиля.',
				price: 100,
				preview: {
					imageUrl: 'https://placehold.co/150x150/2f4f4f/ffffff?text=Рамка',
					style: 'default',
				},
			},
			{
				id: 'frame_metal',
				type: 'frame' as const,
				title: 'Рамка "Металл"',
				description: 'Прочная металлическая рамка для вашего профиля.',
				price: 120,
				preview: {
					imageUrl: 'https://placehold.co/150x150/5a5a5a/ffffff?text=Рамка',
					style: 'metal',
				},
			},
			{
				id: 'frame_gold',
				type: 'frame' as const,
				title: 'Рамка "Золотая"',
				description: 'Эксклюзивная золотая рамка для самых почётных.',
				price: 250,
				preview: {
					imageUrl: 'https://placehold.co/150x150/d4af37/ffffff?text=Рамка',
					style: 'gold',
				},
			},
		],
	},
	profileBgs: {
		theme: 'orange',
		items: [
			{
				id: 'bg_battlefield',
				type: 'profile-bg' as const,
				title: 'Фон "Поле Боя"',
				description: 'Эпический фон профиля с изображением поля боя на закате.',
				price: 200,
				preview: {
					imageUrl:
						'https://placehold.co/200x100/4a5568/ffffff?text=Фон+Профиля',
				},
			},
			{
				id: 'bg_hq',
				type: 'profile-bg' as const,
				title: 'Фон "Штаб"',
				description: 'Строгий фон, имитирующий интерьер штаба.',
				price: 180,
				preview: {
					imageUrl: 'https://placehold.co/200x100/333333/ffffff?text=Фон+Штаб',
				},
			},
			{
				id: 'bg_forest',
				type: 'profile-bg' as const,
				title: 'Фон "Лес"',
				description: 'Маскировочный фон с густым лесом.',
				price: 160,
				preview: {
					imageUrl: 'https://placehold.co/200x100/228B22/ffffff?text=Фон+Лес',
				},
			},
		],
	},
	chevronBgs: {
		theme: 'emerald',
		items: [
			{
				id: 'chevron_tricolor',
				type: 'chevron-bg' as const,
				title: 'Фон "Триколор"',
				description:
					'Фон для вашего шеврона/шильдика в цветах национального флага.',
				price: 150,
				preview: { style: 'tricolor', text: 'Шеврон' },
			},
			{
				id: 'chevron_khaki',
				type: 'chevron-bg' as const,
				title: 'Фон "Хаки"',
				description: 'Классический фон цвета хаки для вашего шеврона.',
				price: 100,
				preview: { style: 'khaki', text: 'Шеврон' },
			},
			{
				id: 'chevron_digital',
				type: 'chevron-bg' as const,
				title: 'Фон "Цифровой"',
				description: 'Современный цифровой камуфляжный фон.',
				price: 130,
				preview: { style: 'digital', text: 'Шеврон' },
			},
		],
	},
}

export const CosmeticsPage: React.FC = () => {
	const handleBuy = (id: string) => {
		const allItems = [
			...cosmeticsData.frames.items,
			...cosmeticsData.profileBgs.items,
			...cosmeticsData.chevronBgs.items,
		]
		const item = allItems.find(i => i.id === id)
		if (item) {
			alert(`Покупка: ${item.title} за ${item.price} CR`)
		}
	}

	return (
		<div className='shop-container'>
			<PageHeader title='Магазин Косметики' />

			<main className='main-content'>
				<ContentSection
					title='Рамки на Аватарку'
					theme={cosmeticsData.frames.theme}
				>
					<div className='cards-grid frames-grid'>
						{cosmeticsData.frames.items.map(item => (
							<CosmeticCard
								key={item.id}
								item={item}
								onBuy={handleBuy}
								hoverColor={cosmeticsData.frames.theme as HoverColor}
							/>
						))}
					</div>
				</ContentSection>

				<ContentSection
					title='Фон Профиля'
					theme={cosmeticsData.profileBgs.theme}
				>
					<div className='cards-grid profile-backgrounds-grid'>
						{cosmeticsData.profileBgs.items.map(item => (
							<CosmeticCard
								key={item.id}
								item={item}
								onBuy={handleBuy}
								hoverColor={cosmeticsData.profileBgs.theme as HoverColor}
							/>
						))}
					</div>
				</ContentSection>

				<ContentSection
					title='Фон Шеврона/Шильдика'
					theme={cosmeticsData.chevronBgs.theme}
				>
					<div className='cards-grid chevron-backgrounds-grid'>
						{cosmeticsData.chevronBgs.items.map(item => (
							<CosmeticCard
								key={item.id}
								item={item}
								onBuy={handleBuy}
								hoverColor={cosmeticsData.chevronBgs.theme as HoverColor}
							/>
						))}
					</div>
				</ContentSection>
			</main>
		</div>
	)
}
