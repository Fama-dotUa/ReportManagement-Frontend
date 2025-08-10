import React, { createContext, useState, useEffect, useContext } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
	theme: Theme
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const getInitialTheme = (): Theme => {
		const savedTheme = localStorage.getItem('theme') as Theme
		if (savedTheme) {
			return savedTheme
		}
		if (
			window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches
		) {
			return 'dark'
		}
		return 'light'
	}

	const [theme, setTheme] = useState<Theme>(getInitialTheme)

	const toggleTheme = () => {
		setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
	}

	useEffect(() => {
		document.body.setAttribute('data-theme', theme)
		localStorage.setItem('theme', theme)
	}, [theme])

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export const useTheme = (): ThemeContextType => {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
