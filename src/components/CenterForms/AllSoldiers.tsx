import React, { useState } from 'react'
import SoldierList from './SoldierList'
import type { Soldier } from './SoldierList'
import './CenterPanel.css'

const dummySoldiers: Soldier[] = [
	{ id: '1', name: 'User 1', tag: 'wolf#2023' },
	{ id: '2', name: 'User 2', tag: 'storm#1234' },
]

const dummyReports = [
	{ id: 'r1', title: 'Нарушение порядка' },
	{ id: 'r2', title: 'Неявка на построение' },
]

const AllSoldiers: React.FC = () => {
	const [selectedId, setSelectedId] = useState<string | null>(null)

	return (
		<>
			<SoldierList
				soldiers={dummySoldiers}
				selectedId={selectedId}
				onSelect={setSelectedId}
			/>
			<div className='center-panel'>
				<h3>Рапорты солдата</h3>
				{selectedId ? (
					<ul className='report-list'>
						{dummyReports.map((r, idx) => (
							<li key={r.id} className='report-item'>
								<span className='index'>{idx + 1}.</span>
								<span className='title'>{r.title}</span>
								<div className='actions'>
									<button>👁</button>
									<button>⬇</button>
								</div>
							</li>
						))}
					</ul>
				) : (
					<p className='placeholder'>Выберите солдата слева</p>
				)}
			</div>
		</>
	)
}

export default AllSoldiers
