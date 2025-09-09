import React, { useEffect } from 'react'
import { useGame } from './useGame'
import { useAuth } from '../hooks/useAuth'
import './style.css'
export default function CrashTest() {
	const { token } = useAuth()
	const { state, logs, bet, action, applyCoupon } = useGame(
		'roulette',
		token || ''
	)

	return (
		<div className='test-div'>
			<h1>Crash Game Test</h1>
			<pre>{JSON.stringify(state, null, 2)}</pre>

			<button onClick={() => bet(10)}>Сделать ставку 10</button>
			<button onClick={() => action('cashout')}>Кэшаут</button>

			<h3>Логи</h3>
			<ul>
				{logs.map((l, i) => (
					<li key={i}>{l}</li>
				))}
			</ul>
		</div>
	)
}
