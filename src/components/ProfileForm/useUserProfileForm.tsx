import { useEffect, useState } from 'react'
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
import type { User } from '../../types/User'
import { useUpdateUser } from '../../hooks/useUpdateUser'

const API_URL = import.meta.env.VITE_API_URL

const ROLE_OPTIONS = [
	{ value: 'authenticated', label: 'Мясо' },
	{ value: 'officer', label: 'Дисциплинарный офицер' },
]

export const useUserProfileForm = (
	initialUser?: User,
	editable: boolean = true,
	onSubmitCallback?: (user: User) => void,
	onCloseCallback?: () => void,
	currentUserId?: number
) => {
	const [formData, setFormData] = useState<User>(initialUser || ({} as User))
	const [originalData, setOriginalData] = useState<User>(
		initialUser || ({} as User)
	)
	const [editFields, setEditFields] = useState<{
		[key in keyof User]?: boolean
	}>({})
	const [changed, setChanged] = useState(false)
	const [ranks, setRanks] = useState<string[]>([])

	const { updateUser } = useUpdateUser(currentUserId || null)

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

	const saveChanges = async () => {
		const result = await updateUser(formData)
		if (result.success) {
			setOriginalData(formData)
			setChanged(false)
			onSubmitCallback?.(formData)
		} else {
			alert(result.message || 'Не удалось сохранить изменения')
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await saveChanges()
	}

	const handleClose = async () => {
		if (changed) {
			const confirm = window.confirm(
				'Вы внесли изменения. Сохранить перед выходом?'
			)
			if (confirm) {
				await saveChanges()
			}
		}
		onCloseCallback?.()
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
				<label>Роль:</label>
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

	return {
		formData,
		handleClose,
		handleSubmit,
		changed,
		ranks,
		renderTextField,
		renderSelectField,
		renderRoleField,
		editable,
	}
}
