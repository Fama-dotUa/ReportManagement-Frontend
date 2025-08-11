import type { User } from '../types/User'

// Эта функция-заглушка остается для примера. Используйте вашу реальную функцию обновления.
async function updateUserOnServer(
	userId: number,
	data: Partial<User>
): Promise<void> {
	const token = localStorage.getItem('jwt')

	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/api/users/${userId}`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		}
	)

	if (!response.ok) {
		throw new Error('Не удалось обновить данные пользователя на сервере.')
	}
}

/**
 * Проверяет условия и начисляет ежедневную награду пользователю.
 * ✅ Версия, обновленная под ваш тип User.
 * @param user - Объект залогиненного пользователя.
 */
export async function handleDailyLoginReward(user: User): Promise<void> {
	const now = new Date()

	const lastLoginDate = user.last_login ? new Date(user.last_login) : null
	let shouldGrantReward = false

	// --- Шаг 1: Проверка времени ---
	if (lastLoginDate === null) {
		shouldGrantReward = true
		console.log(`Первое начисление для ${user.username}.`)
	} else {
		const hoursPassed =
			(now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60)
		if (hoursPassed >= 24) {
			shouldGrantReward = true
			console.log(`Прошло >24 часов для ${user.username}. Начисляем награду.`)
		} else {
			console.log(`Для ${user.username} еще не прошло 24 часа.`)
			return
		}
	}

	if (!shouldGrantReward) return

	// --- Шаг 2: Расчет суммы награды ---

	let totalReward = 0
	console.log(`Начисляем награду ${user.rank_daily_reward}...`)

	totalReward += user.rank_daily_reward || 0

	if (user.positions && user.positions.length > 0) {
		const positionsReward = user.positions.reduce((sum, position) => {
			return sum + (position.position_daily_reward || 0)
		}, 0)
		totalReward += positionsReward
	}

	if (totalReward <= 0) {
		console.log('Сумма награды равна нулю, обновление не требуется.')
		// Даже если награда 0, стоит обновить время входа, чтобы таймер 24ч пошел заново
		try {
			await updateUserOnServer(user.id, { last_login: now.toISOString() })
		} catch (error) {
			console.error('Не удалось обновить last_login:', error)
		}
		return
	}

	console.log(`Общая сумма награды для ${user.username}: ${totalReward}`)

	// --- Шаг 3: Обновление данных пользователя на сервере ---

	try {
		const dataToUpdate: Partial<User> = {
			last_login: now.toISOString(),
			CR: Number(user.CR || 0) + totalReward,
			CR_for_all_time: (user.CR_for_all_time || 0) + totalReward,
		}

		await updateUserOnServer(user.id, dataToUpdate)

		console.log('Награда успешно начислена!')
	} catch (error) {
		console.error('Произошла ошибка при начислении награды:', error)
	}
}
