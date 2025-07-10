interface Reason {
	id: number
	cipher: string
	number: number
	description: string
}

export function transformReason(item: Reason): { id: number; label: string } {
	const label = `${item.cipher}-${item.number} | ${item.description}
	`
	return { id: item.id, label }
}
