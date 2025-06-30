import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from 'react-router-dom'

import './App.css'

import StartPages from './pages/StartPages/StartPages'

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
