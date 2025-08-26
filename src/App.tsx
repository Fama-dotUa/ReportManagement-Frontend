import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from 'react-router-dom'
import './App.css'
import { AnimatePresence } from 'framer-motion'

// Импортируем нашу новую обертку
import { AnimatedLayout } from './AnimatedLayout'

import { useUpdateActivity } from './hooks/useUpdateActivity'

// Импортируем все страницы
import StartPages from './pages/StartPage/StartPage'
import OfficerPage from './pages/OfficerPage/OfficerPage'
import { Store } from './pages/StorePage/Store'
import { SpecialistsPage } from './pages/SpecialistsPage/SpecialistsPage'
import { CosmeticsPage } from './pages/CosmeticsPage/CosmeticsPage'
import { useAuth } from './hooks/useAuth'
import { useEffect } from 'react'
import  CasinoPage  from './pages/CasinoPage/CasinoPage'
import  DonationPage  from './pages/DonationPage/DonationPage'
function App() {
	const { user } = useAuth()
	const location = useLocation()
	const { mutate: updateActivity } = useUpdateActivity()

	useEffect(() => {
		if (user?.id) {
			updateActivity(user.id)

			const intervalId = setInterval(() => {
				updateActivity(user.id)
			}, 60000)

			return () => clearInterval(intervalId)
		}
	}, [user?.id, updateActivity])


	return (
		<AnimatePresence mode='wait'>
			<Routes location={location} key={location.pathname}>
				<Route path='/' element={<AnimatedLayout />}>
					<Route index element={<StartPages />} />
					<Route path='officer' element={<OfficerPage />} />
					<Route path='store' element={<Store />} />
					<Route path='specialists' element={<SpecialistsPage />} />
					<Route path='cosmetics' element={<CosmeticsPage />} />
					<Route path='casino' element={<CasinoPage />} />
					<Route path='donation' element={<DonationPage />} />
				</Route>
			</Routes>
		</AnimatePresence>
	)
}

const Root = () => (
	<Router>
		<App />
	</Router>
)

export default Root
