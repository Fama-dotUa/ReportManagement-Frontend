import React, { use, useState } from 'react'
import { FaPencilAlt } from 'react-icons/fa'
import { IoCloseSharp } from 'react-icons/io5'
import './UserProfileForm.css'
import AvatarUploadModal from '../AvatarUploadModal'
import { useUserProfileForm } from './useUserProfileForm'
import { RiLockPasswordFill } from 'react-icons/ri'
import { useUsers } from '../../hooks/useUsers'
import type { User } from '../../types/User'
import ChangePasswordModal from '../ChangePassword/ChangePasswordModal'
import { IoIosInformationCircleOutline } from 'react-icons/io'
import ProfileInfoPanel from '../ProfileInfoPanel/ProfileInfoPanel'
import { useAuth } from '../../hooks/useAuth'
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
	const { token } = useAuth()
	const [editOk, setEditOk] = useState(false)
	const [showAvatarModal, setShowAvatarModal] = useState(false)
	const [showPasswordModal, setShowPasswordModal] = useState(false)
	const [showInfoPanel, setShowInfoPanel] = useState(false)
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

	const handlePasswordChange = async (currentPass: string, newPass: string) => {
		const token = localStorage.getItem('jwt')
		const res = await fetch(
			`${import.meta.env.VITE_API_URL}/api/auth/change-password`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					currentPassword: currentPass,
					password: newPass,
					passwordConfirmation: newPass,
				}),
			}
		)
		const data = await res.json()
		if (res.ok) {
			alert('Пароль успешно изменён')
			return true
		} else {
			alert(data.error?.message || 'Ошибка смены пароля')
			return false
		}
	}
	const handleEditDescription = async (newDescription: any) => {
		if (!token || !user?.id) {
			alert('Ошибка: Пользователь не авторизован или ID не найден.')
			return
		}

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/users/${user.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						Description: newDescription,
					}),
				}
			)

			if (!response.ok) {
				throw new Error('Ошибка при сохранении описания.')
			}
			alert('Описание успешно сохранено!')
		} catch (error) {
			console.error('Ошибка сохранения:', error)
			alert('Не удалось сохранить описание. Попробуйте еще раз.')
		}
	}

	console.log('UserProfileForm rendered with user:', user)
	return (
		<>
			<form onSubmit={handleSubmit} className='user-profile-form'>
				{(editable || isSelf) && (
					<button
						type='button'
						className='edit-button fixed'
						title='Редактировать профиль'
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
						title='Изменить пароль'
						onClick={() => setShowPasswordModal(true)}
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
						<button
							type='button'
							id='info-button'
							onClick={() => setShowInfoPanel(!showInfoPanel)}
						>
							<IoIosInformationCircleOutline />
						</button>
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

			{showPasswordModal && (
				<ChangePasswordModal
					onClose={() => setShowPasswordModal(false)}
					onSubmit={handlePasswordChange}
				/>
			)}

			{showInfoPanel && (
				<div
					className='info-panel-overlay'
					onClick={() => setShowInfoPanel(false)}
				>
					<div
						className='info-panel-container'
						onClick={e => e.stopPropagation()}
					>
						<ProfileInfoPanel
							soldierDescription={user.Description || ''}
							onEdit={handleEditDescription}
							onClose={() => setShowInfoPanel(false)}
						/>
					</div>
				</div>
			)}
		</>
	)
}

export default UserProfileForm
