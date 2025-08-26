import React, { useState, useMemo } from 'react'
import { useTrainingRequests } from '../../../hooks/useTrainingRequests'
import BriefingRequestItem from './BriefingRequest/BriefingRequestItem'
import BriefingDetailsModal from './BriefingRequest/BriefingDetailsModal'
import type { TrainingRequest } from '../../../hooks/useTrainingRequests'

import '../CenterPanel.css'
import { useAuth } from '../../../hooks/useAuth'
import { useBookkeeping } from '../../../hooks/useBookkeeping'
import CreditTransactionForm from './IssueCreditsForm/CreditTransactionForm'
import BookkeepingItem from './BookkeepingItem'

const Chancery: React.FC = () => {
	const { role } = useAuth()
	const [activeTab, setActiveTab] = useState<
		| 'briefing'
		| 'contestation'
		| 'orders'
		| 'issue_loans'
		| 'issue_loans_give'
		| 'issue_loans_collect'
		| 'bookkeeping'
		| 'awards'
	>('briefing')
	const [selectedRequest, setSelectedRequest] =
		useState<TrainingRequest | null>(null)

	const { data: allRequests } = useTrainingRequests()
	const { data: bookkeepingEntries, isLoading: isLoadingBookkeeping } =
		useBookkeeping()

	const hasNewBriefings = useMemo(
		() => allRequests?.some(req => req.status_request === 'рассматривается'),
		[allRequests]
	)
	const handleRequestClick = (request: TrainingRequest) => {
		if (
			request.status_request === 'рассматривается' ||
			request.status_request === 'обучается' ||
			request.status_request === 'отклонён'
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
				{role === 'general' && (
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
				)}

				{role === 'general' && (
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
				)}
				{role === 'general' && (
					<button
						className={
							activeTab === 'awards'
								? 'center-header-button active'
								: 'center-header-button'
						}
						disabled
						onClick={() => setActiveTab('awards')}
					>
						Наградить
					</button>
				)}
				<button
					className={
						activeTab.startsWith('issue_loans')
							? 'center-header-button active'
							: 'center-header-button'
					}
					onClick={() => setActiveTab('issue_loans')}
				>
					Кредиты
				</button>
			</div>

			<div className='chancery-content'>
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

				{activeTab === 'issue_loans' && (
					<div className='issue_loans-container'>
						<button
							id='release-button'
							onClick={() => setActiveTab('issue_loans_give')}
						>
							Выдать кредиты
						</button>
						<button
							id='release-button'
							onClick={() => setActiveTab('bookkeeping')}
						>
							Бухгалтерия
						</button>

						{role === 'general' && (
							<button
								id='collect-button'
								onClick={() => setActiveTab('issue_loans_collect')}
							>
								Взыскать кредиты
							</button>
						)}
					</div>
				)}

				{activeTab === 'issue_loans_give' && (
					<CreditTransactionForm mode='issue' />
				)}

				{activeTab === 'issue_loans_collect' && (
					<CreditTransactionForm mode='collect' />
				)}

				{activeTab === 'bookkeeping' && (
					<div className='bookkeeping-list'>
						{isLoadingBookkeeping && <p>Загрузка журнала...</p>}
						{bookkeepingEntries?.map(entry => (
							<BookkeepingItem key={entry.id} entry={entry} />
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
