import React, { useState } from 'react'
import SoldierList from './SoldierList'
import type { Soldier } from './SoldierList'
import './CenterPanel.css'

const dummySoldiers: Soldier[] = [
	{ id: '1', name: 'User 1', tag: 'wolf#2023' },
	{ id: '2', name: 'User 2', tag: 'storm#1234' },
]

const ReportForm: React.FC = () => {
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [reason, setReason] = useState('')
	const [days, setDays] = useState('')
	const [description, setDescription] = useState('')

	return (
		<>
			<SoldierList
				soldiers={dummySoldiers}
				selectedId={selectedId}
				onSelect={setSelectedId}
			/>
			<div className='center-panel report-form'>
				<div className='form-group'>
					<label>Номер причины</label>
					<select value={reason} onChange={e => setReason(e.target.value)}>
						<option value=''>Выбрать...</option>
						<option value='1'>1. Нарушение</option>
						<option value='2'>2. Прогул</option>
					</select>
				</div>

				<div className='form-group'>
					<label>Срок (кол-во дней)</label>
					<input
						type='number'
						value={days}
						onChange={e => setDays(e.target.value)}
					/>
				</div>

				<div className='form-group'>
					<label>Описание</label>
					<textarea
						rows={6}
						value={description}
						onChange={e => setDescription(e.target.value)}
					/>
				</div>

				<div className='user-info'>
					{selectedId
						? `Информация о пользователе с ID: ${selectedId}`
						: 'Выберите пользователя'}
				</div>

				<button className='submit-btn'>Добавить рапорт</button>
			</div>
		</>
	)
}

export default ReportForm
