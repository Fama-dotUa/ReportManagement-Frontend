import { transformReason } from './reasonTransformer'

const API_URL = import.meta.env.VITE_API_URL

export async function getReasons() {
	const res = await fetch(`${API_URL}/api/reasons`)
	const json = await res.json()
	return json.data.map(transformReason)
}
