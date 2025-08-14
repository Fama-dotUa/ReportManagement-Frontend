import React, { useRef } from 'react'
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md'

interface CosmeticItem {
	id: number
	name: string
	image?: { url: string; ext: string }
}

interface Props {
	title: string
	items: CosmeticItem[]
	selectedItemId: number | null
	onSelectItem: (id: number | null) => void
	itemClassName: string
}

const API_URL = import.meta.env.VITE_API_URL

export const CosmeticRow: React.FC<Props> = ({
	title,
	items,
	selectedItemId,
	onSelectItem,
	itemClassName, // ✅ Получаем новый пропс
}) => {
	const scrollRef = useRef<HTMLDivElement>(null)

	const handleScroll = (direction: 'left' | 'right') => {
		if (scrollRef.current) {
			const scrollAmount = direction === 'left' ? -300 : 300
			scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
		}
	}

	return (
		<div className='cosmetic-row'>
			<div className='cosmetic-row-header'>
				<h3>{title}</h3>
			</div>
			<div style={{ position: 'relative' }}>
				<div className='scroll-buttons'>
					<button
						className='scroll-button left'
						onClick={() => handleScroll('left')}
						aria-label='Scroll left'
					>
						<MdArrowBackIos className='scroll-button-icon left' />
					</button>
					<button
						className='scroll-button right'
						onClick={() => handleScroll('right')}
						aria-label='Scroll right'
					>
						<MdArrowForwardIos className='scroll-button-icon right' />
					</button>
				</div>
				<div className='items-container' ref={scrollRef}>
					{items.map(item => {
						const isCurrentlySelected = selectedItemId === item.id

						const finalClassName = `
						cosmetic-item-preview 
						${itemClassName} 
						${isCurrentlySelected ? 'active' : ''}
					`

						return (
							<div
								key={item.id}
								className={finalClassName.trim()}
								onClick={() =>
									onSelectItem(isCurrentlySelected ? null : item.id)
								}
							>
								{(() => {
									const IMAGE_EXTENSIONS = [
										'.jpg',
										'.jpeg',
										'.png',
										'.gif',
										'.webp',
										'.svg',
									]
									const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov']

									const media = item.image
									if (!media || !media.url || !media.ext) {
										return null
									}

									const fullSrc = API_URL + media.url
									const extension = media.ext.toLowerCase()

									if (IMAGE_EXTENSIONS.includes(extension)) {
										return (
											<img
												src={
													item.image?.url
														? fullSrc
														: 'https://placehold.co/120x120/cccccc/ffffff?text=N/A'
												}
												alt={item.name}
												loading='lazy'
											/>
										)
									}

									if (VIDEO_EXTENSIONS.includes(extension)) {
										return (
											<video src={fullSrc} autoPlay loop muted playsInline />
										)
									}

									// Если формат не подошел, ничего не показываем
									return null
								})()}
								<div className='item-name-overlay'>{item.name}</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
