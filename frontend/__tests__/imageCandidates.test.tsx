import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import PropertyCard from '@/components/PropertyCard'
import { Property } from '@/types/property'

function makeProperty(partial: Partial<Property> & { id: string }): Property {
	return {
		id: partial.id,
		title: partial.title || 'Test Property',
		price: partial.price ?? 100000,
		currency: partial.currency || 'GBP',
		address: partial.address || '123 Test Street, London, SW7',
		city: partial.city || 'London',
		postcode: partial.postcode || 'SW7',
		beds: partial.beds ?? 2,
		image: partial.image || '',
		images: partial.images || [],
		sourceUrl: partial.sourceUrl || '#',
		baths: partial.baths,
		tenure: partial.tenure,
		yield: partial.yield,
		description: partial.description,
		floorArea: partial.floorArea,
		estimatedMonthlyRent: partial.estimatedMonthlyRent,
		estimatedAnnualRent: partial.estimatedAnnualRent,
		isHighYield: partial.isHighYield,
		features: partial.features,
	}
}

describe('PropertyCard image candidates', () => {
	it('prefers cached /api/images first when image_paths exist', () => {
		const propAny: any = makeProperty({
			id: 'p1',
			images: ['https://media.rightmove.co.uk/x.jpg'],
		})
		// simulate cached paths on payload
		propAny.image_paths = ['media_cache\\abc.jpeg']

		render(<PropertyCard property={propAny} showEnquire={false} />)
		const imgs = screen.getAllByRole('img', { name: /test property/i })
		expect(imgs[0].getAttribute('src')).toBe('/api/images/abc.jpeg')
	})

	it('does not produce /api/api in any candidate', () => {
		const propAny: any = makeProperty({
			id: 'p2',
			images: ['https://media.rightmove.co.uk/x.jpg'],
		})
		propAny.image_paths = ['media_cache/foo.jpeg']
		render(<PropertyCard property={propAny} showEnquire={false} />)
		const imgs = screen.getAllByRole('img', { name: /test property/i })
		expect(imgs[0].getAttribute('src')!.includes('/api/api')).toBe(false)
	})

	it('puts fallback only at the end (first choice is cached or remote)', () => {
		const propAny: any = makeProperty({
			id: 'p3',
			images: ['https://media.rightmove.co.uk/x.jpg'],
		})
		// simulate cached exists
		propAny.image_paths = ['media_cache\\zzz.jpeg']
		render(<PropertyCard property={propAny} showEnquire={false} />)
		const img = screen.getAllByRole('img', { name: /test property/i })[0]
		// first src should be cached (not an unsplash fallback)
		const src = img.getAttribute('src') || ''
		expect(src.startsWith('/api/images/')).toBe(true)
	})
})
