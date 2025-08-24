import React, 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { FaCopy } from 'react-icons/fa' // Иконка для кнопки
import './DonationPage.css'

// ВАЖНО: Эта функция должна быть на бэкенде.
// Здесь она для демонстрации. Бэкенд должен сгенерировать,
// сохранить код для юзера и вернуть его.
const generateAndSaveUserCode = (user: any): string => {
	// Если у пользователя уже есть код, возвращаем его
	if (user && user.donation_code) {
		return user.donation_code
	}

	// Иначе генерируем новый (симуляция)
	const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Без похожих символов O/0, I/1
	let result = ''
	for (let i = 0; i < 6; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	// В реальном приложении здесь был бы API-запрос на сохранение этого кода
	console.log(`Generated code ${result} for user ${user?.id}. (This should be a backend call)`)
	return result
}

const DonationPage: React.FC = () => {
	const navigate = useNavigate()
	const { user } = useAuth()

	// Ссылка на вашу банку Monobank
	const MONO_BANK_URL = 'https://send.monobank.ua/jar/ВАШ_ID_БАНКИ'

	// Генерируем или получаем код пользователя
	const donationCode = user ? generateAndSaveUserCode(user) : 'LOADING...'

	const handleCopyToClipboard = () => {
		navigator.clipboard.writeText(donationCode)
		alert(`Код ${donationCode} скопирован в буфер обмена!`)
	}

	return (
		<div className='donation-page'>
			<div className='blur-background'></div>
			<div className='donation-panel'>
				<div className='donation-header'>
					<h1 className='animated-gradient-text'>Пополнение баланса</h1>
				</div>

				<div className='donation-content'>
					<p className='instructions'>
						Для пополнения баланса CR перейдите по ссылке на банку Monobank.
						<br />
						Курс обмена: <strong>1 грн = 10 CR</strong>.
					</p>

					<a href={MONO_BANK_URL} target='_blank' rel='noopener noreferrer' className='mono-link'>
						Перейти к банке Monobank
					</a>

					<p className='instructions important'>
						ВАЖНО! Чтобы CR были зачислены, обязательно укажите в комментарии
						к платежу ваш уникальный код:
					</p>

					<div className='donation-code-wrapper'>
						<span className='donation-code'>{donationCode}</span>
						<button className='copy-button' onClick={handleCopyToClipboard} title='Скопировать код'>
							<FaCopy />
						</button>
					</div>
				</div>

				<button className='back-button' onClick={() => navigate('/officer')}>
					Назад
				</button>
			</div>
		</div>
	)
}

export default DonationPage