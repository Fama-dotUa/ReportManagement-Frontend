import React, { useState } from 'react'
import './ChangePasswordModal.css'
import { IoCloseSharp } from 'react-icons/io5'
type Props = {
	onClose: () => void
	onSubmit: (currentPassword: string, newPassword: string) => Promise<boolean>
}

const ChangePasswordModal: React.FC<Props> = ({ onClose, onSubmit }) => {
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')

	const handleSubmit = async () => {
		if (newPassword.length < 6) {
			setError('Новый пароль должен быть не менее 6 символов.')
			return
		}
		if (newPassword !== confirmPassword) {
			setError('Пароли не совпадают.')
			return
		}

		setError('')

		const success = await onSubmit(currentPassword, newPassword)
		if (success) {
			onClose()
		}
	}

	return (
		<div className='modal-overlay'>
			<div className='modal'>
				<button className='close-button' onClick={onClose}>
					<IoCloseSharp />
				</button>
				<h2>Смена пароля</h2>
				<div className='form-group'>
					<label>Текущий пароль:</label>
					<input
						type='password'
						value={currentPassword}
						onChange={e => setCurrentPassword(e.target.value)}
					/>
				</div>
				<div className='form-group'>
					<label>Новый пароль:</label>
					<input
						type='password'
						value={newPassword}
						onChange={e => setNewPassword(e.target.value)}
					/>
				</div>
				<div className='form-group'>
					<label>Подтверждение пароля:</label>
					<input
						type='password'
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
					/>
				</div>
				{error && <p className='error'>{error}</p>}
				<button className='submit-button' onClick={handleSubmit}>
					Изменить пароль
				</button>
			</div>
		</div>
	)
}

export default ChangePasswordModal
