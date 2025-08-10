export const transformUsers = (data: any[]) => {
	const API_URL = import.meta.env.VITE_API_URL
	return data.map(user => ({
		id: user.id,
		username: user.username,
		discord: user.discord,
		rank: user.rank?.name ?? '',
		icon: user.Icon?.url ? API_URL + user.Icon.url : '',
		role: user.role?.type || 'authenticated',
		Description: user.Description || '',
		positions:
			user.positions?.map((pos: any) => ({
				id: pos.id,
				name: pos.name,
			})) || [],
		fon_schildik_active_url: user.fon_schildik_active?.image?.url
			? API_URL + user.fon_schildik_active.image.url
			: false,
		framesfor_avatar_active_url: user.framesfor_avatar_active?.image?.url
			? API_URL + user.framesfor_avatar_active.image.url
			: false,
		profile_background_active_url: user.profile_background_active?.image?.url
			? API_URL + user.profile_background_active.image.url
			: false,
		CR_for_all_time: user.CR_for_all_time || 0,
	}))
}
