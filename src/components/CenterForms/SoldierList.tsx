import React, { useMemo, useRef, useState } from 'react'
import './SoldierList.css'
import { useUsers } from '../../hooks/useUsers'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useSearch } from '../../hooks/useSearch'
import type { User } from '../../types/User'
import { useVirtualizer } from '@tanstack/react-virtual'

interface Props {
	selectedId: string | null
	onSelect: (id: string) => void
	excludeId?: number | string
}

const getButtonStyle = (user: User, _currentUserId: string | null) => {
	if (user.fon_schildik_active?.image?.url) {
		return {
			backgroundImage: `url(${
				import.meta.env.VITE_API_URL + user.fon_schildik_active.image.url
			})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		} as React.CSSProperties
	}
	return {}
}

const ROW_HEIGHT = 44

const SoldierList: React.FC<Props> = ({ selectedId, onSelect, excludeId }) => {
	const { data: users = [], isLoading } = useUsers()
	const { data: currentUser } = useCurrentUser()
	const currentUserId = currentUser?.id ? String(currentUser.id) : null

	// 🔎 Поиск по username/discord
	const [searchQuery, setSearchQuery] = useState('')

	// Базовый массив с исключением одного id (если нужно)
	const baseUsers = useMemo(
		() => users.filter(u => String(u.id) !== String(excludeId ?? '')),
		[users, excludeId]
	)

	// Клиентский поиск (быстрый, без дополнительных запросов к бэку)
	const filteredUsers = useSearch<User>(baseUsers, searchQuery)

	// Виртуализация списка
	const parentRef = useRef<HTMLDivElement | null>(null)
	const rowVirtualizer = useVirtualizer({
		count: filteredUsers.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => ROW_HEIGHT,
		overscan: 10,
	})

	if (isLoading) {
		return <div className='loader'>Загрузка...</div>
	}

	return (
		<div className='soldier-list' ref={parentRef}>
			<input
				type='text'
				placeholder='Поиск солдата...'
				className='search-input'
				value={searchQuery}
				onChange={e => setSearchQuery(e.target.value)}
			/>

			<div className='soldier-list-ul'>
				{rowVirtualizer.getVirtualItems().map(virtualRow => {
					const user = filteredUsers[virtualRow.index]
					return (
						<button
							key={user.id}
							className={`soldier-btn ${
								selectedId === String(user.id) ? 'active' : ''
							}`}
							onClick={() => onSelect(String(user.id))}
							title={`${user.username} | @${user.discord}`}
							style={getButtonStyle(user, currentUserId)}
						>
							<span className='truncate-text'>
								{user.username} | @{user.discord}
							</span>
						</button>
					)
				})}
			</div>
		</div>
	)
}

export default SoldierList
