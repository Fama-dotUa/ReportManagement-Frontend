import { useCallback } from 'react'
import { useAuth } from './useAuth'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import { marked } from 'marked'
import { getUser } from '../api/getUser'

import dayjs from 'dayjs'
;(pdfMake as any).vfs = (pdfFonts as any).vfs

export const useReportPreview = () => {
	const { token, user } = useAuth()
	const markdownToText = async (markdown: string) => {
		const html = await marked.parseInline(markdown)
		const temp = document.createElement('div')
		temp.innerHTML = html
		return temp.innerText
	}

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

			const recipient = await getUser(data.user.id)
			const creator = await getUser(data.creator.id)
			const role =
				creator.role.name == 'officer' ? 'Дисциплинарный офицер' : 'хуйня'
			const startDate = dayjs(data.createdAt)
			const endDate = startDate.add(data.time_to_free, 'day')

			const docDefinition: TDocumentDefinitions = {
				content: [
					{
						text: 'Командующему Главного штаба STV_sqúad,',
						alignment: 'right',
						margin: [0, 0, 0, 0],
					},
					{
						text: 'генералу dyeness',
						alignment: 'right',
						margin: [0, 0, 0, 60],
					},
					{
						text: `РАПОРТ №${data.id}`,
						style: 'header',
						alignment: 'center',
						margin: [0, 0, 0, 30],
					},
					{
						text: `В соответствии с п. 1.1 Закона STV_sqúad о дисциплинарных обязанностях`,
						margin: [10, 0, 0, 0],
						alignment: 'right',
					},
					{
						text: `прошу вашего решения насчет ${data.reason.cipher}-${
							data.reason.number
						} ${
							data.reason.description
						} продолжительностью c ${startDate.format(
							'DD.MM.YY'
						)} по ${endDate.format('DD.MM.YY')}.`,
						margin: [0, 0, 0, 20],
						alignment: 'justify',
					},
					{
						text: `Кому выдается: ${cleanRankName(recipient.rank?.name)} ${
							recipient.username
						}`,
						margin: [16, 0, 0, 10],
					},
					{
						text: 'Обоснование:',
						bold: true,
						margin: [16, 10, 0, 5],
					},
					{
						text: await markdownToText(data.description || ''),
						margin: [0, 0, 0, 30],
					},
					{
						text: `${role || 'Должность'}`,
						alignment: 'left',
						margin: [0, 10, 0, 0],
					},
					{
						columns: [
							{
								text: `${cleanRankName(creator.rank?.name) || 'Звание'}`,
								width: '50%',
							},
							{
								stack: [{ text: `${creator.username}`, alignment: 'right' }],
								width: '50%',
							},
						],
						columnGap: 10,
						margin: [0, 10, 0, 0],
					},
					{
						text: `${startDate.format('DD.MM.YY')}`,
						alignment: 'left',
						margin: [0, 10, 0, 0],
					},
				],
				defaultStyle: {
					font: 'Roboto',
					fontSize: 14,
				},
				styles: {
					header: {
						fontSize: 18,
						bold: true,
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

const cleanRankName = (name?: string): string => {
	if (!name) return ''

	const symbolsToRemove = ['∙', '▰', '◁', '◆', '★']
	const regex = new RegExp(`[${symbolsToRemove.join('')}]`, 'g')

	return name.replace(regex, '').trim()
}
