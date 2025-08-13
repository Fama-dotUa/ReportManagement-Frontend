import React, { useState, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { getReasons } from '../../../api/getReasons'
import { createReport } from '../../../hooks/useCreateReport'
import { useAuth } from '../../../hooks/useAuth'
import { generateChanceryPdfBlob } from '../../../hooks/generateChanceryPdfBlob'

interface ChanceryReportFormProps {
	traineeId?: string | null
	reasonFilter?: (label: string) => boolean
	onReportCreated?: () => void
}

const ChanceryReportForm: React.FC<ChanceryReportFormProps> = ({
	traineeId = null,
	reasonFilter = null,
	onReportCreated = () => {},
}) => {
	const [reason, setReason] = useState('')
	const [days, setDays] = useState('0')
	const [value, setValue] = useState<string | undefined>('**Текст рапорта**')
	const [reasons, setReasons] = useState<{ id: number; label: string }[]>([])
	const { user, token } = useAuth()

	useEffect(() => {
		getReasons()
			.then(allReasons => {
				const filteredReasons = reasonFilter
					? allReasons.filter((r: { id: number; label: string }) =>
							reasonFilter(r.label)
					  )
					: allReasons
				setReasons(filteredReasons)
				if (filteredReasons.length > 0) {
					setReason(String(filteredReasons[0].id))
				}
			})
			.catch(console.error)
	}, [reasonFilter])

	const handleSubmit = async () => {
		const finalUserId = traineeId

		if (
			!finalUserId ||
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
			const report = await createReport({
				userId: finalUserId,
				reasonId: Number(reason),
				days: Number(days),
				description: value,
				creatorId: user?.id || 'unknown',
			})
			const reportId = report.id
			const pdfBlob = await generateChanceryPdfBlob(
				String(reportId),
				token || ''
			)

			const formData = new FormData()
			formData.append('files', pdfBlob, `report-${reportId}.pdf`)
			formData.append('ref', 'api::report.report')
			formData.append('refId', String(reportId))
			formData.append('field', 'file')
			formData.append('source', 'upload')

			await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			})

			alert('Рапорт успешно создан и прикреплён как PDF!')
			// 5. Вызываем колбэк после успеха
			onReportCreated()
		} catch (err: any) {
			console.error(err)
			alert(`Ошибка: ${err.message}`)
		}
	}

	return (
		<div className='center'>
			<div className='center-panel report-form'>
				<h3>Создание рапорта</h3>
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
			</div>
		</div>
	)
}

export default ChanceryReportForm
