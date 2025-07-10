import { useCallback } from 'react'
import { useAuth } from './useAuth'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
;(pdfMake as any).vfs = (pdfFonts as any).vfs

export const useReportPreview = () => {
	const { token } = useAuth()

	const previewReport = useCallback(async (reportId: string) => {
		try {
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
			if (!res.ok) throw new Error('Ошибка при загрузке рапорта')

			const report = await res.json()
			const data = report.data[0]

			const docDefinition = {
				content: [
					{ text: `Рапорт: ${data.reason.description}`, style: 'header' },
					{ text: `Шифр: ${data.reason.cipher}` },
					{ text: `Номер: ${data.reason.number}` },
					{
						text: `Дата создания: ${new Date(data.createdAt).toLocaleString()}`,
					},
					{ text: `Создатель: ${data.creator.username || 'неизвестен'}` },
				],
				defaultStyle: {
					font: 'Roboto',
					fontSize: 12,
				},
				styles: {
					header: {
						fontSize: 16,
						bold: true,
						margin: [0, 0, 0, 10] as [number, number, number, number],
					},
				},
			}

			pdfMake.createPdf(docDefinition).open()
		} catch (err) {
			console.error(err)
			alert('Не удалось сформировать PDF')
		}
	}, [])

	return { previewReport }
}
