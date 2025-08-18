import React, { useRef } from 'react'
import type { ProcessedAward } from '../../hooks/useUserAwards'
import './UserAwards.css'

type Props = {
	awards: ProcessedAward[]
}

const API_URL = import.meta.env.VITE_API_URL

const UserAwards: React.FC<Props> = ({ awards }) => {
	const scrollContainerRef = useRef<HTMLDivElement>(null)

	if (awards.length === 0) {
		return (
			<div className='user-awards-container'>
				<p>Наград нет</p>
			</div>
		)
	}

	return (
		<div className='user-awards-container'>
			<div className='awards-list' ref={scrollContainerRef}>
				{awards.map(award => (
					<div
						key={award.id}
						className='award-item'
						title={`${award.name} (${award.type})`}
					>
						{award.imageUrl ? (
							<img
								src={`${API_URL}${award.imageUrl}`}
								title={award.name + award.presentation}
								className='award-image'
								loading='lazy'
							/>
						) : (
							<div className='award-image-placeholder'>?</div>
						)}
						{award.count > 1 && (
							<span className='award-count'>x{award.count}</span>
						)}
					</div>
				))}
			</div>
		</div>
	)
}

export default UserAwards
