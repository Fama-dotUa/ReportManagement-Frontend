import React, { useState } from 'react'
import './SoldierList.css'
import { useUsers } from '../../hooks/useUsers'
import { useSearch } from '../../hooks/useSearch'
import type { User } from '../../types/User'

interface Props {
	selectedId: string | null
	onSelect: (id: string) => void
	excludeId?: number | string
}
const getButtonStyle = (user: User, currentUserId: string | null) => {
	// 1. Если есть активный фон - ставим его
	if (user.fon_schildik_active_url) {
		return {
			backgroundImage: `url(${user.fon_schildik_active_url})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			color: 'white',
			textShadow:
				'-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black',
		}
	}

	// 2. Если нет фона, но это текущий пользователь - делаем фон зеленым
	if (String(user.id) === currentUserId) {
		return { backgroundColor: '#d0f0c0' }
	}

	// 3. Во всех остальных случаях - фон прозрачный
	return { backgroundColor: 'transparent' }
}
const SoldierList: React.FC<Props> = ({ selectedId, onSelect, excludeId }) => {
	const { users, currentUserId } = useUsers()
	const [searchQuery, setSearchQuery] = useState('')
	const filteredUsers = useSearch(users, searchQuery)
	const visibleUsers = filteredUsers.filter(
		u => String(u.id) !== String(excludeId)
	)
	return (
		<div className='soldier-list'>
			<input
				type='text'
				placeholder='Поиск солдата...'
				className='search-input'
				value={searchQuery}
				onChange={e => setSearchQuery(e.target.value)}
			/>
			<ul>
				{visibleUsers.map((user: User) => (
					<li key={user.id}>
						<button
							className={selectedId === String(user.id) ? 'active' : ''}
							onClick={() => onSelect(String(user.id))}
							style={getButtonStyle(
								user,
								currentUserId !== null ? String(currentUserId) : null
							)}
						>
							<span className='truncate-text' title={user.username}>
								{user.username} | @{user.discord}
							</span>
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}

export default SoldierList
