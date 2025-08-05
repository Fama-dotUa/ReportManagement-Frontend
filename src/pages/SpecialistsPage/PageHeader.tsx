// src/components/PageHeader/PageHeader.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
	title: string
}
export const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
	const navigate = useNavigate()
	return (
		<header className='page-header'>
			<h1>{title}</h1>
			<button onClick={() => navigate('/store')} className='back-button'>
				&larr; Назад в Магазин
			</button>
		</header>
	)
}
