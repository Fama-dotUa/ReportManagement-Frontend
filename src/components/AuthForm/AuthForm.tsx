import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AuthForm.css'

const AuthForm: React.FC = () => {
	const API_URL = import.meta.env.VITE_API_URL
	const [form, setForm] = useState({ email: '', password: '' })
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

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
					identifier: form.email,
					password: form.password,
				}),
			})

			const data = await res.json()
			console.log('LOGIN RESPONSE:', data)

			if (res.ok) {
				const token = data.jwt

				const userRes = await fetch(`${API_URL}/api/users/me?populate=role`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				const user = await userRes.json()

				if (user?.role?.name === 'officer') {
					localStorage.setItem('jwt', token)
					navigate('/officer')
				} else {
					setError('Ты мясо, а не офицер')
				}
			} else {
				setError(data?.error?.message || 'Неверный логин или пароль')
			}
		} catch {
			setError('Ошибка подключения к серверу')
		}
	}

	return (
		<div className='auth-container'>
			<h2>Вход</h2>
			<form onSubmit={handleSubmit}>
				<input
					type='email'
					name='email'
					placeholder='Email'
					value={form.email}
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
	)
}

export default AuthForm
