import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../../hooks/useLogin'
import './AuthForm.css'

type AuthFormProps = {
	onClose: () => void
}

const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
	const [form, setForm] = useState({ username: '', password: '' })
	const navigate = useNavigate()

	const { mutate: login, isPending, error } = useLogin()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		const credentials = {
			identifier: form.username,
			password: form.password,
		}

		login(credentials, {
			onSuccess: () => {
				onClose()
				navigate('/officer')
			},
		})
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
							disabled={isPending}
						/>
						<input
							type='password'
							name='password'
							placeholder='Пароль'
							value={form.password}
							onChange={handleChange}
							required
							disabled={isPending}
						/>
						<button type='submit' disabled={isPending}>
							{isPending ? 'Входим...' : 'Войти'}
						</button>
						{error && <p className='auth-error'>{error.message}</p>}
					</form>
				</div>
			</div>
		</div>
	)
}

export default AuthForm
