import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import AllSoldiers from '../../components/CenterForms/AllSoldiers'
import ReportForm from '../../components/CenterForms/ReportForm'
import './OfficerPage.css'
import { useAuth } from '../../hooks/useAuth'

const OfficerPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<'all' | 'report'>('all')
	const navigate = useNavigate()
	const { role } = useAuth()
	const handleLogout = () => {
		const confirmLogout = window.confirm('Вы действительно хотите выйти?')
		if (confirmLogout) {
			localStorage.removeItem('jwt')
			navigate('/')
		}
	}

	return (
		<div className='officer-page'>
			<div className='blur-background'></div>

			<div className='officer-nav'>
				<button
					className={activeTab === 'all' ? 'nav-button active' : 'nav-button'}
					onClick={() => setActiveTab('all')}
				>
					Все солдаты
				</button>
				{role && ['officer', 'general', 'comander-officer'].includes(role) && (
					<button
						className={
							activeTab === 'report' ? 'nav-button active' : 'nav-button'
						}
						onClick={() => setActiveTab('report')}
					>
						Создать рапорт
					</button>
				)}

				<button className='nav-button' onClick={handleLogout}>
					Выход
				</button>
			</div>

			<div className='officer-layout'>
				<LeftPanel />

				<div className='officer-content'>
					{activeTab === 'all' && <AllSoldiers />}
					{activeTab === 'report' && <ReportForm />}
				</div>

				<RightPanel />
			</div>
		</div>
	)
}

export default OfficerPage
