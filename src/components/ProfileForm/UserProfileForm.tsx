import React, { useEffect, useState } from 'react'
import { FaPencilAlt } from 'react-icons/fa'
import './UserProfileForm.css'
import AvatarUploadModal from './AvatarUploadModal'
import { useUserProfileForm } from './useUserProfileForm'
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
		tempIcon,
		applyTempIcon,
	} = useUserProfileForm(
		user,
		editable,
		onSubmit,
		onClose,
		currentUserId ?? undefined
	)

	return (
		<form onSubmit={handleSubmit} className='user-profile-form'>
			<button
				type='button'
				className='close-button fixed'
				onClick={handleClose}
			>
				×
			</button>
			<div className='form-grid'>
				<div className='avatar-block'>
					<div className='avatar-block'>
						<div style={{ position: 'relative' }}>
							<img
								src={tempIcon || formData.icon}
								alt='avatar'
								className='avatar-img'
							/>
							{editable && (
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
				</div>
				<div className='info-block'>
					{renderTextField('', 'username', 'username')}
					{renderTextField('', 'discord', 'discord')}
					{renderSelectField('Звание:', 'rank', ranks)}
					{renderRoleField()}
				</div>
			</div>
			{editable && (
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
