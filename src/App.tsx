import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './App.css'

import StartPages from './pages/StartPage/StartPage'
import OfficerPage from './pages/OfficerPage/OfficerPage.tsx'
import { Store } from './pages/StorePage/Store.tsx'
import { SpecialistsPage } from './pages/SpecialistsPage/SpecialistsPage.tsx'
import { CosmeticsPage } from './pages/CosmeticsPage/CosmeticsPage.tsx'

function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path='/' element={<StartPages />} />
					<Route path='/officer' element={<OfficerPage />} />
					<Route path='/store' element={<Store />} />
					<Route path='specialists' element={<SpecialistsPage />} />
					<Route path='cosmetics' element={<CosmeticsPage />} />
				</Routes>
			</Router>
		</>
	)
}

export default App
