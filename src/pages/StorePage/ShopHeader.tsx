// src/components/ShopHeader/ShopHeader.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
interface ShopHeaderProps {
	title: string
	balance: number
}
export const ShopHeader: React.FC<ShopHeaderProps> = ({ title, balance }) => {
	const navigate = useNavigate()
	return (
		<header className='header'>
			<h1>{title}</h1>
			<div className='balance-display-shop'>
				<span>{balance.toLocaleString()}</span>
				<span> CR</span>
			</div>
			<button onClick={() => navigate('/officer')} className='back-button'>
				&larr; На главную
			</button>
		</header>
	)
}
