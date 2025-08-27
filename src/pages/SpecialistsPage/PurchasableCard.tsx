import React from 'react'

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
	status: 'owned' | 'pending' | 'canBuy' | 'insufficientFunds' // + pending
}
export const PurchasableCard: React.FC<PurchasableCardProps> = ({
	item,
	onBuy,
	hoverColor = 'blue',
	status,
}) => {
	const cardClassName = `purchasable-card hover-${hoverColor}`

	const getButtonState = () => {
		switch (status) {
			case 'owned':
				return { text: 'Обучен', disabled: true }
			case 'pending':
				return { text: 'На обучении', disabled: true }
			case 'insufficientFunds':
				return { text: 'Нищий', disabled: true }
			case 'canBuy':
			default:
				return { text: 'Купить', disabled: false }
		}
	}
	const { text, disabled } = getButtonState()

	return (
		<div className={cardClassName}>
			<h3>{item.title}</h3>
			<p>{item.description}</p>
			<div className='card-footer'>
				<span>{item.price} CR</span>
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
