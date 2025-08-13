import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs' // <-- Добавлен импорт
import { useUsers } from '../../hooks/useUsers'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useSearch } from '../../hooks/useSearch'
import UserProfileModal from '../../components/ProfileForm/UserProfileModal'
import CreateSoldierModal from '../../components/CreateSoldierModal/CreateSoldierModal'
import { useCreateUser } from '../../hooks/useCreateUser'
import { useUpdateUser } from '../../hooks/useUpdateUser'
import { useAuth } from '../../hooks/useAuth'
import type { User } from '../../types/User'

// Обновлённая функция getButtonStyle
// RightPanel.tsx

const getButtonStyle = (
	user: User,
	currentUserId: string | null
): React.CSSProperties => {
	const style: React.CSSProperties = {
		// --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
		// Вместо одного 'border' используем три отдельных свойства
		borderWidth: '2px',
		borderStyle: 'solid',
		borderColor: 'transparent', // Цвет по умолчанию
		// -------------------------
		transition: 'border-color 0.3s ease',
	}

	const isOnline =
		user.last_seen &&
		dayjs(user.last_seen).isAfter(dayjs().subtract(5, 'minutes'))

	if (isOnline) {
		// Теперь эта строка безопасно перезаписывает только цвет
		style.borderColor = '#28a745' // Зелёная рамка
	}

	// ... остальная логика функции без изменений ...
	if (user.fon_schildik_active_url) {
		style.backgroundImage = `url(${user.fon_schildik_active_url})`
		style.backgroundSize = 'cover'
		style.backgroundPosition = 'center'
		style.color = 'white'
		style.textShadow = '1px 1px 1px black'
	} else if (String(user.id) === currentUserId) {
		style.backgroundColor = '#d0f0c0'
	} else {
		style.backgroundColor = 'transparent'
	}

	return style
}
const RightPanel: React.FC = () => {
	const { data: allUsers, isLoading: isLoadingUsers } = useUsers()
	const { data: currentUser } = useCurrentUser()
	const [searchQuery, setSearchQuery] = useState('')
	const filteredUsers = useSearch(allUsers || [], searchQuery)
	const [selectedUser, setSelectedUser] = useState<User | null>(null)
	const [isGeneral, setIsGeneral] = useState<boolean>(true)
	const { updateUser } = useUpdateUser(currentUser?.id)
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
		setIsGeneral(role === 'general')
	}, [role])

	if (isLoadingUsers) {
		return <div>Загрузка...</div>
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
					editable={isGeneral || selectedUser.id === currentUser?.id}
					onSubmit={handleUpdate}
					onClose={() => setSelectedUser(null)}
				/>
			)}
		</div>
	)
}

export default RightPanel
