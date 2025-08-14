export type CosmeticItem = {
	id: number
	name: string
	description?: string
	CR?: number
	image?: {
		id: number
		url: string
		ext: string
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
	CR_for_all_time?: number
	last_seen?: string
	fon_schildiks_all?: CosmeticItem[]
	fon_schildik_active?: CosmeticItem
	framesfor_avatars_all?: CosmeticItem[]
	framesfor_avatar_active?: CosmeticItem
	profile_backgrounds_all?: CosmeticItem[]
	profile_background_active?: CosmeticItem
}
