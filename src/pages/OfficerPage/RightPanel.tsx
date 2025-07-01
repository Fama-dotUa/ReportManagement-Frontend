import React, { useState } from 'react'
import { useUsers } from './useUsers'
import { useSearch } from '../../hooks/useSearch'

const RightPanel: React.FC = () => {
	const { users, currentUserId } = useUsers()
	const [searchQuery, setSearchQuery] = useState('')
	const filteredUsers = useSearch(users, searchQuery)

	const handleClick = (user: any) => {
		console.log('Открыть профиль:', user)
	}

	return (
		<div className='right-panel'>
			<h3>Солдаты</h3>
			<input
				type='text'
				placeholder='Поиск...'
				value={searchQuery}
				onChange={e => setSearchQuery(e.target.value)}
			/>
			<ul>
				{filteredUsers.map(user => (
					<li key={user.id}>
						<button
							onClick={() => handleClick(user)}
							style={{
								backgroundColor:
									user.id === currentUserId ? '#d0f0c0' : 'transparent',
							}}
						>
							{user.username} | @{user.discord}
						</button>
					</li>
				))}
			</ul>
			<button className='add-soldier'>Добавить солдата</button>
		</div>
	)
}

export default RightPanel
