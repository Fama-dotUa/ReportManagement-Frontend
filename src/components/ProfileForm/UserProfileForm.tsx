import React, { useState } from 'react'
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
import { LuView } from 'react-icons/lu'
import { Cosmetics } from '../CosmeticForm/Cosmetic'

type Props = {
	user_to: User
	editable?: boolean
	onSubmit?: (u: User) => void
	onClose: () => void
}

const UserProfileForm: React.FC<Props> = ({
	user_to,
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
	const [showAppearancePanel, setShowAppearancePanel] = useState(false)
	const {
		formData,
		changed,
		handleClose,
		handleSubmit,
		renderTextField,
		renderSelectField,
		renderRoleField,
		renderPositionsField,
		ranks,
		isSelf,
		tempIcon,
		applyTempIcon,
		resetForm,
		enableAllEdits,
	} = useUserProfileForm(
		user_to,
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
		if (!token || !user_to.id) {
			alert('Ошибка: Пользователь не авторизован или ID не найден.')
			return
		}

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/users/${user_to.id}`,
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

	const handleCosmeticChange = async (cosmeticData: {
		framesfor_avatar_active: number
		profile_background_active: number
		fon_schildik_active: number
	}): Promise<void> => {
		if (!token || !user_to.id) {
			alert('Ошибка: Пользователь не авторизован или ID не найден.')
			return
		}

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/users/${user_to.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(cosmeticData),
				}
			)

			if (!response.ok) {
				throw new Error('Ошибка при сохранении косметики.')
			}
			location.reload()
		} catch (error) {
			console.error('Ошибка сохранения:', error)
			alert('Не удалось сохранить косметику. Попробуйте еще раз.')
		}
	}

	return (
		<>
			<form onSubmit={handleSubmit} className='user-profile-form'>
				<img
					src={formData.profile_background_active_url}
					className='background-img-profile'
					loading='lazy'
				></img>
				<div className='profile-top-panel'>
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
					{isSelf && (
						<button
							type='button'
							className='Appearance-button fixed'
							title='Внешний вид'
							onClick={() => setShowAppearancePanel(true)}
						>
							<LuView />
						</button>
					)}
					<button
						type='button'
						className='close-button fixed'
						onClick={handleClose}
					>
						<IoCloseSharp />
					</button>
				</div>
				<div className='form-grid'>
					<div className='profile-container'>
						<div className='avatar-wrapper'>
							<img
								src={tempIcon || formData.icon || '/default-avatar.png'}
								alt='avatar'
								className='avatar-img'
								loading='lazy'
							/>

							<img
								src={user_to.framesfor_avatar_active_url}
								alt='avatar frame'
								className='profile-frame'
								loading='lazy'
							/>

							{editOk && (
								<button
									type='button'
									className='edit-avatar-button'
									onClick={() => setShowAvatarModal(true)}
								>
									<FaPencilAlt />
								</button>
							)}
						</div>

						<div className='info-button-wrapper'>
							<button
								type='button'
								className='info-button'
								onClick={() => setShowInfoPanel(!showInfoPanel)}
							>
								<IoIosInformationCircleOutline />
							</button>

							<img
								src={user_to.framesfor_avatar_active_url}
								alt='хуй'
								className='profile-frame'
								loading='lazy'
							/>
						</div>
					</div>
					<div className='info-block'>
						{renderTextField('', 'username', 'username')}
						{renderTextField('', 'discord', 'discord')}
						{renderSelectField('Звание:', 'rank', ranks)}
						{renderRoleField()}
						{renderPositionsField('Специализация:')}
					</div>
				</div>
				<div className='profile-bottom-medal-panel'></div>
				{editOk && (
					<button type='submit' disabled={!changed}>
						Сохранить
					</button>
				)}
			</form>

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
							soldierDescription={user_to.Description || ''}
							onEdit={handleEditDescription}
							onClose={() => setShowInfoPanel(false)}
						/>
					</div>
				</div>
			)}
			{showAppearancePanel && (
				<Cosmetics
					user={user_to}
					onClose={() => setShowAppearancePanel(false)}
					onSubmit={handleCosmeticChange}
				/>
			)}
		</>
	)
}

export default UserProfileForm
