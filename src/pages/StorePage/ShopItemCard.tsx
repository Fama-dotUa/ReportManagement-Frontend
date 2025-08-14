// src/components/ShopItemCard/ShopItemCard.tsx
import React from 'react'

export interface ShopItem {
	id: number
	title: string
	description: React.ReactNode
	price: number
}

// 1. Добавляем 'status' в props
interface ShopItemCardProps {
	item: ShopItem
	onBuy: (id: number) => void
	status: 'owned' | 'canBuy' | 'insufficientFunds'
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
	item,
	onBuy,
	status,
}) => {
	// 2. Добавляем логику для определения состояния кнопки
	const getButtonState = () => {
		switch (status) {
			case 'owned':
				return { text: 'Обучен', disabled: true }
			case 'insufficientFunds':
				return { text: 'Нищий', disabled: true }
			case 'canBuy':
			default:
				return { text: 'Купить', disabled: false }
		}
	}

	const { text, disabled } = getButtonState()

	return (
		<div className='card hover-blue'>
			<h3>{item.title}</h3>
			<p>{item.description}</p>
			<div className='card-footer'>
				<span>{item.price} CR</span>
				{/* 3. Используем динамические значения для кнопки */}
				<button
					className='buy-button'
					onClick={() => onBuy(item.id)}
					disabled={disabled}
				>
					{text}
				</button>
			</div>
		</div>
	)
}
