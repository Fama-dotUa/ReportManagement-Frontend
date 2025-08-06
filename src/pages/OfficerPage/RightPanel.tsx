import React, { useEffect, useState } from 'react'
import { useUsers } from '../../hooks/useUsers'
import { useSearch } from '../../hooks/useSearch'
import UserProfileModal from '../../components/ProfileForm/UserProfileModal'
import CreateSoldierModal from '../../components/CreateSoldierModal/CreateSoldierModal'
import { useCreateUser } from '../../hooks/useCreateUser'

import { useUpdateUser } from '../../hooks/useUpdateUser'
import { useAuth } from '../../hooks/useAuth'
import type { User } from '../../types/User'

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
							style={
								// 1. Сначала проверяем на совпадение с особым ID для фото
								user.id === 20
									? {
											// Если ДА - ставим фото как фон
											backgroundImage: `url('/SanyaChist.png')`,
											backgroundSize: 'cover',
											backgroundPosition: 'center',
											color: 'white', // Для читаемости текста на фоне фото
									  }
									: // 2. Если НЕТ - проверяем, совпадает ли user.id с ID залогиненного пользователя
									user.id === currentUserId
									? { backgroundColor: '#d0f0c0' } // Если ДА - ставим зелёный фон
									: // 3. Если НИ ОДНО из условий не выполнено - оставляем стандартный прозрачный фон
									  { backgroundColor: 'transparent' }
							}
						>
							{user.username} | @{user.discord}
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
