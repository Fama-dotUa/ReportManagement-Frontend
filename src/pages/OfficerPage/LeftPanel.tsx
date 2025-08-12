import React from 'react'
import dayjs from 'dayjs'
import './OfficerPage.css'

import { getReportFileUrl } from '../../hooks/getReportFileUrl'
import { useReports } from '../../hooks/useReports'

const handlePreview = async (reportId: number) => {
	const url = await getReportFileUrl(reportId)
	if (url) {
		window.open(url, '_blank')
	} else {
		alert('PDF не найден')
	}
}

const LeftPanel: React.FC = () => {
	const { data: reports, isLoading } = useReports()
	if (isLoading) {
		return (
			<div className='left-panel'>
				<h3>Последние рапорты</h3>
				<p>Загрузка...</p>
			</div>
		)
	}

	return (
		<div className='left-panel'>
			<h3>Последние рапорты</h3>
			<ul className='reports-list'>
				{reports?.map(report => (
					<li key={report.id}>
						<button onClick={() => handlePreview(report.id)}>
							{report.username} — {report.reasonCipher}-{report.reasonNumber}
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
