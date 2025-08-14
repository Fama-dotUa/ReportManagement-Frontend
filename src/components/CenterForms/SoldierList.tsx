import React, { useState } from 'react'
import './SoldierList.css'
import { useUsers } from '../../hooks/useUsers'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useSearch } from '../../hooks/useSearch'
import type { User } from '../../types/User'
const API_URL = import.meta.env.VITE_API_URL
interface Props {
	selectedId: string | null
	onSelect: (id: string) => void
	excludeId?: number | string
}
const getButtonStyle = (user: User, currentUserId: string | null) => {
	// ... (эта функция остаётся без изменений)
	if (user.fon_schildik_active?.image?.url) {
		return {
			backgroundImage: `url(${API_URL + user.fon_schildik_active.image.url})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			color: 'white',
			textShadow:
				'-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black',
		}
	}
	if (String(user.id) === currentUserId) {
		return { backgroundColor: '#d0f0c0' }
	}
	return { backgroundColor: 'transparent' }
}

const SoldierList: React.FC<Props> = ({ selectedId, onSelect, excludeId }) => {
	// ================== ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ЗДЕСЬ ==================

	// 1. Хуки для получения данных
	const { data: allUsers, isLoading: isLoadingUsers } = useUsers()
	const { data: currentUser } = useCurrentUser()

	// 2. Хуки для состояния и логики поиска (перенесены наверх)
	const [searchQuery, setSearchQuery] = useState('')
	const filteredUsers = useSearch(allUsers || [], searchQuery)

	// =================================================================

	// Теперь, когда все хуки вызваны, можно делать условный рендеринг
	if (isLoadingUsers) {
		return <div>Загрузка...</div>
	}

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
								currentUser?.id !== null ? String(currentUser?.id) : null
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
