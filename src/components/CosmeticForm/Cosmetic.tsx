import React, { useState, useEffect } from 'react'
import './Cosmetic.css'
import { IoCloseSharp } from 'react-icons/io5'
import { CosmeticRow } from './CosmeticRow' // Импортируем наш новый компонент
import type { User } from '../../types/User' // Предполагаем, что тип User импортируется

type Props = {
	user: User // Компонент должен получать данные пользователя
	onClose: () => void
	onSubmit: (newCosmetics: {
		framesfor_avatar_active: number
		profile_background_active: number
		fon_schildik_active: number
	}) => Promise<void>
}

export const Cosmetics: React.FC<Props> = ({ user, onClose, onSubmit }) => {
	// Состояния для ВЫБРАННЫХ элементов
	const [selectedFrame, setSelectedFrame] = useState<number | null>(null)
	const [selectedBackground, setSelectedBackground] = useState<number | null>(
		null
	)
	const [selectedSchildik, setSelectedSchildik] = useState<number | null>(null)

	// При открытии модального окна устанавливаем выбранные элементы равными активным
	useEffect(() => {
		setSelectedFrame(user.framesfor_avatar_active?.id ?? null)
		setSelectedBackground(user.profile_background_active?.id ?? null)
		setSelectedSchildik(user.fon_schildik_active?.id ?? null)
	}, [user])

	const handleSave = () => {
		// Вызываем onSubmit с новыми ID
		if (selectedFrame && selectedBackground && selectedSchildik) {
			onSubmit({
				framesfor_avatar_active: selectedFrame,
				profile_background_active: selectedBackground,
				fon_schildik_active: selectedSchildik,
			})
		}
	}

	return (
		<div className='modal-overlay'>
			<div className='modalCosmetic'>
				<button className='close-button' onClick={onClose}>
					<IoCloseSharp />
				</button>
				<div className='cosmetic-modal-wrapper'>
					<h2>Внешний вид профиля</h2>

					{/* Секция с рамками */}
					<CosmeticRow
						title='Рамки для аватара'
						items={user.framesfor_avatars_all || []}
						selectedItemId={selectedFrame}
						onSelectItem={setSelectedFrame}
						itemClassName='frame-item' // <--- Уникальный класс для рамок
					/>
					{/* Секция с фонами */}
					<CosmeticRow
						title='Фоны профиля'
						items={user.profile_backgrounds_all || []}
						selectedItemId={selectedBackground}
						onSelectItem={setSelectedBackground}
						itemClassName='background-item' // <--- Уникальный класс для фонов
					/>
					{/* Секция с шильдиками */}
					<CosmeticRow
						title='Фоны для шильдика'
						items={user.fon_schildiks_all || []}
						selectedItemId={selectedSchildik}
						onSelectItem={setSelectedSchildik}
						itemClassName='schildik-item' // <--- Уникальный класс для шильдиков
					/>
					<button className='save-cosmetics-button' onClick={handleSave}>
						Сохранить изменения
					</button>
				</div>
			</div>
		</div>
	)
}
