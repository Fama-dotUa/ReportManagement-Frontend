import React, { useState, useEffect } from 'react'
import './Cosmetic.css'
import { IoCloseSharp } from 'react-icons/io5'
import { CosmeticRow } from './CosmeticRow'
import type { User } from '../../types/User'
import type { ProcessedAward } from '../../hooks/useUserAwards'

type Props = {
	user: User
	onClose: () => void
	awards: ProcessedAward[]
	onSubmit: (newCosmetics: {
		framesfor_avatar_active: number
		profile_background_active: number
		fon_schildik_active: number
		love_medal: number | null
	}) => Promise<void>
}
const API_URL = import.meta.env.VITE_API_URL
export const Cosmetics: React.FC<Props> = ({
	user,
	awards,
	onClose,
	onSubmit,
}) => {
	const [selectedFrame, setSelectedFrame] = useState<number | null>(null)
	const [selectedBackground, setSelectedBackground] = useState<number | null>(
		null
	)
	const [selectedSchildik, setSelectedSchildik] = useState<number | null>(null)
	const [selectedLoveMedal, setSelectedLoveMedal] = useState<number | null>(
		null
	)

	useEffect(() => {
		setSelectedFrame(user.framesfor_avatar_active?.id ?? null)
		setSelectedBackground(user.profile_background_active?.id ?? null)
		setSelectedSchildik(user.fon_schildik_active?.id ?? null)
		setSelectedLoveMedal(user.love_medal?.id ?? null)
	}, [user])

	const handleSave = () => {
		if (selectedFrame && selectedBackground && selectedSchildik) {
			onSubmit({
				framesfor_avatar_active: selectedFrame,
				profile_background_active: selectedBackground,
				fon_schildik_active: selectedSchildik,
				love_medal: selectedLoveMedal,
			})
		}
	}
	const awardItems = awards.map(award => ({
		id: award.id,
		name: award.name,
		image: {
			url: award.imageUrl,
			ext: '.' + award.imageUrl.split('.').pop() || '',
		},
	}))
	return (
		<div className='modal-overlay'>
			<div className='modalCosmetic'>
				<button className='close-button' onClick={onClose}>
					<IoCloseSharp />
				</button>
				<div className='cosmetic-modal-wrapper'>
					<h2>Внешний вид профиля</h2>

					<CosmeticRow
						title='Рамки для аватара'
						items={user.framesfor_avatars_all || []}
						selectedItemId={selectedFrame}
						onSelectItem={setSelectedFrame}
						itemClassName='frame-item' // <--- Уникальный класс для рамок
					/>
					<CosmeticRow
						title='Фоны профиля'
						items={user.profile_backgrounds_all || []}
						selectedItemId={selectedBackground}
						onSelectItem={setSelectedBackground}
						itemClassName='background-item' // <--- Уникальный класс для фонов
					/>
					<CosmeticRow
						title='Фоны для шильдика'
						items={user.fon_schildiks_all || []}
						selectedItemId={selectedSchildik}
						onSelectItem={setSelectedSchildik}
						itemClassName='schildik-item' // <--- Уникальный класс для шильдиков
					/>
					{awardItems && awardItems.length > 0 && (
						<CosmeticRow
							title='Любимая награда'
							items={awardItems}
							selectedItemId={selectedLoveMedal}
							onSelectItem={setSelectedLoveMedal}
							itemClassName='award-item-cosmetic'
						/>
					)}
					<button className='save-cosmetics-button' onClick={handleSave}>
						Сохранить изменения
					</button>
				</div>
			</div>
		</div>
	)
}
