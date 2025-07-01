import React, { useState } from 'react'
import './UserProfileForm.css'

import type { User } from '../../types/User'

type Props = {
	user: User
	editable?: boolean
	onSubmit?: (updated: User) => void
}

const UserProfileForm: React.FC<Props> = ({
	user,
	editable = false,
	onSubmit,
}) => {
	const [formData, setFormData] = useState<User>(user)

	const handleChange = (field: keyof User, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (onSubmit) {
			onSubmit(formData)
		}
	}

	return (
		<form onSubmit={handleSubmit} className='user-profile-form'>
			<div className='form-grid'>
				{/* Левая колонка */}
				<div className='avatar-block'>
					<img src={formData.icon} alt='avatar' className='avatar-img' />
					{editable && (
						<input
							type='text'
							value={formData.icon || ''}
							onChange={e => handleChange('icon', e.target.value)}
							placeholder='Ссылка на иконку'
						/>
					)}
				</div>

				{/* Правая колонка */}
				<div className='info-block'>
					<div className='field-row'>
						<label>Ник:</label>
						{editable ? (
							<input
								type='text'
								value={formData.username}
								onChange={e => handleChange('username', e.target.value)}
							/>
						) : (
							<p>{formData.username}</p>
						)}
					</div>

					<div className='field-row'>
						<label>Discord:</label>
						{editable ? (
							<input
								type='text'
								value={formData.discord}
								onChange={e => handleChange('discord', e.target.value)}
							/>
						) : (
							<p>@{formData.discord}</p>
						)}
					</div>

					<div className='field-row'>
						<label>Звание:</label>
						{editable ? (
							<input
								type='text'
								value={formData.rank || ''}
								onChange={e => handleChange('rank', e.target.value)}
							/>
						) : (
							<p>{formData.rank || '—'}</p>
						)}
					</div>

					<div className='field-row'>
						<label>Роль:</label>
						{editable ? (
							<input
								type='text'
								value={formData.role || ''}
								onChange={e => handleChange('role', e.target.value)}
							/>
						) : (
							<p>{formData.role || '—'}</p>
						)}
					</div>
				</div>
			</div>

			{editable && <button type='submit'>Сохранить</button>}
		</form>
	)
}

export default UserProfileForm
