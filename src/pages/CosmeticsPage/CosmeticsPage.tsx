// src/components/CosmeticsPage/CosmeticsPage.tsx
import React from 'react'
import { PageHeader } from '../SpecialistsPage/PageHeader'
import { ContentSection } from '../SpecialistsPage/ContentSection'
import {
	CosmeticCard,
	type CosmeticItem,
	type HoverColor,
} from './CosmeticCard'
import { useAllCosmetics } from '../../hooks/useAllCosmetics'
import './CosmeticsPage.css'
import { useAuth } from '../../hooks/useAuth'

export const CosmeticsPage: React.FC = () => {
	const { user, CR, token } = useAuth()

	const { allCosmetics, loading, error } = useAllCosmetics(user)

	const API_URL = import.meta.env.VITE_API_URL

	const handleBuy = async (item: CosmeticItem) => {
		if (!user) {
			alert('Пользователь не найден!')
			return
		}

		if ((user.CR || 0) < item.price) {
			alert('Недостаточно средств для покупки!')
			return
		}

		const isConfirmed = window.confirm(
			`Купить "${item.title}" за ${item.price} CR?`
		)

		if (!isConfirmed) return

		try {
			let relationField = ''
			let currentOwnedIds: number[] = []

			switch (item.type) {
				case 'frame':
					relationField = 'framesfor_avatars_all'
					currentOwnedIds =
						user.framesfor_avatars_all?.map((i: { id: any }) => i.id) || []
					break
				case 'profile-bg':
					relationField = 'profile_backgrounds_all'
					currentOwnedIds =
						user.profile_backgrounds_all?.map((i: { id: any }) => i.id) || []
					break
				case 'chevron-bg':
					relationField = 'fon_schildiks_all'
					currentOwnedIds =
						user.fon_schildiks_all?.map((i: { id: any }) => i.id) || []
					break
				default:
					throw new Error('Неизвестный тип предмета')
			}

			const payload = {
				CR: (user.CR || 0) - item.price,
				[relationField]: [...currentOwnedIds, parseInt(item.id, 10)],
			}

			const response = await fetch(`${API_URL}/api/users/${user.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			})

			const updatedUser = await response.json()

			if (!response.ok) {
				throw new Error(updatedUser.error?.message || 'Ошибка при покупке.')
			}
			alert('Покупка совершена успешно!')
		} catch (err: any) {
			console.error('Ошибка покупки:', err)
			alert(`Ошибка: ${err.message}`)
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

	return (
		<>
			<div className='blur-background'></div>
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
									userCR={CR}
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
									userCR={CR}
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
									userCR={CR}
								/>
							))}
						</div>
					</ContentSection>
				</main>
			</div>
		</>
	)
}
