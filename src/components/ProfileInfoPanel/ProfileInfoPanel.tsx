// ProfileInfoPanel.tsx
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './ProfileInfoPanel.css'
import { useAuth } from '../../hooks/useAuth'
import { IoCloseSharp } from 'react-icons/io5'
import { FaPencilAlt } from 'react-icons/fa'

interface InfoPanelProps {
	soldierDescription: string
	onEdit: (newDescription: string) => void
	onClose: () => void
}

const ProfileInfoPanel: React.FC<InfoPanelProps> = ({
	soldierDescription,
	onEdit,
	onClose,
}) => {
	const { role } = useAuth()
	const isGeneral =
		role && ['officer', 'general', 'comander-officer'].includes(role)
	const [isEditing, setIsEditing] = useState(false)
	const [editedText, setEditedText] = useState(soldierDescription)

	const handleEditClick = () => {
		setIsEditing(true)
	}

	const handleSaveClick = () => {
		onEdit(editedText)
		setIsEditing(false)
	}

	const handleCancelClick = () => {
		setEditedText(soldierDescription)
		setIsEditing(false)
	}

	return (
		<div className='info-panel'>
			<div className='info-panel-header'>
				<h2>Профиль</h2>
				<div className='header-buttons'>
					{isGeneral && !isEditing && (
						<button className='infopanel-button' onClick={handleEditClick}>
							<FaPencilAlt />
						</button>
					)}
					<button className='infopanel-button' onClick={onClose}>
						<IoCloseSharp />
					</button>
				</div>
			</div>
			<div className='info-panel-content'>
				{isEditing ? (
					<textarea
						className='edit-textarea'
						value={editedText}
						onChange={e => setEditedText(e.target.value)}
					/>
				) : (
					<ReactMarkdown>{soldierDescription}</ReactMarkdown>
				)}
				{isEditing && (
					<div className='info-panel-actions'>
						<button className='save-button' onClick={handleSaveClick}>
							Сохранить
						</button>
						<button className='cancel-button' onClick={handleCancelClick}>
							Отмена
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default ProfileInfoPanel
