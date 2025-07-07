import React, { useState } from 'react'
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
		role: 'authenticated',
		icon: '',
	})
	const [tempIcon, setTempIcon] = useState('')
	const [showAvatarModal, setShowAvatarModal] = useState(false)

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const { username, password, discord, rank, role } = form
		if (!username || !password || !discord || !rank || !role) {
			alert('Пожалуйста, заполните все поля.')
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
							value={form.rank}
							onChange={handleChange}
							required
						>
							<option value=''>Выбрать...</option>
							<option value='рядовой'>Рядовой</option>
							<option value='сержант'>Сержант</option>
							<option value='лейтенант'>Лейтенант</option>
						</select>

						<label>Роль</label>
						<select
							name='role'
							value={form.role}
							onChange={handleChange}
							required
						>
							<option value='authenticated'>Обычный</option>
							<option value='officer'>Офицер</option>
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
