export type CosmeticItem = {
	id: number
	name: string
	description?: string
	CR?: number
	image?: {
		id: number
		url: string
	}
}

export type User = {
	id: number
	username: string
	discord: string
	CR: number
	icon?: string
	rank?: string
	rank_daily_reward?: number
	role?: string
	Description?: string
	positions?: {
		id: number
		name: string
		position_daily_reward?: number
	}[]
	last_login?: string
	fon_schildik_active_url?: string
	framesfor_avatar_active_url?: string
	profile_background_active_url?: string
	CR_for_all_time?: number

	// --- Новые добавленные поля ---
	fon_schildiks_all?: CosmeticItem[]
	fon_schildik_active?: CosmeticItem
	framesfor_avatars_all?: CosmeticItem[]
	framesfor_avatar_active?: CosmeticItem
	profile_backgrounds_all?: CosmeticItem[]
	profile_background_active?: CosmeticItem
}
