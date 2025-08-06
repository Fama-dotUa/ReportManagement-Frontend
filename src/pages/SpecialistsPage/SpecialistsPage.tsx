// src/components/SpecialistsPage/SpecialistsPage.tsx
import React from 'react'
import { PageHeader } from './PageHeader'
import { ContentSection } from './ContentSection'
import { PurchasableCard, type Item } from './PurchasableCard'
import './SpecialistsPage.css'

import type { SectionTheme } from './ContentSection'

// Данные для секций и должностей, извлеченные из HTML
const sectionsData: {
	title: string
	theme: SectionTheme
	items: Item[]
}[] = [
	{
		title: 'Воздушная Техника',
		theme: 'sky',
		items: [
			{
				id: 'heli_pilot',
				title: 'Пилот Вертолета',
				description:
					'Полный курс обучения управлению боевыми и транспортными вертолетами. Включает навигацию, воздушный бой и десантирование.',
				price: 2500,
			},
			{
				id: 'heli_copilot',
				title: 'Копилот Вертолета (Стрелок)',
				description:
					'Обучение работе с бортовым вооружением вертолета, целеуказанию и взаимодействию с пилотом.',
				price: 1800,
			},
			{
				id: 'uav_operator',
				title: 'Оператор БПЛА',
				description:
					'Курс по управлению разведывательными и ударными беспилотными летательными аппаратами.',
				price: 1500,
			},
		],
	},
	{
		title: 'Наземная Техника',
		theme: 'orange',
		items: [
			{
				id: 'tank_commander',
				title: 'Командир Танка',
				description:
					'Обучение тактике танкового боя, управлению экипажем и координации действий.',
				price: 2200,
			},
			{
				id: 'bmp_driver',
				title: 'Механик-Водитель БМП/БТР',
				description:
					'Курс вождения и обслуживания бронированной техники в различных условиях.',
				price: 1700,
			},
			{
				id: 'vehicle_gunner',
				title: 'Пулеметчик на Технике',
				description:
					'Обучение эффективному использованию крупнокалиберных пулеметов на бронетехнике.',
				price: 1400,
			},
		],
	},
	{
		title: 'Пехота и Специалисты',
		theme: 'emerald',
		items: [
			{
				id: 'sniper',
				title: 'Снайпер',
				description:
					'Глубокое обучение меткой стрельбе, маскировке, наблюдению и тактике снайперской пары.',
				price: 2000,
			},
			{
				id: 'antitank',
				title: 'Антитанк (Оператор ПТРК)',
				description:
					'Обучение использованию противотанковых ракетных комплексов и тактике борьбы с бронетехникой.',
				price: 1600,
			},
			{
				id: 'sapper',
				title: 'Сапер',
				description:
					'Курс по обнаружению, обезвреживанию и установке минно-взрывных заграждений.',
				price: 1900,
			},
		],
	},
]

export const SpecialistsPage: React.FC = () => {
	const handleBuy = (id: Item['id']) => {
		// Находим товар во всех секциях для получения информации о нем
		const allItems = sectionsData.flatMap(s => s.items)
		const item = allItems.find(i => i.id === id)
		if (item) {
			alert(`Покупка: ${item.title} за ${item.price} CR`)
		}
	}

	return (
		<div className='shop-container'>
			<PageHeader title='Должности и Обучение' />

			<main className='main-content'>
				{sectionsData.map(section => (
					<ContentSection
						key={section.title}
						title={section.title}
						theme={section.theme}
					>
						{section.items.map(item => (
							<PurchasableCard
								key={item.id}
								item={item}
								onBuy={handleBuy}
								hoverColor={section.theme}
							/>
						))}
					</ContentSection>
				))}
			</main>
		</div>
	)
}
