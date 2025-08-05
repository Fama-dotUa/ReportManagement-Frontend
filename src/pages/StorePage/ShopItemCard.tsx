// src/components/ShopItemCard/ShopItemCard.tsx
import React from 'react'

export interface ShopItem {
	id: number
	title: string
	description: React.ReactNode
	price: number
}

interface ShopItemCardProps {
	item: ShopItem
	onBuy: (id: number) => void
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, onBuy }) => {
	return (
		<div className='card hover-blue'>
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
