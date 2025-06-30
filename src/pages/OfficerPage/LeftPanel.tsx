import React from 'react'

const LeftPanel: React.FC = () => {
	return (
		<div className='left-panel'>
			<h3>Последние рапорты</h3>
			<ul className='reports-list'>
				<li>User 1 | @wolf#2023</li>
				<li>User 2 | @storm#1234</li>
			</ul>
		</div>
	)
}

export default LeftPanel
