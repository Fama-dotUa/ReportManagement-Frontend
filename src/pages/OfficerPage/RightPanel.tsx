import React, { useEffect, useState } from 'react'
import { fetchUsers } from '../../api/fetchUsers'
import { transformUsers } from '../../api/transformUsers'

type User = {
	id: number
	username: string
	discord: string
	icon?: string
	rank?: string
}

const RightPanel: React.FC = () => {
	const [users, setUsers] = useState<User[]>([])
	const [currentUserId, setCurrentUserId] = useState<number | null>(null)

	const API_URL = import.meta.env.VITE_API_URL

	useEffect(() => {
		const loadUsers = async () => {
			try {
				const raw = await fetchUsers()
				const transformed = transformUsers(raw)
				setUsers(transformed)
			} catch (err) {
				console.error('Ошибка загрузки пользователей:', err)
			}
		}

		const fetchCurrentUser = async () => {
			try {
				const token = localStorage.getItem('jwt')
				if (!token) return

				const res = await fetch(`${API_URL}/api/users/me`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				const user = await res.json()
				setCurrentUserId(user.id)
			} catch (err) {
				console.error('Ошибка получения текущего пользователя:', err)
			}
		}

		loadUsers()
		fetchCurrentUser()
	}, [])

	const handleClick = (user: User) => {
		console.log('Открыть профиль:', user)
	}

	return (
		<div className='right-panel'>
			<h3>Солдаты</h3>
			<input type='text' placeholder='Поиск...' />
			<ul>
				{users.map(user => (
					<li key={user.id}>
						<button onClick={() => handleClick(user)}>
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
