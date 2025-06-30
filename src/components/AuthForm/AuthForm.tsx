import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './AuthForm.css'

type AuthMode = 'login' | 'register'

const AuthForm: React.FC = () => {
	const API_URL = import.meta.env.VITE_API_URL

	const [authMode, setAuthMode] = useState<AuthMode>('login')
	const [form, setForm] = useState({
		username: '',
		email: '',
		password: '',
	})
	const navigate = useNavigate()
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const url =
			authMode === 'login'
				? `${API_URL}/api/auth/local`
				: `${API_URL}/api/auth/local/register`

		const payload =
			authMode === 'login'
				? {
						identifier: form.email,
						password: form.password,
				  }
				: {
						username: form.username,
						email: form.email,
						password: form.password,
				  }

		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			const data = await res.json()

			if (res.ok) {
				localStorage.setItem('jwt', data.jwt)
				navigate('/officer', { replace: true })
			} else {
				alert(data?.error?.message || 'Ошибка')
			}
		} catch {
			alert('Ошибка подключения к серверу')
		}
	}

	return (
		<div className='auth-container'>
			<h2>{authMode === 'login' ? 'Вход' : 'Регистрация'}</h2>
			<form onSubmit={handleSubmit}>
				{authMode === 'register' && (
					<input
						type='text'
						name='username'
						placeholder='Имя пользователя'
						value={form.username}
						onChange={handleChange}
						required
					/>
				)}
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
				<button type='submit'>
					{authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
				</button>
			</form>
			<p>
				{authMode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
				<span
					className='auth-toggle'
					onClick={() =>
						setAuthMode(authMode === 'login' ? 'register' : 'login')
					}
				>
					{authMode === 'login' ? 'Зарегистрироваться' : 'Войти'}
				</span>
			</p>
		</div>
	)
}

export default AuthForm
