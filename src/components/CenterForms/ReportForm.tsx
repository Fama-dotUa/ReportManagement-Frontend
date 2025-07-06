import React, { useState, useEffect } from 'react'
import SoldierList from './SoldierList'
import './CenterPanel.css'
import MDEditor from '@uiw/react-md-editor'
import { getReasons } from '../../api/getReasons'
import { createReport } from '../../hooks/useCreateReport'

const ReportForm: React.FC = () => {
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [reason, setReason] = useState('')
	const [days, setDays] = useState('0')
	const [value, setValue] = useState<string | undefined>('**Текст рапорта**')
	const [reasons, setReasons] = useState<{ id: number; label: string }[]>([])

	useEffect(() => {
		getReasons().then(setReasons).catch(console.error)
	}, [])
	const handleSubmit = async () => {
		if (
			!selectedId ||
			!reason ||
			!value?.trim() ||
			Number(days) < 0 ||
			Number(days) > 30
		) {
			alert('Пожалуйста, заполните все поля корректно.')
			return
		}
		const confirm = window.confirm('Нету ли ошибок в тексте?')
		if (!confirm) return

		try {
			await createReport({
				userId: selectedId,
				reasonId: Number(reason),
				days: Number(days),
				description: value,
			})
			alert('Рапорт успешно создан!')
			setReason('')
			setDays('0')
			setValue('**Текст рапорта**')
		} catch (err: any) {
			alert(`Ошибка: ${err.message}`)
		}
	}

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
								<span className='value-description'>0 → бессрочно</span>
							</div>
						</div>

						<div className='form-group description'>
							<label>Описание</label>
							<div data-color-mode='dark'>
								<MDEditor value={value} onChange={setValue} height={300} />
							</div>
						</div>
						<button className='submit-btn' onClick={handleSubmit}>
							Добавить рапорт
						</button>
					</>
				)}
			</div>
		</div>
	)
}

export default ReportForm
