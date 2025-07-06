import React, { useEffect, useState } from 'react'
import { useUsers } from '../../hooks/useUsers'
import { useSearch } from '../../hooks/useSearch'
import UserProfileModal from '../../components/ProfileForm/UserProfileModal'
import { useUpdateUser } from '../../hooks/useUpdateUser'
import { useAuth } from '../../hooks/useAuth'
import type { User } from '../../types/User'

const RightPanel: React.FC = () => {
	const { users, currentUserId } = useUsers()
	const [searchQuery, setSearchQuery] = useState('')
	const filteredUsers = useSearch(users, searchQuery)
	const [selectedUser, setSelectedUser] = useState<User | null>(null)
	const [isOfficer, setIsOfficer] = useState<boolean>(true)
	const { updateUser } = useUpdateUser(currentUserId)
	const { role } = useAuth()

	const handleClick = (user: any) => {
		setSelectedUser(user)
	}

	const handleUpdate = async (updatedUser: User) => {
		const result = await updateUser(updatedUser)
		if (result.success) {
			console.log('Обновлено успешно')
		} else {
			console.error('Ошибка при обновлении:', result.message)
		}
	}
	useEffect(() => {
		if (role === 'officer') {
			setIsOfficer(true)
		} else {
			setIsOfficer(false)
		}
	}, [role])

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
