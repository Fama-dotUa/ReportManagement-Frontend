import React, { useState } from 'react'
import SoldierList from './SoldierList'
import './CenterPanel.css'
import MDEditor from '@uiw/react-md-editor'

const ReportForm: React.FC = () => {
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [reason, setReason] = useState('')
	const [days, setDays] = useState('')
	const [value, setValue] = useState<string | undefined>('**Текст рапорта**')

	return (
		<div className='center'>
			<SoldierList selectedId={selectedId} onSelect={setSelectedId} />
			<div className='center-panel report-form'>
				<h3>Создание рапорта</h3>

				{!selectedId && (
					<p className='placeholder'>Сначала выберите солдата слева</p>
				)}

				{selectedId && (
					<>
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

						<div className='form-group description'>
							<label>Описание</label>
							<div data-color-mode='dark'>
								<MDEditor value={value} onChange={setValue} height={300} />
							</div>
						</div>
						<button className='submit-btn'>Добавить рапорт</button>
					</>
				)}
			</div>
		</div>
	)
}

export default ReportForm
