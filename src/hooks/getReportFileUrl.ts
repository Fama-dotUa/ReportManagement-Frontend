export const getReportFileUrl = async (
	reportId: number
): Promise<string | null> => {
	const token = localStorage.getItem('jwt')
	if (!token) return null

	const res = await fetch(
		`${
			import.meta.env.VITE_API_URL
		}/api/reports?filters[id][$eq]=${reportId}&populate=*`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)

	if (!res.ok) return null

	const json = await res.json()
	const file = json.data[0].file
	if (file?.url) {
		return file.url.startsWith('http')
			? file.url
			: `${import.meta.env.VITE_API_URL}${file.url}`
	}

	return null
}
