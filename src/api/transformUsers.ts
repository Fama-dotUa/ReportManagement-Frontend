export const transformUsers = (data: any[]) => {
	return data.map(user => ({
		id: user.id,
		username: user.username,
		discord: user.discord,
		rank: user.rank?.name ?? '',
		icon: user.Icon?.url ? import.meta.env.VITE_API_URL + user.Icon.url : '',
		role: user.role?.type || 'authenticated',
		Description: user.Description || '',
	}))
}
