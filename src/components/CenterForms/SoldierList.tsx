import React, { useState } from 'react'
import './SoldierList.css'
import { useUsers } from '../../hooks/useUsers'
import { useSearch } from '../../hooks/useSearch'
import type { User } from '../../types/User'

interface Props {
	selectedId: string | null
	onSelect: (id: string) => void
}

const SoldierList: React.FC<Props> = ({ selectedId, onSelect }) => {
	const { users } = useUsers()
	const [searchQuery, setSearchQuery] = useState('')
	const filteredUsers = useSearch(users, searchQuery)

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
				{filteredUsers.map((user: User) => (
					<li key={user.id}>
						<button
							className={selectedId === String(user.id) ? 'active' : ''}
							onClick={() => onSelect(String(user.id))}
						>
							{user.username} | @{user.discord}
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}

export default SoldierList
