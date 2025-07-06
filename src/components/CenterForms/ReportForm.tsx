import React, { useState, useEffect } from 'react'
import SoldierList from './SoldierList'
import './CenterPanel.css'
import MDEditor from '@uiw/react-md-editor'
import { getReasons } from '../../api/getReasons'

const ReportForm: React.FC = () => {
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [reason, setReason] = useState('')
	const [days, setDays] = useState('0')
	const [value, setValue] = useState<string | undefined>('**Текст рапорта**')
	const [reasons, setReasons] = useState<{ id: number; label: string }[]>([])

	useEffect(() => {
		getReasons().then(setReasons).catch(console.error)
	}, [])

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
						<div className='form-group reason'>
							<label>Номер причины:</label>
							<select value={reason} onChange={e => setReason(e.target.value)}>
								<option value=''>Выбрать...</option>
								{reasons.map(r => (
									<option key={r.id} value={r.id}>
										{r.label}
									</option>
								))}
							</select>
						</div>

						<div className='form-group term'>
							<label>Срок:</label>
							<div className='slider-container'>
								<input
									type='range'
									min={0}
									max={30}
									step={1}
									value={Number(days)}
									onChange={e => setDays(e.target.value)}
								/>
								<span className='slider-value'>{days} дн.</span>
							</div>
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
