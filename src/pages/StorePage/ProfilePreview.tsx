// src/components/ProfilePreview/ProfilePreview.tsx
import React from 'react'
import { Avatar } from './Avatar'

interface ProfilePreviewProps {
	user: {
		name: string
		rank: string
		avatarUrl: string
		frameUrl?: string
		backgroundUrl: string
		chevronText: string
	}
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({ user }) => {
	return (
		<aside className='profile-aside'>
			<h2>Ваш Профиль (Пример)</h2>
			<div className='profile-content'>
				<Avatar imageUrl={user.avatarUrl} frameUrl={user.frameUrl} />
				<div className='profile-info'>
					<h3>{user.name}</h3>
					<p>
						Текущее звание: <span>{user.rank}</span>
					</p>
					<div className='profile-item-box'>
						<p>Фон профиля:</p>
						<div
							className='background-preview'
							style={{ backgroundImage: `url('${user.backgroundUrl}')` }}
						></div>
					</div>
					<div className='profile-item-box mt-4'>
						<p>Шеврон/Шильдик:</p>
						<div className='chevron-preview'>{user.chevronText}</div>
					</div>
				</div>
			</div>
		</aside>
	)
}
