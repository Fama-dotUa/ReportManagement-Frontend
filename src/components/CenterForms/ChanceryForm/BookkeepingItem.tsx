import React from 'react'
import dayjs from 'dayjs'
import type { BookkeepingEntry } from '../../../hooks/useBookkeeping' // Импортируем тип
import './BookkeepingItem.css' // Создадим этот файл со стилями

interface Props {
	entry: BookkeepingEntry
}

const BookkeepingItem: React.FC<Props> = ({ entry }) => {
	const isIssue = entry.type === 'выдача'

	const cardClassName = `bookkeeping-item ${isIssue ? 'issue' : 'collect'}`

	const handleItemClick = () => {
		alert(`Описание транзакции:\n\n${entry.description || 'Без описания'}`)
	}

	return (
		<div className={cardClassName} onClick={handleItemClick}>
			<div className='bookkeeping-header'>
				<span>{dayjs(entry.createdAt).format('DD.MM.YYYY HH:mm')}</span>
				<span className='label'>Кто: {entry.boss.username}</span>
				<span className='label'>Кому:{entry.soldier.username}</span>
				<span className='sum'>
					{isIssue ? '+' : '-'}
					{entry.sum} CR
				</span>
			</div>
		</div>
	)
}

export default BookkeepingItem
