import React, { useState } from 'react'
import { useUsers } from './useUsers'
import { useSearch } from '../../hooks/useSearch'
import UserProfileModal from '../../components/ProfileForm/UserProfileModal'

import type { User } from '../../types/User'

const RightPanel: React.FC = () => {
	const { users, currentUserId } = useUsers()
	const [searchQuery, setSearchQuery] = useState('')
	const filteredUsers = useSearch(users, searchQuery)
	const [selectedUser, setSelectedUser] = useState<User | null>(null)
	const [isOfficer, setIsOfficer] = useState<boolean>(true)

	const handleClick = (user: any) => {
		setSelectedUser(user)
	}

	const handleUpdate = (updatedUser: User) => {
		console.log('Отправить обновлённые данные на сервер:', updatedUser)
		// TODO: вызов API для сохранения
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
			{selectedUser && (
				<UserProfileModal
					user={selectedUser}
					editable={isOfficer}
					onSubmit={handleUpdate}
					onClose={() => setSelectedUser(null)}
				/>
			)}
		</div>
	)
}

export default RightPanel
