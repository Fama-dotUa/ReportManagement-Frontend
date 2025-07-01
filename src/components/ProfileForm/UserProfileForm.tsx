// Обновлённый компонент UserProfileForm — визуальный слой, логика вынесена в хук
import React from 'react'
import './UserProfileForm.css'
import { useUserProfileForm } from './useUserProfileForm'
import type { User } from '../../types/User'

const UserProfileForm: React.FC<{
	user: User
	editable?: boolean
	onSubmit?: (u: User) => void
	onClose: () => void
}> = ({ user, editable = true, onSubmit, onClose }) => {
	const {
		formData,
		changed,
		handleClose,
		handleSubmit,
		renderTextField,
		renderSelectField,
		renderRoleField,
		ranks,
	} = useUserProfileForm(user, editable, onSubmit, onClose)
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
					<img src={formData.icon} alt='avatar' className='avatar-img' />
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
		</form>
	)
}

export default UserProfileForm
