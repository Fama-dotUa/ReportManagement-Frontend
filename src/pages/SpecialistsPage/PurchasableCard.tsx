// src/components/PurchasableCard/PurchasableCard.tsx
import React from 'react'

// Общий тип для любого покупаемого предмета
export interface Item {
	id: number | string
	title: string
	description: React.ReactNode
	price: number
}

export type HoverColor = 'sky' | 'orange' | 'emerald' | 'blue' | 'purple'

interface PurchasableCardProps {
	item: Item
	onBuy: (id: Item['id']) => void
	hoverColor?: HoverColor
}

export const PurchasableCard: React.FC<PurchasableCardProps> = ({
	item,
	onBuy,
	hoverColor = 'blue',
}) => {
	// Динамически формируем классы для карточки
	const cardClassName = `purchasable-card hover-${hoverColor}`

	return (
		<div className={cardClassName}>
			<h3>{item.title}</h3>
			<p>{item.description}</p>
			<div className='card-footer'>
				<span>{item.price} CR</span>
				<button className='buy-button' onClick={() => onBuy(item.id)}>
					Купить
				</button>
			</div>
		</div>
	)
}
