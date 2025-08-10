import React from 'react'
import { useTheme } from './ThemeContext'

const ThemeToggleButton: React.FC = () => {
	const { theme, toggleTheme } = useTheme()

	return (
		<button onClick={toggleTheme} className='theme-toggle-button'>
			{theme === 'light' ? '🌙' : '☀️'}
		</button>
	)
}

export default ThemeToggleButton
