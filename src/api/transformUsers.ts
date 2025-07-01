// utils/transformUsers.ts
type RawUser = {
	id: number
	username: string
	discord: string
	icon?: {
		url: string
	}
	rank?: {
		name: string
	}
}

export const transformUsers = (data: any[]) => {
	const API_URL = import.meta.env.VITE_API_URL

	return data.map(user => ({
		id: user.id,
		username: user.username,
		discord: user.discord,
		rank: user.rank?.name ?? '',
		icon: user.Icon?.url ? API_URL + user.Icon.url : '', // 🔧 правильный путь
	}))
}
