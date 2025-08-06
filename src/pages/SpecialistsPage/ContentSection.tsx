// src/components/ContentSection/ContentSection.tsx
import React, { useRef } from 'react'
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md'
interface ContentSectionProps {
	title: string
	theme: string
	children: React.ReactNode
}

export const ContentSection: React.FC<ContentSectionProps> = ({
	title,
	theme,
	children,
}) => {
	// Создаем ref для доступа к прокручиваемому контейнеру
	const scrollContainerRef = useRef<HTMLDivElement>(null)

	// Функция для прокрутки влево
	const handleScrollLeft = () => {
		if (scrollContainerRef.current) {
			// Прокручиваем на ширину одной карточки + отступ
			scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
		}
	}

	// Функция для прокрутки вправо
	const handleScrollRight = () => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
		}
	}

	const sectionClassName = `Contentsection section-${theme}`

	return (
		<section className={sectionClassName}>
			{/* Общий заголовок и кнопки управления */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<h2>{title}</h2>
				<div className='scroll-buttons'>
					<button
						className='scroll-button left'
						onClick={handleScrollLeft}
						aria-label='Прокрутить влево'
					>
						<MdArrowBackIos className='scroll-button-icon left' />
					</button>
					<button
						className='scroll-button right'
						onClick={handleScrollRight}
						aria-label='Прокрутить вправо'
					>
						<MdArrowForwardIos className='scroll-button-icon right' />
					</button>
				</div>
			</div>

			{/* Контейнер, который будет прокручиваться */}
			<div className='scrollable-content' ref={scrollContainerRef}>
				{/* Класс cards-grid теперь используется для flex-раскладки */}
				<div className='cards-grid'>{children}</div>
			</div>
		</section>
	)
}
