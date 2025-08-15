import React, { useEffect, useState } from 'react'
import SoldierList from '../../SoldierList'
import { useAuth } from '../../../../hooks/useAuth'
import { useUsers } from '../../../../hooks/useUsers'
import { useUpdateUser } from '../../../../hooks/useUpdateUser'
import { useCreateBookkeepingEntry } from '../../../../hooks/useCreateBookkeepingEntry'

interface Props {
	mode: 'issue' | 'collect'
}

const CreditTransactionForm: React.FC<Props> = ({ mode }) => {
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [amount, setAmount] = useState('')
	const [description, setDescription] = useState('')
	const [error, setError] = useState('')
	const [targetUser, setTargetUser] = useState<{
		id: number
		username: string
		CR: number
		CR_for_all_time: number
	} | null>(null)

	const { user: currentUser } = useAuth()
	const { data: allUsers } = useUsers()
	const { updateUser } = useUpdateUser(currentUser?.id || null)
	const { mutateAsync: createBookkeepingEntry } = useCreateBookkeepingEntry()

	const title = mode === 'issue' ? 'Выдача кредитов' : 'Взыскание кредитов'
	const buttonText = mode === 'issue' ? 'Выдать' : 'Взыскать'
	const descriptionPlaceholder =
		mode === 'issue'
			? 'Причина выдачи (например, премия)'
			: 'Причина взыскания (например, штраф)'
	useEffect(() => {
		if (selectedId && allUsers) {
			const foundUser = allUsers.find(u => u.id === Number(selectedId)) || null
			setTargetUser(foundUser)
		} else {
			setTargetUser(null) // Сбрасываем пользователя, если ID не выбран
		}
	}, [selectedId, allUsers]) // Этот эффект будет срабатывать при изменении selectedId или allUsers

	const handleSubmit = async () => {
		setError('')

		if (!selectedId) {
			setError('Необходимо выбрать солдата.')
			return
		}
		const numericAmount = Number(amount)
		if (isNaN(numericAmount) || numericAmount <= 0) {
			setError('Сумма должна быть положительным числом.')
			return
		}
		if (!currentUser) {
			setError('Ошибка: не удалось определить текущего пользователя.')
			return
		}
		if (mode === 'issue' && numericAmount > currentUser.CR) {
			setError('У вас недостаточно средств для выдачи такой суммы.')
			return
		}

		if (!targetUser) {
			setError('Не удалось найти данные выбранного солдата.')
			return
		}
		if (
			!window.confirm(
				`Вы уверены, что хотите ${buttonText.toLowerCase()} ${numericAmount} CR?`
			)
		)
			return

		try {
			if (mode === 'issue') {
				const newIssuerBalance = currentUser.CR - numericAmount
				const newTargetBalance = Number(targetUser.CR) + numericAmount
				const newTotalCR =
					Number(targetUser.CR_for_all_time) + Number(numericAmount)
				await updateUser({ id: currentUser.id, CR: newIssuerBalance })
				await updateUser({
					id: targetUser.id,
					CR: newTargetBalance,
					CR_for_all_time: newTotalCR,
				})
				await createBookkeepingEntry({
					type: 'выдача',
					sum: numericAmount,
					boss: currentUser.id,
					soldier: targetUser.id,
					description: description || 'Без описания',
				})
			} else if (mode === 'collect') {
				const newTargetBalance = Number(targetUser.CR) - numericAmount
				await updateUser({ id: targetUser.id, CR: newTargetBalance })
				await createBookkeepingEntry({
					type: 'взыскание',
					sum: numericAmount,
					boss: currentUser.id,
					soldier: targetUser.id,
					description: description || 'Без описания',
				})
			}

			alert('Операция прошла успешно!')
			setSelectedId(null)
			setAmount('')
			setDescription('')
		} catch (err: any) {
			console.error('Ошибка при проведении транзакции:', err)
			setError(`Ошибка сервера: ${err.message}`)
		}
	}

	return (
		<div className='center'>
			<SoldierList
				selectedId={selectedId}
				onSelect={setSelectedId}
				excludeId={mode === 'issue' ? currentUser?.id : undefined}
			/>
			<div className='center-panel report-form'>
				<h3>{title}</h3>

				{!selectedId && (
					<p className='placeholder'>
						Выберите солдата для проведения операции
					</p>
				)}

				{selectedId && (
					<>
						<div className='form-group'>
							<label>
								Сумма CR у {targetUser ? targetUser.username : '—'}:
							</label>
							<span className='cr-balance'>
								{targetUser ? targetUser.CR : '—'} CR (всего:{' '}
								{targetUser ? targetUser.CR_for_all_time : '—'} CR)
							</span>
						</div>
						<div className='form-group'>
							<label>Сумма CR:</label>
							<input
								type='number'
								className='cr-input'
								placeholder='Введите сумму'
								value={amount}
								onChange={e => setAmount(e.target.value)}
							/>
						</div>
						<div className='form-group'>
							<label>Краткое описание:</label>
							<textarea
								className='cr-textarea'
								placeholder={descriptionPlaceholder}
								value={description}
								onChange={e => setDescription(e.target.value)}
							/>
						</div>

						{error && <p className='auth-error'>{error}</p>}

						<button className='submit-btn' onClick={handleSubmit}>
							{buttonText}
						</button>
					</>
				)}
			</div>
		</div>
	)
}

export default CreditTransactionForm
