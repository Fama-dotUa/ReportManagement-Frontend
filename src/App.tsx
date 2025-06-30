import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './App.css'

import StartPages from './pages/StartPage/StartPage'
import OfficerPage from './pages/OfficerPage/Officerpage.tsx'

function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path='/' element={<StartPages />} />
					<Route path='/officer' element={<OfficerPage />} />
				</Routes>
			</Router>
		</>
	)
}

export default App
