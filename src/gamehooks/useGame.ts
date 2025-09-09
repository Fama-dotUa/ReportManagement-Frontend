import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'

export function useGame(game: string, jwt?: string) {
	const [state, setState] = useState<any>(null)
	const [logs, setLogs] = useState<string[]>([])
	const socketRef = useRef<Socket | null>(null)

	useEffect(() => {
		const s = io(`${import.meta.env.VITE_API_GAME_URL}`, {
			auth: { token: jwt },
			withCredentials: false,
		})
		socketRef.current = s

		s.on('connect', () => {
			s.emit('join_game', { game })
		})

		s.on('joined', m => {
			setLogs(p => [...p, `JOINED: ${m.game}:${m.roomId}`])
			setState(m.state)
		})
		s.on('state', m => {
			setLogs(p => [...p, `STATE ${m.game}:${m.roomId}`])
			setState(m.full)
		})
		s.on('log', m => setLogs(p => [...p, m.text]))
		s.on('error', m => setLogs(p => [...p, `ERROR: ${m.message}`]))

		s.on('connect_error', err => {
			setLogs(p => [...p, `CONNECT_ERROR: ${err.message}`])
		})

		return () => {
			s.disconnect()
		}
	}, [game, jwt])

	// методы
	const bet = (amount: number) =>
		socketRef.current?.emit('bet', { game, amount, idempKey: uuidv4() })

	const action = (action: string, payload?: any) =>
		socketRef.current?.emit('action', {
			game,
			action,
			payload,
			idempKey: uuidv4(),
		})

	const applyCoupon = (code: string) =>
		socketRef.current?.emit('coupon.apply', { code, idempKey: uuidv4() })

	return { state, logs, bet, action, applyCoupon }
}
