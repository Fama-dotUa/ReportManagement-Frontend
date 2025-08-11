import React, { useRef } from 'react'
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md'

interface CosmeticItem {
	id: number
	name: string
	image?: { url: string }
}

interface Props {
	title: string
	items: CosmeticItem[]
	selectedItemId: number | null
	onSelectItem: (id: number | null) => void // Разрешаем передавать null, чтобы можно было снять выбор
	itemClassName: string // ✅ Новый пропс для уникального класса
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
								// Позволяем снять выбор повторным кликом
								onClick={() =>
									onSelectItem(isCurrentlySelected ? null : item.id)
								}
							>
								<img
									src={
										item.image?.url
											? `${API_URL}${item.image.url}`
											: 'https://placehold.co/120x120/cccccc/ffffff?text=N/A'
									}
									alt={item.name}
								/>
								<div className='item-name-overlay'>{item.name}</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
