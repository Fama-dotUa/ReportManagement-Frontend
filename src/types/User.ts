export type User = {
	id: number
	username: string
	discord: string
	icon?: string
	rank?: string
	role?: string
	Description?: string
	positions?: {
		id: number
		name: string
	}[]
	fon_schildik_active_url?: string
	framesfor_avatar_active_url?: string
	profile_background_active_url?: string
	CR_for_all_time?: number
}
