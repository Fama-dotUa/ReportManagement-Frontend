import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { ShopHeader } from './ShopHeader'
import { ShopItemCard, type ShopItem } from './ShopItemCard'
import { FeaturedCosmeticsSection } from './FeaturedCosmeticsSection'

import { useAuth } from '../../hooks/useAuth'
import {
	usePurchasablePositions,
	type PurchasablePositionItem,
} from '../../hooks/usePurchasablePositions'
import { usePurchasePosition } from '../../hooks/usePurchasePosition'
import { useUpdateUser } from '../../hooks/useUpdateUser'
import './Store.css'
import { usePositionPurchaseStatus } from '../../hooks/usePositionPurchaseStatus'
import { useQueryClient } from '@tanstack/react-query'

function Store() {
	const { purchasableData, error } = usePurchasablePositions()
	const { user, CR } = useAuth()
	const navigate = useNavigate()
	const { getPositionStatus } = usePositionPurchaseStatus()
	const { mutate: purchasePosition } = usePurchasePosition()
	const { updateUser } = useUpdateUser(user?.id)
	const qc = useQueryClient()
	const allPositions = useMemo(() => {
		if (!purchasableData) return []
		return Object.values(purchasableData).flat()
	}, [purchasableData])

	const featuredPositions = allPositions.slice(0, 5)

	const handleBuyItem = async (id: number) => {
		const item = allPositions.find(p => p.id === id)
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

			purchasePosition({ applicantId: user.id, positionId: item.id }),
				{
					onSuccess: () => {
						qc.invalidateQueries({ queryKey: ['trainingRequests', user.id] })

						alert('Покупка успешна! Заявка отправлена на рассмотрение.')
					},
				}

			alert('Покупка успешна! Заявка отправлена на рассмотрение.')
		} catch (err) {
			console.error('Ошибка при покупке:', err)
		}
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
							{featuredPositions.map((item: PurchasablePositionItem) => {
								const cardItem: ShopItem = {
									id: item.id,
									title: item.name,
									description: item.description,
									price: item.CR,
								}
								const status = getPositionStatus(item.id, item.CR)
								return (
									<ShopItemCard
										key={item.id}
										item={cardItem}
										onBuy={handleBuyItem}
										status={status}
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
export default Store
