import React from 'react'

const RightPanel: React.FC = () => {
	return (
		<div className='right-panel'>
			<h3>Солдаты</h3>
			<input type='text' placeholder='Поиск...' />
			<ul>
				<li>User 1 | @wolf#2023</li>
				<li>User 2 | @storm#1234</li>
			</ul>
			<button className='add-soldier'>Добавить солдата</button>
		</div>
	)
}

export default RightPanel
