import React, { useState } from 'react'
import SoldierList from './SoldierList'
import './CenterPanel.css'
import MDEditor from '@uiw/react-md-editor'
import { useReasons } from '../../hooks/useReasons'
import { useCreateReport } from '../../hooks/useCreateReport'
import { useAuth } from '../../hooks/useAuth'
import { generatePdfBlob } from '../../hooks/generatePdfBlob'

const ReportForm: React.FC = () => {
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [reason, setReason] = useState('')
	const [days, setDays] = useState('0')
	const [value, setValue] = useState<string | undefined>('**Текст рапорта**')
	const { user, token } = useAuth()
	const { data: reasons = [], isLoading: reasonsLoading } = useReasons()
	const { mutateAsync: createReport, isPending: creating } = useCreateReport()

	const handleSubmit = async () => {
		if (!selectedId || !user) return
		try {
			const report = await createReport({
				userId: selectedId,
				reasonId: Number(reason),
				days: Number(days),
				description: value || '',
				creatorId: user?.id || 'unknown',
			})
			const reportId = report.id
			const pdfBlob = await generatePdfBlob(reportId, token || '')

			const formData = new FormData()
			formData.append('files', pdfBlob, `report-${reportId}.pdf`)
			formData.append('ref', 'api::report.report')
			formData.append('refId', reportId)
			formData.append('field', 'file')
			formData.append('source', 'upload')

			await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			})

			alert('Рапорт успешно создан')
			setSelectedId(null)
			setReason('')
			setDays('0')
			setValue('**Текст рапорта**')
		} catch (e) {
			console.error(e)
			alert('Ошибка при создании рапорта')
		}
	}

	return (
		<div className='center'>
			<SoldierList selectedId={selectedId} onSelect={id => setSelectedId(id)} />

			<div className='center-panel report-form'>
				{selectedId ? (
					<>
						<div className='form-group reason'>
							<label>Причина</label>
							<select
								value={reason}
								onChange={e => setReason(e.target.value)}
								disabled={reasonsLoading}
							>
								<option value='' disabled>
									Выберите причину
								</option>
								{reasons.map((r: any) => (
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

						<button
							className='submit-btn'
							onClick={handleSubmit}
							disabled={creating}
						>
							{creating ? 'Сохранение...' : 'Добавить рапорт'}
						</button>
					</>
				) : (
					<p className='placeholder'></p>
				)}
			</div>
		</div>
	)
}

export default ReportForm
