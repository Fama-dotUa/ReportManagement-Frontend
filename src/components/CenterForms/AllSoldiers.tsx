import React, { useState } from 'react'
import SoldierList from './SoldierList'
import './CenterPanel.css'
import { FaEye, FaDownload } from 'react-icons/fa'
import { useReportsBySoldier } from '../../hooks/useReportsBySoldier'

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
							{reports.map((r, idx) => (
								<li key={r.id} className='report-item'>
									<span className='index'>#{idx + 1}</span>
									<span className='title'>{r.text}</span>
									<div className='actions'>
										<button title='Предпросмотр' disabled>
											<FaEye className='eye' />
										</button>
										<button title='Скачать' disabled>
											<FaDownload className='download' />
										</button>
									</div>
								</li>
							))}
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
