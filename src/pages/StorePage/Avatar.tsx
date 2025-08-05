// src/components/Avatar/Avatar.tsx
import React from 'react'

interface AvatarProps {
	imageUrl: string
	frameUrl?: string
}

export const Avatar: React.FC<AvatarProps> = ({ imageUrl, frameUrl }) => {
	return (
		<div className='avatar-container'>
			<img src={imageUrl} alt='Аватар пользователя' />
			{frameUrl && (
				<div
					className='avatar-frame'
					style={{ backgroundImage: `url('${frameUrl}')` }}
				></div>
			)}
		</div>
	)
}
