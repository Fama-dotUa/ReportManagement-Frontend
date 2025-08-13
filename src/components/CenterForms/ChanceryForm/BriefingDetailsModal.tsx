import React from 'react'
import dayjs from 'dayjs'
import { useAuth } from '../../../hooks/useAuth'
import { useUpdateTrainingRequest } from '../../../hooks/useUpdateTrainingRequest'
import type { TrainingRequest } from '../../../hooks/useTrainingRequests'
import './BriefingDetailsModal.css'

interface Props {
	request: TrainingRequest
	onClose: () => void
}

const BriefingDetailsModal: React.FC<Props> = ({ request, onClose }) => {
	const { user: currentUser } = useAuth()
	const { mutate: updateRequest, isPending } = useUpdateTrainingRequest()

	const handleTakeRequest = () => {
		if (!currentUser) return
		updateRequest(
			{
				requestId: request.documentId,
				data: {
					status_request: 'обучается',
					instructor: currentUser.id,
				},
			},
			{ onSuccess: onClose }
		)
	}

	const handleRejectRequest = () => {
		const reason = prompt('Укажите причину отклонения:')
		if (reason) {
			updateRequest(
				{
					requestId: request.documentId,
					data: { status_request: 'отклонён', rejection_reason: reason },
				},
				{ onSuccess: onClose }
			)
		}
	}

	//... другие хендлеры для кнопок "Провален" и "Завершить"

	const renderContent = () => {
		switch (request.status_request) {
			case 'рассматривается':
				return (
					<>
						<div className='modal-info'>
							<div id='position-description'>
								<h3>{request.position.name}</h3>
								<p>{request.position.description}</p>
							</div>
							<p>
								<strong>Отправлена:</strong>{' '}
								{dayjs(request.createdAt).format('DD.MM.YYYY HH:mm')}
							</p>
							<p>
								<strong>Ученик:</strong> {request.applicant.username}
							</p>
						</div>
						<div className='modal-actions'>
							<button
								id='take_on'
								onClick={handleTakeRequest}
								disabled={isPending}
							>
								Взяться за обучение
							</button>
							<button
								id='danger'
								onClick={handleRejectRequest}
								disabled={isPending}
							>
								Отклонить
							</button>
						</div>
					</>
				)
			case 'обучается':
			// Похожая логика, но другие кнопки
			// ...
			case 'отклонён':
			case 'провалено':
				return (
					<div className='modal-info'>
						<p>
							<strong>Причина:</strong> {request.rejection_reason}
						</p>
					</div>
				)
			default:
				return null
		}
	}

	return (
		<div className='modal-overlay' onClick={onClose}>
			<div
				className='modal-content modal-content-briefing'
				onClick={e => e.stopPropagation()}
			>
				<button className='close-button' onClick={onClose}>
					×
				</button>
				<h2>Запрос на обучение</h2>
				{renderContent()}
			</div>
		</div>
	)
}

export default BriefingDetailsModal
