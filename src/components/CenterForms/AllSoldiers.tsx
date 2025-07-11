import React, { useState } from 'react'
import SoldierList from './SoldierList'
import './CenterPanel.css'
import { FaEye, FaDownload } from 'react-icons/fa'
import { useReportsBySoldier } from '../../hooks/useReportsBySoldier'
import { getReportFileUrl } from '../../hooks/getReportFileUrl'

import dayjs from 'dayjs'
const handlePreview = async (reportId: number) => {
	const url = await getReportFileUrl(reportId)
	if (url) {
		window.open(url, '_blank')
	} else {
		alert('PDF не найден')
	}
}

const handleDownload = async (reportId: number) => {
	const url = await getReportFileUrl(reportId)
	if (!url) return alert('Файл не найден')

	try {
		const res = await fetch(url)
		const blob = await res.blob()

		const blobUrl = window.URL.createObjectURL(
			new Blob([blob], { type: 'application/octet-stream' }) // 👈 ключ
		)

		const link = document.createElement('a')
		link.href = blobUrl
		link.download = `report-${reportId}.pdf`
		link.style.display = 'none'

		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		window.URL.revokeObjectURL(blobUrl)
	} catch (err) {
		alert('Ошибка при скачивании PDF')
		console.error(err)
	}
}

const AllSoldiers: React.FC = () => {
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const { reports, loading, error } = useReportsBySoldier(selectedId)

	return (
		<div className='center'>
			<SoldierList selectedId={selectedId} onSelect={setSelectedId} />
			<div className='center-panel'>
				<h3>Рапорты</h3>
				{selectedId ? (
					loading ? (
						<p>Загрузка...</p>
					) : error ? (
						<p>{error}</p>
					) : (
						<ul className='report-list'>
							{reports.map((r, idx) => {
								const created = dayjs(r.createdAt)
								const daysPassed = dayjs().diff(created, 'day')
								const isPermanent = r.time_to_free === 0
								const isExpired = !isPermanent && daysPassed >= r.time_to_free
								const isActive = !isPermanent && !isExpired

								let statusText = 'Бессрочно'
								if (isActive) {
									const daysLeft = r.time_to_free - daysPassed
									statusText = `Активно еще ${daysLeft} дн.`
								} else if (isExpired) {
									statusText = 'Закрыт'
								}

								let statusClass = 'report-expired'
								if (isPermanent) statusClass = 'report-permanent'
								else if (isActive) statusClass = 'report-active'

								return (
									<li key={r.id} className={`report-item ${statusClass}`}>
										<span className='index'>#{idx + 1}</span>
										<span className='title'>
											<span className='cipher'>{r.reason.cipher}</span>-
											<span className='number'>{r.reason.number}</span>
											&nbsp;|&nbsp;
											<span className='description'>
												{r.reason.description}
											</span>
											&nbsp;|&nbsp;
											<span className='status-text'>{statusText}</span>&nbsp;
											<span className='timestamp'>
												{created.format('DD.MM.YY HH:mm:ss')}
												{r.creatorName && (
													<>
														&nbsp;|&nbsp;
														<span className='creator'>
															<strong>{r.creatorName}</strong>
														</span>
													</>
												)}
											</span>
										</span>
										<div className='actions'>
											<button
												onClick={() => handlePreview(r.id)}
												title='Предпросмотр'
											>
												<FaEye className='eye' />
											</button>

											<button
												onClick={() => handleDownload(r.id)}
												title='Скачать PDF'
											>
												<FaDownload className='download' />
											</button>
										</div>
									</li>
								)
							})}
						</ul>
					)
				) : (
					<p className='placeholder'>Выберите солдата слева</p>
				)}
			</div>
		</div>
	)
}

export default AllSoldiers
