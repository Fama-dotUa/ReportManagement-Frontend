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
}
