import React from 'react'
import dayjs from 'dayjs'
import type { TrainingRequest } from '../../../hooks/useTrainingRequests'
import './BriefingRequestItem.css'

interface Props {
	request: TrainingRequest
	onClick: () => void
}

const getStatusStyle = (status: TrainingRequest['status_request']) => {
	const style: { background: string; watermark?: string } = {
		background: '#f0f2f5',
	}
	switch (status) {
		case 'рассматривается':
			style.background = 'var(--background-gradient-1)'
			break
		case 'обучается':
			style.background = 'var(--background-gradient-2)'
			break
		case 'обучен':
			style.background = 'var(--background-gradient-3)'
			style.watermark = 'ОБУЧЕН'
			break
		case 'отклонён':
			style.background = 'var(--background-gradient-4)'
			style.watermark = 'ОТКЛОНЕНО'
			break
		case 'провалено':
			style.background = 'var(--background-gradient-5)'
			style.watermark = 'ПРОВАЛЕНО'
			break
		case 'халтура начальства':
			style.background = 'var(--background-gradient-6)'
			style.watermark = 'ХАЛТУРА'
			break
	}
	return style
}

const BriefingRequestItem: React.FC<Props> = ({ request, onClick }) => {
	const { background, watermark } = getStatusStyle(request.status_request)

	return (
		<div className='briefing-item' style={{ background }} onClick={onClick}>
			{watermark && <div className='watermark'>{watermark}</div>}
			<div className='header'>
				<span>{request.applicant.username}</span>
				<span>{dayjs(request.createdAt).format('DD.MM.YYYY')}</span>
			</div>
			<div className='body'>
				<p>{request.position.name}</p>
			</div>
			<div className='footer'>Статус: {request.status_request}</div>
		</div>
	)
}

export default BriefingRequestItem
