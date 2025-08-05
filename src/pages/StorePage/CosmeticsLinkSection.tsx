// src/components/CosmeticsLinkSection/CosmeticsLinkSection.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

export const CosmeticsLinkSection: React.FC = () => {
	const navigate = useNavigate()
	return (
		<section className='section section-cosmetics section-cosmetics-link'>
			<h2>Косметика</h2>
			<p>
				Персонализируйте свой профиль с уникальными рамками, фонами и шевронами.
			</p>
			<button onClick={() => navigate('/cosmetics')}>
				Перейти в Раздел Косметики
			</button>
		</section>
	)
}
