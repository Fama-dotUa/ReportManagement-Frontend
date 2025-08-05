// src/components/ContentSection/ContentSection.tsx
import React from 'react'

export type SectionTheme = 'sky' | 'orange' | 'emerald'

interface ContentSectionProps {
	title: string
	theme: SectionTheme
	children: React.ReactNode
}

export const ContentSection: React.FC<ContentSectionProps> = ({
	title,
	theme,
	children,
}) => {
	const sectionClassName = `section section-${theme}`

	return (
		<section className={sectionClassName}>
			<h2>{title}</h2>
			<div className='cards-grid'>{children}</div>
		</section>
	)
}
