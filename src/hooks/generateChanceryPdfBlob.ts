import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { marked } from 'marked'
import { getUser } from '../api/getUser'
import dayjs from 'dayjs'
;(pdfMake as any).vfs = (pdfFonts as any).vfs

const cleanRankName = (name?: string): string => {
	if (!name) return ''
	const symbolsToRemove = ['∙', '▰', '◁', '◆', '★']
	const regex = new RegExp(`[${symbolsToRemove.join('')}]`, 'g')
	return name.replace(regex, '').trim()
}

export const generateChanceryPdfBlob = async (
	reportId: string,
	token: string
): Promise<Blob> => {
	const res = await fetch(
		`${
			import.meta.env.VITE_API_URL
		}/api/reports?filters[id][$eq]=${reportId}&populate=*`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	)
	if (!res.ok) throw new Error('Ошибка при загрузке рапорта')

	const report = await res.json()
	const data = report.data[0]
	if (!data?.creator || !data?.user) {
		throw new Error('Отсутствуют данные пользователя или создателя')
	}

	const recipient = await getUser(data.user.id)
	const creator = await getUser(data.creator.id)
	const roleMap: Record<string, string> = {
		officer: 'Дисциплинарный офицер',
		'comander-officer': 'Командир',
		general: 'Начальник Генерального штаба',
	}

	const role = roleMap[creator.role?.name] || 'Сотрудник'

	const startDate = dayjs(data.createdAt)
	const endDate = startDate.add(data.time_to_free, 'day')

	const temp = document.createElement('div')
	temp.innerHTML = await marked.parse(data.description || '')
	const plainDescription = temp.innerText
	const durationText =
		data.time_to_free > 0
			? `продолжительностью c ${startDate.format(
					'DD.MM.YY'
			  )} по ${endDate.format('DD.MM.YY')}.`
			: `бессрочной продолжительностью.`

	const docDefinition: import('pdfmake/interfaces').TDocumentDefinitions = {
		content: [
			{ text: 'Командующему Главного штаба STV_sqúad,', alignment: 'right' },
			{ text: 'генералу dyeness', alignment: 'right', margin: [0, 0, 0, 60] },
			{
				text: `РАПОРТ №${data.id}`,
				alignment: 'center',
				style: 'header',
				margin: [0, 0, 0, 30],
			},
			{
				text: `В соответствии с п. 4.2. Закона STV_sqúad об обязанностях инструктора`,
				alignment: 'right',
			},
			{
				text: `выношу окончательный вердикт насчет «${data.reason.cipher}-${data.reason.number} ${data.reason.description}» ${durationText}`,
				alignment: 'justify',
				margin: [0, 0, 0, 20],
			},
			{
				text: `Кому выдается: ${cleanRankName(recipient.rank?.name)} ${
					recipient.username
				}`,
				margin: [16, 0, 0, 10],
			},
			{ text: 'Обоснование:', bold: true, margin: [16, 10, 0, 5] },
			{ text: plainDescription, alignment: 'justify', margin: [0, 0, 0, 30] },
			{ text: role, alignment: 'left', margin: [0, 10, 0, 0] },
			{
				columns: [
					{
						text: `${cleanRankName(creator.rank?.name) || 'Звание'}`,
						width: '50%',
					},
					{
						stack: [{ text: creator.username, alignment: 'right' }],
						width: '50%',
					},
				],
				columnGap: 10,
				margin: [0, 10, 0, 0],
			},
			{
				text: startDate.format('DD.MM.YY'),
				alignment: 'left',
				margin: [0, 10, 0, 0],
			},
		],
		defaultStyle: { font: 'Roboto', fontSize: 14 },
		styles: {
			header: {
				fontSize: 18,
				bold: true,
			},
		},
	}

	return new Promise(resolve => {
		pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
			resolve(blob)
		})
	})
}
