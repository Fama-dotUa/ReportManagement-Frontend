import React, { useState } from 'react'
import SoldierList from './SoldierList'
import './CenterPanel.css'
import { FaEye, FaDownload } from 'react-icons/fa'

const dummyReports = [
	{ id: 'r1', title: 'Нарушение порядка' },
	{ id: 'r2', title: 'Неявка на построение' },
	{ id: 'r3', title: 'Самовольная отлучка' },
]

const AllSoldiers: React.FC = () => {
	const [selectedId, setSelectedId] = useState<string | null>(null)

	return (
		<div className='center'>
			<SoldierList selectedId={selectedId} onSelect={setSelectedId} />
			<div className='center-panel'>
				<h3>Рапорты</h3>
				{selectedId ? (
					<ul className='report-list'>
						{dummyReports.map((r, idx) => (
							<li key={r.id} className='report-item'>
								<span className='index'>#{idx + 1}</span>
								<span className='title'>{r.title}</span>
								<div className='actions'>
									<button title='Предпросмотр'>
										<FaEye className='eye' />
									</button>
									<button title='Скачать'>
										<FaDownload className='download' />
									</button>
								</div>
							</li>
						))}
					</ul>
				) : (
					<p className='placeholder'>Выберите солдата слева</p>
				)}
			</div>
		</div>
	)
}

export default AllSoldiers
