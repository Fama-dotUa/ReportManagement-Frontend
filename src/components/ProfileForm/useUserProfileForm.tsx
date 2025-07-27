import { useEffect, useState } from 'react'
import { FaCheck, FaTimes, FaPencilAlt } from 'react-icons/fa'
import type { User } from '../../types/User'
import { useUpdateUser } from '../../hooks/useUpdateUser'

const API_URL = import.meta.env.VITE_API_URL

const ROLE_OPTIONS = [
	{ value: 'authenticated', label: 'Солдат' },
	{ value: 'universal_soldier', label: 'Универсальный солдат' },
	{ value: 'teacher', label: 'Инструктор' },
	{ value: 'officer', label: 'Дисциплинарный офицер' },
	{ value: 'comander_officer', label: 'Командир' },
	{ value: 'general', label: 'Начальник Генерального штаба' },
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

	const [tempIcon, setTempIcon] = useState<string | null>(null)
	const [iconFile, setIconFile] = useState<File | null>(null)
	const isSelfGeneral =
		formData.id === currentUserId &&
		(formData.role === 'general' || (formData.role as any)?.type === 'general')

	useEffect(() => {
		const baseChanged =
			JSON.stringify(formData) !== JSON.stringify(originalData)
		const iconChanged = !!iconFile
		setChanged(baseChanged || iconChanged)
	}, [formData, originalData, iconFile])

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
	const deleteOldIcon = async (iconId: number) => {
		const token = localStorage.getItem('jwt')
		await fetch(`${API_URL}/api/upload/files/${iconId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
	}
	const getCurrentUserIconId = async (
		userId: number
	): Promise<number | null> => {
		const token = localStorage.getItem('jwt')
		const res = await fetch(`${API_URL}/api/users/${userId}?populate=*`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		const data = await res.json()
		console.log('Полученные данные пользователя:', data)
		return data.Icon?.id || data.Icon?.id || null
	}

	const saveChanges = async () => {
		if (iconFile && formData.id) {
			const token = localStorage.getItem('jwt')

			const oldIconId = await getCurrentUserIconId(formData.id)
			if (oldIconId) {
				await deleteOldIcon(oldIconId)
			}

			const form = new FormData()
			form.append('files', iconFile)
			form.append('ref', 'plugin::users-permissions.user')
			form.append('refId', formData.id.toString())
			form.append('field', 'icon')
			form.append('source', 'plugin::users-permissions')

			await fetch(`${API_URL}/api/upload`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: form,
			})
		}

		// 3. Сохраняем пользователя (без icon)
		const cleanedData = { ...formData }
		delete cleanedData.icon

		const result = await updateUser(cleanedData)

		if (result.success) {
			setOriginalData({ ...formData })
			setTempIcon(null)
			setIconFile(null)
			setChanged(false)
			onSubmitCallback?.({ ...formData })
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
							<FaPencilAlt />
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
					{editable && !isSelfGeneral && (
						<button type='button' onClick={() => toggleEdit(field)}>
							<FaPencilAlt />
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
				<label>Должность:</label>
				{editFields['role'] ? (
					<div className='editable-row'>
						<select
							defaultValue={currentValue}
							onChange={e => handleFieldChange('role', e.target.value)}
						>
							{ROLE_OPTIONS.filter(opt => opt.value !== 'general').map(opt => (
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
						{editable && !isSelfGeneral && (
							<button type='button' onClick={() => toggleEdit('role')}>
								<FaPencilAlt />
							</button>
						)}
					</div>
				)}
			</div>
		)
	}

	const applyTempIcon = (file: File, previewUrl: string) => {
		setTempIcon(previewUrl)
		setIconFile(file)
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
		tempIcon,
		applyTempIcon,
	}
}
