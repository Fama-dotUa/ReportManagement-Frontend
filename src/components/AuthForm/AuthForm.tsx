import React, { useState } from 'react'
import './AuthForm.css'

type AuthFormProps = {
	onClose: () => void
}

const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
	const API_URL = import.meta.env.VITE_API_URL
	const [form, setForm] = useState({ username: '', password: '' })
	const [error, setError] = useState<string | null>(null)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		try {
			const res = await fetch(`${API_URL}/api/auth/local`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					identifier: form.username,
					password: form.password,
				}),
			})

			const data = await res.json()

			if (res.ok) {
				const token = data.jwt
				localStorage.setItem('jwt', token)
				window.location.reload()
			} else {
				setError(data?.error?.message || 'Неверный логин или пароль')
			}
		} catch {
			setError('Ошибка подключения к серверу')
		}
	}

	return (
		<div className='auth-overlay'>
			<div className='auth-wrapper'>
				<button className='auth-close' onClick={onClose}>
					×
				</button>
				<div className='auth-container'>
					<h2>Вход</h2>
					<form onSubmit={handleSubmit}>
						<input
							type='text'
							name='username'
							placeholder='Имя пользователя'
							value={form.username}
							onChange={handleChange}
							required
						/>

						<input
							type='password'
							name='password'
							placeholder='Пароль'
							value={form.password}
							onChange={handleChange}
							required
						/>
						<button type='submit'>Войти</button>
						{error && <p className='auth-error'>{error}</p>}
					</form>
				</div>
			</div>
		</div>
	)
}

export default AuthForm
