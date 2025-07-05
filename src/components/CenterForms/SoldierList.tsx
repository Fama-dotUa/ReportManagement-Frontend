import React from 'react'
import './SoldierList.css'

export interface Soldier {
	id: string
	name: string
	tag: string
}

interface Props {
	soldiers: Soldier[]
	selectedId: string | null
	onSelect: (id: string) => void
}

const SoldierList: React.FC<Props> = ({ soldiers, selectedId, onSelect }) => {
	return (
		<div className='soldier-list'>
			<input
				type='text'
				placeholder='Поиск солдата...'
				className='search-input'
			/>
			<ul>
				{soldiers.map(s => (
					<li key={s.id}>
						<button
							className={selectedId === s.id ? 'active' : ''}
							onClick={() => onSelect(s.id)}
						>
							{`${s.name} | @${s.tag}`}
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}

export default SoldierList
