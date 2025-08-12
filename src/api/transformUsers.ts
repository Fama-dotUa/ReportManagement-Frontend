// transformUsers.ts

export const transformUsers = (data: any[]) => {
	const API_URL = import.meta.env.VITE_API_URL

	return data.map(user => ({
		id: user.id,
		username: user.username,
		discord: user.discord,
		CR: user.CR || 0,
		rank: user.rank?.name ?? '',
		rank_daily_reward: user.rank?.daily_reward || 0,
		icon: user.Icon?.url ? API_URL + user.Icon.url : '',
		role: user.role?.type || 'authenticated',
		Description: user.Description || '',
		positions:
			user.positions?.map((pos: any) => ({
				id: pos.id,
				name: pos.name,
				position_daily_reward: pos.daily_reward || 0,
			})) || [],
		last_login: user.last_login || '',

		fon_schildik_active_url: user.fon_schildik_active?.image?.url
			? API_URL + user.fon_schildik_active.image.url
			: undefined,
		framesfor_avatar_active_url: user.framesfor_avatar_active?.image?.url
			? API_URL + user.framesfor_avatar_active.image.url
			: undefined,
		profile_background_active_url: user.profile_background_active?.image?.url
			? API_URL + user.profile_background_active.image.url
			: undefined,

		CR_for_all_time: user.CR_for_all_time || 0,

		// --- Новые добавленные поля (просто копируем данные как есть) ---
		fon_schildiks_all: user.fon_schildiks_all || [],
		fon_schildik_active: user.fon_schildik_active || null,
		framesfor_avatars_all: user.framesfor_avatars_all || [],
		framesfor_avatar_active: user.framesfor_avatar_active || null,
		profile_backgrounds_all: user.profile_backgrounds_all || [],
		profile_background_active: user.profile_background_active || null,
	}))
}
