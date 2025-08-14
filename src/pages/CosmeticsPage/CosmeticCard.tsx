import React from 'react'

export type HoverColor = 'green' | 'blue' | 'red'

interface BaseCosmeticItem {
	id: string
	title: string
	description: string
	price: number
	canBuy: boolean
}

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
		ext?: string
	}
}

export interface ChevronBgItem extends BaseCosmeticItem {
	type: 'chevron-bg'
	preview: {
		imageUrl: string
	}
}

export type CosmeticItem = FrameItem | ProfileBgItem | ChevronBgItem

interface CosmeticCardProps {
	item: CosmeticItem
	onBuy: (id: CosmeticItem) => void
	hoverColor: HoverColor
	userCR: number
}

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
						loading='lazy'
					/>
				)
			case 'profile-bg':
				return (() => {
					const IMAGE_EXTENSIONS = [
						'.jpg',
						'.jpeg',
						'.png',
						'.gif',
						'.webp',
						'.svg',
					]
					const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov']

					const media = item.preview

					if (!media || !media.imageUrl || !media.ext) {
						return null
					}

					const fullSrc = media.imageUrl
					const extension = media.ext.toLowerCase()

					if (IMAGE_EXTENSIONS.includes(extension)) {
						return (
							<img
								src={fullSrc}
								alt={item.title}
								className='profile-bg-preview'
								loading='lazy'
							/>
						)
					}

					if (VIDEO_EXTENSIONS.includes(extension)) {
						return (
							<video
								src={fullSrc}
								className='profile-bg-preview'
								autoPlay
								loop
								muted
								playsInline
							/>
						)
					}
					return null
				})()
			case 'chevron-bg':
				return (
					<img
						src={item.preview.imageUrl}
						alt={item.title}
						className='chevron-bg-preview'
						loading='lazy'
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
