import React, { useEffect, useState } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import { useAuth } from '../../hooks/useAuth'
import './OfficerPage.css'
import { getReportFileUrl } from '../../hooks/getReportFileUrl'

const handlePreview = async (reportId: number) => {
	const url = await getReportFileUrl(reportId)
	if (url) {
		window.open(url, '_blank')
	} else {
		alert('PDF не найден')
	}
}

interface Report {
	id: number
	createdAt: string
	reasonNamber: number
	username: string
}

const LeftPanel: React.FC = () => {
	const [reports, setReports] = useState<Report[]>([])
	const { token } = useAuth()
	useEffect(() => {
		const fetchReports = async () => {
			const date = dayjs().subtract(3, 'day').startOf('day').toISOString()

			const res = await axios.get(
				`${import.meta.env.VITE_API_URL}/api/reports`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
					params: {
						'filters[createdAt][$gte]': date,
						'sort[0]': 'createdAt:desc',
						'populate[user]': true,
						'populate[reason]': true,
					},
				}
			)
			const reportsData = res.data.data.map((item: any) => ({
				id: item.id,
				createdAt: item.createdAt,
				reasonNamber: item.reason?.number || 0,
				username: item.user.username,
			}))
			setReports(reportsData)
		}

		fetchReports()
	}, [])

	return (
		<div className='left-panel'>
			<h3>Последние рапорты</h3>
			<ul className='reports-list'>
				{reports.map(report => (
					<li key={report.id}>
						<button onClick={() => handlePreview(report.id)}>
							{report.username} — {report.reasonNamber}
							<br />
							{dayjs(report.createdAt).format('DD.MM.YYYY HH:mm')}
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}

export default LeftPanel
