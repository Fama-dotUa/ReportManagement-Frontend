import React, { useEffect, useState } from 'react'
import { useUsers } from '../../hooks/useUsers'
import { useSearch } from '../../hooks/useSearch'
import UserProfileModal from '../../components/ProfileForm/UserProfileModal'
import CreateSoldierModal from '../../components/CreateSoldierModal/CreateSoldierModal'
import { useCreateUser } from '../../hooks/useCreateUser'

import { useUpdateUser } from '../../hooks/useUpdateUser'
import { useAuth } from '../../hooks/useAuth'
import type { User } from '../../types/User'

const getButtonStyle = (user: User, currentUserId: string | null) => {
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

	if (String(user.id) === currentUserId) {
		return { backgroundColor: '#d0f0c0' }
	}

	return { backgroundColor: 'transparent' }
}

const RightPanel: React.FC = () => {
	const { users, currentUserId } = useUsers()
	const [searchQuery, setSearchQuery] = useState('')
	const filteredUsers = useSearch(users, searchQuery)
	const [selectedUser, setSelectedUser] = useState<User | null>(null)
	const [isGeneral, setIsGeneral] = useState<boolean>(true)
	const { updateUser } = useUpdateUser(currentUserId)
	const { role } = useAuth()
	const [creating, setCreating] = useState(false)
	const { createUser } = useCreateUser()

	const handleCreate = async (newUser: User & { password: string }) => {
		const result = await createUser(newUser)
		if (result.success) {
			console.log('Солдат добавлен')
			setCreating(false)
		} else {
			alert(result.message)
		}
	}

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
		if (role === 'general') {
			setIsGeneral(true)
		} else {
			setIsGeneral(false)
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

			{isGeneral && (
				<button className='add-soldier' onClick={() => setCreating(true)}>
					Добавить солдата
				</button>
			)}

			{creating && (
				<CreateSoldierModal
					onClose={() => setCreating(false)}
					onCreate={handleCreate}
				/>
			)}

			{selectedUser && (
				<UserProfileModal
					user={selectedUser}
					editable={isGeneral || selectedUser.id === currentUserId}
					onSubmit={handleUpdate}
					onClose={() => setSelectedUser(null)}
				/>
			)}
		</div>
	)
}

export default RightPanel
