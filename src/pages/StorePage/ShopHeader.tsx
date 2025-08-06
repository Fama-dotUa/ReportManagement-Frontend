// src/components/ShopHeader/ShopHeader.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BsArrowLeft } from 'react-icons/bs'
interface ShopHeaderProps {
	title: string
	balance: number
}
export const ShopHeader: React.FC<ShopHeaderProps> = ({ title, balance }) => {
	const navigate = useNavigate()
	return (
		<header className='header'>
			<h1>{title}</h1>
			<div className='balance-display'>
				<span>Баланс CR:</span>
				<span>{balance.toLocaleString()}</span>
			</div>
			<button onClick={() => navigate('/officer')} className='back-button'>
				<BsArrowLeft className='icon-arrow' /> На главную
			</button>
		</header>
	)
}
