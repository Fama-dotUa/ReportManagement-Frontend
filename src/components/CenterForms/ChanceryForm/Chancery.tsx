import React, { useState, useEffect, useMemo } from 'react'
import { useTrainingRequests } from '../../../hooks/useTrainingRequests'
import BriefingRequestItem from './BriefingRequestItem'
import BriefingDetailsModal from './BriefingDetailsModal'
import type { TrainingRequest } from '../../../hooks/useTrainingRequests'

import '../CenterPanel.css'

const Chancery: React.FC = () => {
	const [activeTab, setActiveTab] = useState<
		'briefing' | 'contestation' | 'orders' | 'issue_loans'
	>('briefing')
	const [selectedRequest, setSelectedRequest] =
		useState<TrainingRequest | null>(null)

	const { data: allRequests, isLoading } = useTrainingRequests()
	const hasNewBriefings = useMemo(
		() => allRequests?.some(req => req.status_request === 'рассматривается'),
		[allRequests]
	)
	const handleRequestClick = (request: TrainingRequest) => {
		if (
			request.status_request === 'рассматривается' ||
			request.status_request === 'обучается'
		) {
			setSelectedRequest(request)
		}
	}
	return (
		<div className='center-chancery'>
			<div className='center-header'>
				<button
					className={
						activeTab === 'briefing'
							? 'center-header-button active'
							: 'center-header-button'
					}
					onClick={() => setActiveTab('briefing')}
				>
					Запросы на инструктаж
					{hasNewBriefings && <span className='notification-dot'></span>}
				</button>
				<button
					className={
						activeTab === 'contestation'
							? 'center-header-button active'
							: 'center-header-button'
					}
					disabled
					onClick={() => setActiveTab('contestation')}
				>
					Рапорты на оспаривание
				</button>
				<button
					className={
						activeTab === 'orders'
							? 'center-header-button active'
							: 'center-header-button'
					}
					disabled
					onClick={() => setActiveTab('orders')}
				>
					Выдать приказ
				</button>
				<button
					className={
						activeTab === 'issue_loans'
							? 'center-header-button active'
							: 'center-header-button'
					}
					disabled
					onClick={() => setActiveTab('issue_loans')}
				>
					Выдать кредиты
				</button>
			</div>

			<div className='chancery-content'>
				{isLoading && <p>Загрузка запросов...</p>}
				{activeTab === 'briefing' && (
					<div className='briefing-list'>
						{allRequests?.map(request => (
							<BriefingRequestItem
								key={request.documentId}
								request={request}
								onClick={() => handleRequestClick(request)}
							/>
						))}
					</div>
				)}
			</div>

			{selectedRequest && (
				<BriefingDetailsModal
					request={selectedRequest}
					onClose={() => setSelectedRequest(null)}
				/>
			)}
		</div>
	)
}

export default Chancery
