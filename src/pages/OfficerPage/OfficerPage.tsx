import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoCloseSharp } from 'react-icons/io5'
import { MdOutlineMail } from 'react-icons/md'
import './OfficerPage.css'

import { useAuth } from '../../hooks/useAuth'

import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import AllSoldiers from '../../components/CenterForms/AllSoldiers'
import ReportForm from '../../components/CenterForms/ReportForm'
import ThemeToggleButton from '../../components/ThemeContext/ThemeToggleButton'
import { handleDailyLoginReward } from '../../scripts/dailyReward'
import { BurgerMenu } from '../../components/BurgerMenu/BurgerMenu'

const OfficerPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<'all' | 'report'>('all')
	const navigate = useNavigate()
	const { user, isAuth, role, CR } = useAuth()
	const handleLogout = () => {
		const confirmLogout = window.confirm('Вы действительно хотите выйти?')
		if (confirmLogout) {
			localStorage.removeItem('jwt')
			navigate('/')
		}
	}
	useEffect(() => {
		if (isAuth && user) {
			handleDailyLoginReward(user)
		}
	}, [isAuth, user])

	return (
		<div className='officer-page'>
			<div className='blur-background'></div>

			<div className='officer-nav'>
				<div className='left-nav'>
					<BurgerMenu />
					<ThemeToggleButton />
					<div className='menu'>STV_sqúad</div>
				</div>

				<div className='center-nav'>
					<button
						className={activeTab === 'all' ? 'nav-button active' : 'nav-button'}
						onClick={() => setActiveTab('all')}
					>
						Все солдаты
					</button>
					{role &&
						['officer', 'general', 'comander_officer'].includes(role) && (
							<button
								className={
									activeTab === 'report' ? 'nav-button active' : 'nav-button'
								}
								onClick={() => setActiveTab('report')}
							>
								Создать рапорт
							</button>
						)}
					<button className='nav-button' onClick={() => navigate('/store')}>
						Магазин
					</button>
				</div>

				<div className='right-nav'>
					<label className='label-CR'>
						CR: {CR}/<span id='CR_for_all_time'>{user?.CR_for_all_time}</span>
					</label>
					<button className='nav-button Notifications-nav-button'>
						<MdOutlineMail />
					</button>
					<button className='nav-button exit-nav-button' onClick={handleLogout}>
						<IoCloseSharp />
					</button>
				</div>
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
