import React, { useState } from 'react'
import dayjs from 'dayjs'
import { useAuth } from '../../../hooks/useAuth'
import { useUpdateTrainingRequest } from '../../../hooks/useUpdateTrainingRequest'
import type { TrainingRequest } from '../../../hooks/useTrainingRequests'
import ChanceryReportForm from './ChanceryReportForm'
import './BriefingDetailsModal.css'
import { useUpdateUserPosition } from '../../../hooks/useUpdateUserPosition'

interface Props {
	request: TrainingRequest
	onClose: () => void
}
const COMPLETING_KEYWORDS = ['обучен новой', 'повышена квали']

const FAILING_KEYWORDS = [
	'отказ от',
	'косит на дурака',
	'ведет себя как девочка',
	'потерян',
]

const BriefingDetailsModal: React.FC<Props> = ({ request, onClose }) => {
	const { user: currentUser, role } = useAuth()
	const { mutateAsync: updateRequest, isPending } = useUpdateTrainingRequest()
	const { mutateAsync: updateUserRequest } = useUpdateUserPosition()
	const [reportMode, setReportMode] = useState<'completing' | 'failing' | null>(
		null
	)

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

	// Функция, которая будет вызвана после создания рапорта
	const handleReportCreated = async () => {
		if (reportMode === 'failing') {
			updateRequest(
				{
					requestId: request.documentId,
					data: {
						status_request: 'провалено',
						rejection_reason: 'Рапорт о провале',
					},
				},
				{ onSuccess: onClose }
			)
			return
		}
		console.log(request)
		if (reportMode === 'completing') {
			try {
				const traineeId = request.applicant.id
				const instructorId = request.instructor?.id
				const positionId = request.position.id
				const positionCost = Number(request.position.CR) || 0
				const reward = Math.floor(positionCost * 0.5)

				await updateUserRequest({
					userId: traineeId,
					data: {
						positions: { connect: [positionId] },
					},
				})

				await updateUserRequest({
					userId: instructorId || 0,
					data: {
						CR: Number(request.instructor?.CR || 0) + reward,
						CR_for_all_time:
							Number(request.instructor?.CR_for_all_time || 0) + reward,
					},
				})

				await updateRequest({
					requestId: request.documentId,
					data: { status_request: 'обучен' },
				})

				alert(
					'Обучение успешно завершено! Должность присвоена, награда начислена.'
				)
				onClose()
			} catch (err: any) {
				console.error('Произошла ошибка в цепочке запросов:', err)
				alert(`Ошибка: ${err.message}. Возможно, не все данные были обновлены.`)
			}
		}
	}

	const reasonFilter = (label: string): boolean => {
		const lowerLabel = label.toLowerCase()

		if (reportMode === 'completing') {
			return COMPLETING_KEYWORDS.some(keyword =>
				lowerLabel.includes(keyword.toLowerCase())
			)
		}

		if (reportMode === 'failing') {
			return FAILING_KEYWORDS.some(keyword =>
				lowerLabel.includes(keyword.toLowerCase())
			)
		}

		return true
	}

	const renderContent = () => {
		if (reportMode) {
			return (
				<>
					<h2>Оформление рапорта</h2>
					<ChanceryReportForm
						traineeId={String(request.applicant.id)}
						reasonFilter={reasonFilter}
						onReportCreated={handleReportCreated}
					/>
				</>
			)
		}

		switch (request.status_request) {
			case 'рассматривается':
				return (
					<>
						<h2>Запрос на обучение</h2>
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

						{(role === 'general' ||
							currentUser?.positions?.some(
								(pos: { name: string }) => pos.name === 'Инструктор'
							)) && (
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
						)}
					</>
				)
			case 'обучается':
				return (
					<>
						<h2>Запрос на обучение</h2>
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
								<br />
								<strong>Инструктор:</strong> {request.instructor?.username}
							</p>
						</div>
						{request.instructor?.id === currentUser?.id && (
							<div className='modal-actions'>
								<button
									id='take_on'
									onClick={() => setReportMode('completing')}
								>
									Закончить обучение
								</button>
								<button id='danger' onClick={() => setReportMode('failing')}>
									Обучение провалено
								</button>
							</div>
						)}
					</>
				)
			case 'отклонён':
			case 'провалено':
				return (
					<>
						<h2>Итог по запросу</h2>
						<div className='modal-info'>
							<div id='position-description'>
								<p>
									<strong>Причина:</strong> {request.rejection_reason}
								</p>
							</div>
						</div>
					</>
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
				{renderContent()}
			</div>
		</div>
	)
}

export default BriefingDetailsModal
