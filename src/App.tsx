import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from 'react-router-dom'
import './App.css'
import { AnimatePresence } from 'framer-motion'
import { Suspense, lazy, useEffect } from 'react'

import { AnimatedLayout } from './AnimatedLayout'
import { useUpdateActivity } from './hooks/useUpdateActivity'
import { useAuth } from './hooks/useAuth'

const StartPages = lazy(() => import('./pages/StartPage/StartPage'))
const CrashTest = lazy(() => import('./gamehooks/CrashTest'))
const OfficerPage = lazy(() => import('./pages/OfficerPage/OfficerPage'))
const CasinoPage = lazy(() => import('./pages/CasinoPage/CasinoPage'))
const CosmeticsPage = lazy(() => import('./pages/CosmeticsPage/CosmeticsPage'))
const DonationPage = lazy(() => import('./pages/DonationPage/DonationPage'))
const SpecialistsPage = lazy(
	() => import('./pages/SpecialistsPage/SpecialistsPage')
)
const StorePage = lazy(() => import('./pages/StorePage/Store'))

function AppContent() {
	const location = useLocation()
	const { mutate: updateActivity } = useUpdateActivity()
	const { user } = useAuth()
	useEffect(() => {
		if (user?.id) {
			updateActivity(user.id)

			const intervalId = setInterval(() => {
				updateActivity(user.id)
			}, 60000 * 5)

			return () => clearInterval(intervalId)
		}
	}, [user?.id, updateActivity])

	return (
		<AnimatePresence mode='wait'>
			<Routes location={location} key={location.pathname}>
				<Route element={<AnimatedLayout />}>
					<Route
						path='/'
						element={
							<Suspense fallback={null}>
								<StartPages />
							</Suspense>
						}
					/>
					<Route
						path='officer'
						element={
							<Suspense fallback={null}>
								<OfficerPage />
							</Suspense>
						}
					/>
					<Route
						path='casino'
						element={
							<Suspense fallback={null}>
								<CasinoPage />
							</Suspense>
						}
					/>
					<Route
						path='cosmetics'
						element={
							<Suspense fallback={null}>
								<CosmeticsPage />
							</Suspense>
						}
					/>
					<Route
						path='donation'
						element={
							<Suspense fallback={null}>
								<DonationPage />
							</Suspense>
						}
					/>
					<Route
						path='specialists'
						element={
							<Suspense fallback={null}>
								<SpecialistsPage />
							</Suspense>
						}
					/>
					<Route
						path='store'
						element={
							<Suspense fallback={null}>
								<StorePage />
							</Suspense>
						}
					/>
					<Route
						path='test'
						element={
							<Suspense fallback={null}>
								<CrashTest />
							</Suspense>
						}
					/>
				</Route>
			</Routes>
		</AnimatePresence>
	)
}

const Root = () => (
	<Router>
		<AppContent />
	</Router>
)

export default Root
