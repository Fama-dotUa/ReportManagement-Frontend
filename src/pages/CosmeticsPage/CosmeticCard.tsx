import React from 'react'
import { RiShoppingBasketFill } from 'react-icons/ri'
import { FaEye } from 'react-icons/fa6'
export type HoverColor = 'green' | 'blue' | 'red'

// Базовый тип
interface BaseCosmeticItem {
	id: string
	title: string
	description: string
	price: number
	canBuy: boolean
}

// Типы для каждого вида превью
export interface FrameItem extends BaseCosmeticItem {
	type: 'frame'
	preview: {
		imageUrl: string
		style: 'default' | 'metal' | 'gold'
	}
}

export interface ProfileBgItem extends BaseCosmeticItem {
	type: 'profile-bg'
	preview: {
		imageUrl: string
	}
}

export interface ChevronBgItem extends BaseCosmeticItem {
	type: 'chevron-bg'
	preview: {
		imageUrl: string
	}
}

// Объединяем все в один тип
export type CosmeticItem = FrameItem | ProfileBgItem | ChevronBgItem

// --- Пропсы компонента ---

interface CosmeticCardProps {
	item: CosmeticItem
	onBuy: (id: CosmeticItem) => void
	hoverColor: HoverColor
	userCR: number
}

// --- Сам компонент ---

export const CosmeticCard: React.FC<CosmeticCardProps> = ({
	item,
	onBuy,
	hoverColor,
	userCR,
}) => {
	const renderPreview = () => {
		switch (item.type) {
			case 'frame':
				return (
					<img
						src={item.preview.imageUrl}
						alt={item.title}
						className={`frame-preview ${item.preview.style}`}
					/>
				)
			case 'profile-bg':
				return (
					<img
						src={item.preview.imageUrl}
						alt={item.title}
						className='profile-bg-preview'
					/>
				)
			case 'chevron-bg':
				return (
					<img
						src={item.preview.imageUrl}
						alt={item.title}
						className='chevron-bg-preview'
					/>
				)
			default:
				return null
		}
	}

	return (
		<div className={`cosmetic-card hover-${hoverColor}`}>
			<h3>{item.title}</h3>
			{renderPreview()}
			<p>{item.description}</p>
			<div className='cosmetic-card-footer'>
				<span>{item.price} CR</span>

				{item.canBuy ? (
					<button
						className='buy-button'
						onClick={() => onBuy(item)}
						disabled={item.price > Number(userCR)}
					>
						Купить
					</button>
				) : (
					<span className='owned-badge'>В коллекции</span>
				)}
			</div>
		</div>
	)
}
