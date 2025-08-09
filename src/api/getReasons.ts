import { transformReason } from './reasonTransformer'

export async function getReasons() {
	const res = await fetch(
		`${
			import.meta.env.VITE_API_URL
		}/api/reasons?populate=*&pagination[limit]=150`
	)
	const json = await res.json()
	return json.data.map(transformReason)
}
