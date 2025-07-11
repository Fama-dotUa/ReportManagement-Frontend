// Пример использования пользовательских шрифтов в useReportPreview.tsx

import { useCallback } from 'react'
import { useAuth } from './useAuth'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import { marked } from 'marked'

// Импортируем наши пользовательские шрифты
import fontConfig from '../utils/fontConfig' // Путь к сгенерированному файлу

// Применяем стандартные шрифты
;(pdfMake as any).vfs = (pdfFonts as any).vfs

// Наши шрифты уже применены автоматически при импорте fontConfig

export const useReportPreview = () => {
    const { token } = useAuth()
    
    const markdownToText = async (markdown: string) => {
        const html = await marked.parseInline(markdown)
        const temp = document.createElement('div')
        temp.innerHTML = html
        return temp.innerText
    }
    
    const previewReport = useCallback(async (reportId: string) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/reports?filters[id][$eq]=${reportId}&populate=*`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            if (!res.ok) throw new Error('Ошибка при загрузке рапорта')

            const report = await res.json()
            const data = report.data[0]
            console.log('data:', data)

            // Проверяем доступные шрифты
            console.log('Доступные шрифты:', fontConfig.getAvailableFamilies())

            const docDefinition: TDocumentDefinitions = {
                content: [
                    {
                        text: 'Командующему Главного штаба STV_sqúad, генералу dyeness',
                        alignment: 'right',
                        margin: [0, 0, 0, 40],
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
                        text: `прошу вашего решения насчет ${data.reason.cipher}-${data.reason.number} ${data.reason.description} продолжительностью ${data.duration} || c ${data.startDate} по ${data.endDate}.`,
                        margin: [0, 0, 0, 20],
                        alignment: 'justify',
                    },
                    {
                        text: `Кому выдается: ${data.targetRank} ${data.targetUsername}`,
                        margin: [0, 0, 0, 10],
                    },
                    {
                        text: 'Обоснование:',
                        bold: true,
                        margin: [0, 10, 0, 5],
                    },
                    {
                        text: await markdownToText(data.description || ''),
                        margin: [0, 0, 0, 30],
                    },
                    {
                        text: `${data.issuerRank || 'Звание'}`,
                        alignment: 'left',
                        margin: [0, 10, 0, 0],
                    },
                    {
                        columns: [
                            { text: `${data.issuerPosition || 'Должность'}`, width: '50%' },
                            {
                                stack: [
                                    { text: `${data.creator.username}`, alignment: 'right' },
                                ],
                                width: '50%',
                            },
                        ],
                        columnGap: 10,
                        margin: [0, 10, 0, 0],
                    },
                    {
                        text: `${data.startDate}`,
                        alignment: 'left',
                        margin: [0, 10, 0, 0],
                    },
                ],
                defaultStyle: {
                    // Используем первый доступный пользовательский шрифт или Roboto как fallback
                    font: fontConfig.isAvailable('times') ? 'times' : 'Roboto',
                    fontSize: 14,
                },
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        // Можно указать конкретный шрифт для заголовков
                        font: 'times',
                    },
                },
            }

            pdfMake.createPdf(docDefinition).open()
        } catch (err) {
            console.error(err)
            alert('Не удалось сформировать PDF')
        }
    }, [token])

    return { previewReport }
}

// Доступные шрифты в проекте:
// // - times
// - timesbd
// - timesbi
// - timesi
