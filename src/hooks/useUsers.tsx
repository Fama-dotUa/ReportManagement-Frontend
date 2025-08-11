import { useEffect, useState } from 'react'
import { fetchUsers } from '../api/fetchUsers'
import { transformUsers } from '../api/transformUsers'
import type { User } from '../types/User'

export const useUsers = () => {
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

	return { users, currentUserId }
}
