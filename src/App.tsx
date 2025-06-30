import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './App.css'

import StartPages from './pages/StartPage/StartPage'

function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path='/' element={<StartPages />} />
				</Routes>
			</Router>
		</>
	)
}

export default App
