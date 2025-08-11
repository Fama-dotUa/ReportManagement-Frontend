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

// Импортируем все страницы
import StartPages from './pages/StartPage/StartPage'
import OfficerPage from './pages/OfficerPage/OfficerPage'
import { Store } from './pages/StorePage/Store'
import { SpecialistsPage } from './pages/SpecialistsPage/SpecialistsPage'
import { CosmeticsPage } from './pages/CosmeticsPage/CosmeticsPage'

function App() {
	const location = useLocation()

	return (
		// AnimatePresence должен быть снаружи Routes
		<AnimatePresence mode='wait'>
			{/* Ключ и location необходимы для корректной работы AnimatePresence с роутером */}
			<Routes location={location} key={location.pathname}>
				{/* Создаем родительский маршрут с нашей анимированной оберткой */}
				<Route path='/' element={<AnimatedLayout />}>
					{/* А все дочерние маршруты будут рендериться внутри <Outlet /> */}
					<Route index element={<StartPages />} />
					<Route path='officer' element={<OfficerPage />} />
					<Route path='store' element={<Store />} />
					<Route path='specialists' element={<SpecialistsPage />} />
					<Route path='cosmetics' element={<CosmeticsPage />} />
				</Route>
			</Routes>
		</AnimatePresence>
	)
}

// Важно: чтобы useLocation работал, App нужно обернуть в <Router> в файле main.tsx (или index.tsx)
// Если <Router> был здесь, оставляем его. Если он был в main.tsx, то убираем его из App.tsx
// Для простоты я оставлю <Router> здесь, как в вашем примере.

const Root = () => (
	<Router>
		<App />
	</Router>
)

export default Root
