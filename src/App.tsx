import { useState } from 'react'
import './App.css'

function App() {
	const [count, setCount] = useState(0)
	return (
		<>
			<div className='App'>
				<header className='App-header'>
					<h1>Report Management System</h1>
				</header>
				<main>
					<p>Welcome to the Report Management System!</p>
				</main>
			</div>
			<footer className='App-footer'>
				<p>&copy; 2023 Report Management System</p>
			</footer>
		</>
	)
}

export default App
