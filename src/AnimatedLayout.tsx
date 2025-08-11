import React from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

// Настройки анимации
const pageVariants = {
	initial: {
		opacity: 0,
		x: '-100vw',
	},
	in: {
		opacity: 1,
		x: 0,
	},
	out: {
		opacity: 0,
		x: '100vw',
	},
}

const pageTransition = {
	type: 'tween',
	ease: 'anticipate',
	duration: 0.5,
} as const // <-- Вот и все исправление

export const AnimatedLayout = () => {
	return (
		<motion.div
			initial='initial'
			animate='in'
			exit='out'
			variants={pageVariants}
			transition={pageTransition}
		>
			<Outlet />
		</motion.div>
	)
}
