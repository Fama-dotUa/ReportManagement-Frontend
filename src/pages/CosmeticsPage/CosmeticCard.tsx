// src/components/CosmeticCard/CosmeticCard.tsx
import React from 'react'

// --- Определяем типы данных для разных видов косметики ---

export type HoverColor = 'green' | 'blue' | 'red'

// Базовый тип
interface BaseCosmeticItem {
	id: string
	title: string
	description: string
	price: number
}

// Типы для каждого вида превью
interface FrameItem extends BaseCosmeticItem {
	type: 'frame'
	preview: {
		imageUrl: string
		style: 'default' | 'metal' | 'gold'
	}
}

interface ProfileBgItem extends BaseCosmeticItem {
	type: 'profile-bg'
	preview: {
		imageUrl: string
	}
}

interface ChevronBgItem extends BaseCosmeticItem {
	type: 'chevron-bg'
	preview: {
		style: 'tricolor' | 'khaki' | 'digital'
		text: string
	}
}

// Объединяем все в один тип
export type CosmeticItem = FrameItem | ProfileBgItem | ChevronBgItem

// --- Пропсы компонента ---

interface CosmeticCardProps {
	item: CosmeticItem
	onBuy: (id: string) => void
	hoverColor: HoverColor
}

// --- Сам компонент ---

export const CosmeticCard: React.FC<CosmeticCardProps> = ({
	item,
	onBuy,
	hoverColor,
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
					<div className={`chevron-bg-preview ${item.preview.style}`}>
						{item.preview.text}
					</div>
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
				<button className='buy-button' onClick={() => onBuy(item.id)}>
					Купить
				</button>
			</div>
		</div>
	)
}
