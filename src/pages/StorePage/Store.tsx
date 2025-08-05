import React from 'react'
import { ShopHeader } from './ShopHeader'
import { ShopItemCard } from './ShopItemCard'
import type { ShopItem } from './ShopItemCard'
import { CosmeticsLinkSection } from './CosmeticsLinkSection'
import { ProfilePreview } from './ProfilePreview'
import './Store.css'
import { useNavigate } from 'react-router-dom'

// Данные лучше получать через API, но для примера определим их здесь
const positionItems: ShopItem[] = [
	{
		id: 1,
		title: 'Командир Отделения',
		description:
			'Получите необходимые навыки для эффективного командования малым подразделением. Включает курсы тактики и управления.',
		price: 500,
	},
	{
		id: 2,
		title: 'Специалист по Связи',
		description:
			'Обучение работе с современными системами связи, кодированию и дешифрованию сообщений.',
		price: 750,
	},
	{
		id: 3,
		title: 'Медик Полевой',
		description:
			'Курс первой помощи в боевых условиях, эвакуации раненых и стабилизации состояния.',
		price: 600,
	},
]

const userProfileData = {
	name: 'Имя Пользователя',
	rank: 'Рядовой',
	avatarUrl: 'https://placehold.co/120x120/38a169/ffffff?text=Аватар',
	frameUrl: 'https://placehold.co/128x128/2f4f4f/ffffff?text=Рамка',
	backgroundUrl:
		'https://placehold.co/400x100/4a5568/ffffff?text=Ваш+Фон+Профиля',
	chevronText: 'Ваш Шеврон',
}
export const Store: React.FC = () => {
	// В реальном приложении баланс будет в состоянии (useState) или в глобальном сторе
	const userBalance = 1250
	const navigate = useNavigate()

	const handleBuyItem = (id: number) => {
		const item = positionItems.find(p => p.id === id)
		alert(`Попытка покупки "${item?.title}" за ${item?.price} CR`)
		// Здесь будет логика покупки: проверка баланса, отправка запроса на сервер и т.д.
	}
	return (
		<div className='shop-container'>
			<ShopHeader title='Военный Магазин' balance={userBalance} />

			<main className='main-content'>
				<section className='section section-positions'>
					<h2>Должности и Обучение</h2>
					<div className='cards-grid positions-grid'>
						{positionItems.map(item => (
							<ShopItemCard key={item.id} item={item} onBuy={handleBuyItem} />
						))}
					</div>
					<button onClick={() => navigate('/specialists')}>...</button>
				</section>

				<CosmeticsLinkSection />
			</main>

			<ProfilePreview user={userProfileData} />
		</div>
	)
}
