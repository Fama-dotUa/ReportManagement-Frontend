import React, { useEffect, useState } from 'react'
import './CreateSoldier.css'
import { FaPencilAlt } from 'react-icons/fa'
import AvatarUploadModal from '../AvatarUploadModal'
import type { User } from '../../types/User'

type Props = {
	onClose: () => void
	onCreate: (user: User & { password: string }) => void
}

const CreateSoldierModal: React.FC<Props> = ({ onClose, onCreate }) => {
	const [form, setForm] = useState({
		username: '',
		password: '',
		discord: '',
		rank: '',
		role: 'Authenticated',
		icon: '',
	})
	const [tempIcon, setTempIcon] = useState('')
	const [showAvatarModal, setShowAvatarModal] = useState(false)
	type Rank = { id: number; name: string }
	const [ranks, setRanks] = useState<Rank[]>([])
	useEffect(() => {
		const fetchRanks = async () => {
			try {
				const res = await fetch(
					`${import.meta.env.VITE_API_URL}/api/ranks?populate=*`
				)
				const data = await res.json()
				setRanks(data.data)
			} catch (err) {
				console.error('Ошибка при загрузке званий:', err)
			}
		}
		fetchRanks()
	}, [])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const { username, password, discord, rank, role } = form
		console.log('role:', role)
		const errors: string[] = []

		if (!username || username.length < 3) {
			errors.push('Имя пользователя должно быть не короче 3 символов.')
		}

		if (!password || password.length < 6) {
			errors.push('Пароль должен содержать минимум 6 символов.')
		}

		const discordRegex = /^([a-zA-Z0-9_.]{2,32}|[a-zA-Z0-9_]{2,32}#[0-9]{4})$/
		if (!discord || !discordRegex.test(discord)) {
			errors.push(
				'Discord должен быть в формате "user" или "user#1234" (до 32 символов).'
			)
		}

		if (!rank) {
			errors.push('Звание обязательно.')
		}

		if (!role) {
			errors.push('Роль обязательна.')
		}

		if (errors.length > 0) {
			alert(errors.join('\n'))
			return
		}

		onCreate({ ...form, icon: tempIcon, id: 0 })
	}

	return (
		<div className='create-soldier-overlay'>
			<form onSubmit={handleSubmit} className='create-soldier-form'>
				<button className='close-button' type='button' onClick={onClose}>
					×
				</button>

				<div className='create-soldier-grid'>
					<div className='create-soldier-avatar'>
						<img
							src={tempIcon || '/default-avatar.png'}
							alt='avatar'
							className='avatar-img'
						/>
						<button
							type='button'
							id='create-soldier-avatar-button'
							onClick={() => setShowAvatarModal(true)}
						>
							<FaPencilAlt />
						</button>
					</div>

					<div className='create-soldier-fields'>
						<label>Имя пользователя</label>
						<input
							type='text'
							name='username'
							value={form.username}
							onChange={handleChange}
							required
						/>

						<label>Пароль</label>
						<input
							type='password'
							name='password'
							value={form.password}
							onChange={handleChange}
							required
						/>

						<label>Discord</label>
						<input
							type='text'
							name='discord'
							value={form.discord}
							onChange={handleChange}
							required
						/>

						<label>Звание</label>
						<select
							name='rank'
							value={form.rank || ''}
							onChange={handleChange}
							required
						>
							<option value='' disabled>
								Выбрать звание...
							</option>
							{ranks.map(r => (
								<option key={r.id} value={r.id}>
									{r.name}
								</option>
							))}
						</select>

						<label>Роль</label>
						<select
							name='role'
							value={form.role}
							onChange={handleChange}
							required
						>
							<option value='Authenticated'>Солдат</option>
							<option value='universal-soldier'>Универсальный солдат</option>
							<option value='comander-officer'>Командир</option>
							<option value='teacher'>Инструктор</option>
							<option value='officer'>Дисциплиннарный офицер</option>
						</select>
					</div>
				</div>

				<button type='submit'>Создать</button>

				{showAvatarModal && (
					<AvatarUploadModal
						initialImage={tempIcon}
						onClose={() => setShowAvatarModal(false)}
						onApply={(file, preview) => {
							setTempIcon(preview)
							setShowAvatarModal(false)
						}}
					/>
				)}
			</form>
		</div>
	)
}

export default CreateSoldierModal
