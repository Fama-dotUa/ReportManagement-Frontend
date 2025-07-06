import React, { useState } from 'react'
import SoldierList from './SoldierList'
import './CenterPanel.css'
import { FaEye, FaDownload } from 'react-icons/fa'
import { useReportsBySoldier } from '../../hooks/useReportsBySoldier'
import dayjs from 'dayjs'

const AllSoldiers: React.FC = () => {
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const { reports, loading, error } = useReportsBySoldier(selectedId)

	const formatTitle = (r: any) => {
		const created = dayjs(r.createdAt).format('DD.MM.YY HH:mm:ss')
		const time =
			r.time_to_free === 0
				? 'Бессрочно'
				: `Активно еще ${
						r.time_to_free - dayjs().diff(dayjs(r.createdAt), 'day')
				  } дн.`

		return `${r.reason.cipher}-${r.reason.number} | ${r.reason.description} | ${time} ${created}`
	}

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
								const isActive = r.time_to_free !== 0
								return (
									<li
										key={r.id}
										className={`report-item ${isActive ? 'active-report' : ''}`}
									>
										<span className='index'>#{idx + 1}</span>
										<span className='title'>{formatTitle(r)}</span>
										<div className='actions'>
											<button title='Предпросмотр' disabled>
												<FaEye className='eye' />
											</button>
											<button title='Скачать' disabled>
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
