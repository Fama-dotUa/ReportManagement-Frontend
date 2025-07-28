import React, { useState } from 'react'
import { FaPencilAlt } from 'react-icons/fa'
import { IoCloseSharp } from 'react-icons/io5'
import './UserProfileForm.css'
import AvatarUploadModal from '../AvatarUploadModal'
import { useUserProfileForm } from './useUserProfileForm'
import { RiLockPasswordFill } from 'react-icons/ri'
import { useUsers } from '../../hooks/useUsers'
import type { User } from '../../types/User'

type Props = {
	user: User
	editable?: boolean
	onSubmit?: (u: User) => void
	onClose: () => void
}

const UserProfileForm: React.FC<Props> = ({
	user,
	editable,
	onSubmit,
	onClose,
}) => {
	const { currentUserId } = useUsers()
	const [editOk, setEditOk] = useState(false)
	const [showAvatarModal, setShowAvatarModal] = useState(false)

	const {
		formData,
		changed,
		handleClose,
		handleSubmit,
		renderTextField,
		renderSelectField,
		renderRoleField,
		ranks,
		isSelf,
		tempIcon,
		applyTempIcon,
		resetForm,
		enableAllEdits,
	} = useUserProfileForm(
		user,
		editable,
		onSubmit,
		onClose,
		currentUserId ?? undefined
	)

	return (
		<form onSubmit={handleSubmit} className='user-profile-form'>
			{(editable || isSelf) && (
				<button
					type='button'
					className='edit-button fixed'
					onClick={async () => {
						if (!editOk) {
							setEditOk(true)
							enableAllEdits()
						} else {
							if (changed) {
								const confirm = window.confirm(
									'Вы внесли изменения. Они будут потеряны. Продолжить?'
								)
								if (!confirm) return
							}
							setEditOk(false)
							resetForm()
						}
					}}
				>
					<FaPencilAlt />
				</button>
			)}
			{isSelf && (
				<button
					type='button'
					className='edit-password-button fixed'
					onClick={() => {
						// Замени на открытие модалки или переход
						alert('Открытие окна смены пароля')
					}}
				>
					<RiLockPasswordFill />
				</button>
			)}

			<button
				type='button'
				className='close-button fixed'
				onClick={handleClose}
			>
				<IoCloseSharp />
			</button>
			<div className='form-grid'>
				<div className='avatar-block'>
					<div className='avatar-block'>
						<img
							src={tempIcon || formData.icon || '/default-avatar.png'}
							alt='avatar'
							className='avatar-img'
							loading='lazy'
						/>

						{editOk && (
							<button
								type='button'
								id='edit-avatar-button'
								onClick={() => setShowAvatarModal(true)}
							>
								<FaPencilAlt />
							</button>
						)}
					</div>
				</div>
				<div className='info-block'>
					{renderTextField('', 'username', 'username')}
					{renderTextField('', 'discord', 'discord')}
					{renderSelectField('Звание:', 'rank', ranks)}
					{renderRoleField()}
				</div>
			</div>
			{editOk && (
				<button type='submit' disabled={!changed}>
					Сохранить
				</button>
			)}
			{showAvatarModal && (
				<AvatarUploadModal
					initialImage={tempIcon || formData.icon}
					onClose={() => setShowAvatarModal(false)}
					onApply={(file, preview) => {
						applyTempIcon(file, preview)
						setShowAvatarModal(false)
					}}
				/>
			)}
		</form>
	)
}

export default UserProfileForm
