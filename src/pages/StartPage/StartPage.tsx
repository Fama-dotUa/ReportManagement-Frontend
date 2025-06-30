import React, { useState } from 'react'
import AuthForm from '../../components/AuthForm/AuthForm'

import './StartPage.css'

function StartPages() {
	const [showAuth, setShowAuth] = useState(false)

	const toggleAuthForm = () => {
		setShowAuth(prev => !prev)
	}

	return (
		<div className='start-pages'>
			<div className='section transparent first' />
			<div className='section second'>
				<div className='buttons'>
					<button>Войти как гость</button>
					<button onClick={toggleAuthForm}>Войти как офицер</button>
				</div>
			</div>
			<div className='section transparent third' />
			{showAuth && <AuthForm onClose={() => setShowAuth(false)} />}
		</div>
	)
}

export default StartPages
