// Обновлённый компонент UserProfileForm с отображением и редактированием системной роли (publick/officer)
import React, { useState, useEffect } from 'react'
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
import type { User } from '../../types/User'
import './UserProfileForm.css'

const ROLE_OPTIONS = [
	{ value: 'authenticated', label: 'Мясо' },
	{ value: 'officer', label: 'Дисциплинарный офицер' },
]

const API_URL = import.meta.env.VITE_API_URL

type Props = {
	user: User
	editable?: boolean
	onSubmit?: (updated: User) => void
	onClose: () => void
}

const UserProfileForm: React.FC<Props> = ({
	user,
	editable,
	onSubmit,
	onClose,
}) => {
	const [formData, setFormData] = useState<User>(user)
	const [originalData, setOriginalData] = useState<User>(user)
	const [editFields, setEditFields] = useState<{
		[key in keyof User]?: boolean
	}>({})
	const [changed, setChanged] = useState(false)
	const [ranks, setRanks] = useState<string[]>([])

	useEffect(() => {
		setChanged(JSON.stringify(formData) !== JSON.stringify(originalData))
	}, [formData, originalData])

	useEffect(() => {
		const fetchRanks = async () => {
			try {
				const res = await fetch(`${API_URL}/api/ranks?populate=*`)
				const data = await res.json()
				const rankNames = data.data.map((item: any) => item.name)
				setRanks(rankNames)
			} catch (err) {
				console.error('Ошибка при загрузке званий:', err)
			}
		}
		fetchRanks()
	}, [])

	const handleFieldChange = (field: keyof User, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	const toggleEdit = (field: keyof User) => {
		setEditFields(prev => ({ ...prev, [field]: true }))
	}

	const cancelEdit = (field: keyof User) => {
		setFormData(prev => ({ ...prev, [field]: originalData[field] }))
		setEditFields(prev => ({ ...prev, [field]: false }))
	}

	const confirmEdit = (field: keyof User) => {
		setEditFields(prev => ({ ...prev, [field]: false }))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (onSubmit) {
			onSubmit(formData)
			setOriginalData(formData)
			setChanged(false)
		}
	}

	const handleClose = () => {
		if (changed) {
			const confirm = window.confirm(
				'Вы внесли изменения. Сохранить перед выходом?'
			)
			if (confirm) {
				onSubmit?.(formData)
				setOriginalData(formData)
			}
		}
		onClose()
	}

	const renderTextField = (
		label: string,
		field: keyof User,
		customClass?: string
	) => (
		<div className={`field-row ${customClass || ''}`}>
			{label && <label>{label}</label>}
			{editFields[field] ? (
				<div className='editable-row'>
					<input
						type='text'
						defaultValue={formData[field] || ''}
						onChange={e => handleFieldChange(field, e.target.value)}
					/>
					<div className='edit-actions'>
						<button type='button' onClick={() => confirmEdit(field)}>
							<FaCheck />
						</button>
						<button type='button' onClick={() => cancelEdit(field)}>
							<FaTimes />
						</button>
					</div>
				</div>
			) : (
				<div className='readonly-row'>
					<h2 className={customClass}>{formData[field] || '—'}</h2>
					{editable && (
						<button type='button' onClick={() => toggleEdit(field)}>
							<FaEdit />
						</button>
					)}
				</div>
			)}
		</div>
	)

	const renderSelectField = (
		label: string,
		field: keyof User,
		options: string[]
	) => (
		<div className='field-row'>
			<label>{label}</label>
			{editFields[field] ? (
				<div className='editable-row'>
					<select
						defaultValue={formData[field] || ''}
						onChange={e => handleFieldChange(field, e.target.value)}
					>
						<option value='' disabled>
							Выбери...
						</option>
						{options.map(opt => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>
					<div className='edit-actions'>
						<button type='button' onClick={() => confirmEdit(field)}>
							<FaCheck />
						</button>
						<button type='button' onClick={() => cancelEdit(field)}>
							<FaTimes />
						</button>
					</div>
				</div>
			) : (
				<div className='readonly-row'>
					<h2>{formData[field] || '—'}</h2>
					{editable && (
						<button type='button' onClick={() => toggleEdit(field)}>
							<FaEdit />
						</button>
					)}
				</div>
			)}
		</div>
	)

	const renderRoleField = () => {
		const currentValue =
			typeof formData.role === 'object' && formData.role !== null
				? (formData.role as any).type
				: formData.role || 'authenticated'
		const currentLabel =
			ROLE_OPTIONS.find(r => r.value === currentValue)?.label || currentValue

		return (
			<div className='field-row'>
				<label>Системная роль:</label>
				{editFields['role'] ? (
					<div className='editable-row'>
						<select
							defaultValue={currentValue}
							onChange={e => handleFieldChange('role', e.target.value)}
						>
							{ROLE_OPTIONS.map(opt => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
						<div className='edit-actions'>
							<button type='button' onClick={() => confirmEdit('role')}>
								<FaCheck />
							</button>
							<button type='button' onClick={() => cancelEdit('role')}>
								<FaTimes />
							</button>
						</div>
					</div>
				) : (
					<div className='readonly-row'>
						<h2>{currentLabel}</h2>
						{editable && (
							<button type='button' onClick={() => toggleEdit('role')}>
								<FaEdit />
							</button>
						)}
					</div>
				)}
			</div>
		)
	}

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
					{renderSelectField('Роль:', 'role', [
						'Штурмовик',
						'Медик',
						'Разведчик',
						'Инженер',
					])}
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
