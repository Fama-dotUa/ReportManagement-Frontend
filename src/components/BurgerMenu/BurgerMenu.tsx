import React, { useState, useEffect, useRef } from 'react'
import './BurgerMenu.css'
import { useNavigate } from 'react-router-dom'

export const BurgerMenu: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()

	const menuItems = [
		{
			label: 'УСТАВ',
			onClick: () => {
				window.open(
					'https://docs.google.com/document/d/1S8UMWC9SwVMNAGgmRSxhAmniavuiMZqNBVVALLa2BDA/edit?usp=sharing',
					'_blank',
					'noopener,noreferrer'
				)
			},
		},
		{
			label: 'ПОДСКАЗКИ',
			onClick: () => {
				window.open(
					'	https://docs.google.com/spreadsheets/d/1DaOm4jV6C52nehM8h46YAelQ59aSHOmx3t8D7PaHO48/edit?gid=0#gid=0',
					'_blank',
					'noopener,noreferrer'
				)
			},
		},
		{
			label: 'Косметика',
			onClick: () => {
				navigate('/cosmetics')
			},
		},
		{
			label: 'Специальности',
			onClick: () => {
				navigate('/specialists')
			},
		},
	]
	// Эффект для закрытия меню при клике вне его области
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		// Добавляем слушатель события
		document.addEventListener('mousedown', handleClickOutside)
		// Очищаем слушатель при размонтировании компонента
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleItemClick = (onClick: () => void) => {
		onClick() // Выполняем действие, переданное в пропсах
		setIsOpen(false) // Закрываем меню
	}

	return (
		<div className='burger-menu' ref={menuRef}>
			<button
				className={`burger-button ${isOpen ? 'open' : ''}`}
				onClick={() => setIsOpen(!isOpen)}
				aria-label='Открыть меню'
				aria-expanded={isOpen}
			>
				<span className='burger-line'></span>
				<span className='burger-line'></span>
				<span className='burger-line'></span>
			</button>

			<ul className={`dropdown-list ${isOpen ? 'open' : ''}`}>
				{menuItems.map((item, index) => (
					<li
						key={index}
						className='dropdown-item'
						onClick={() => handleItemClick(item.onClick)}
					>
						{item.label}
					</li>
				))}
			</ul>
		</div>
	)
}
