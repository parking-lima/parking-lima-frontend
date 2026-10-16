
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DistrictsPage from './DistrictsPage'
import { getDistricts } from '../api/districts'

vi.mock('../api/districts', () => ({
  getDistricts: vi.fn(),
}))

const mockedGetDistricts = vi.mocked(getDistricts)

const districts = [
  { id: 1, name: 'Miraflores' },
  { id: 2, name: 'San Isidro' },
  { id: 3, name: 'Santiago de Surco' },
  { id: 4, name: 'San Borja' },
  { id: 5, name: 'La Molina' },
]

describe('DistrictsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockedGetDistricts.mockResolvedValue(districts)
  })

  it('displays districts from Parking Service', async () => {
    render(<DistrictsPage />)

    expect(
      await screen.findByText('Miraflores')
    ).toBeInTheDocument()

    expect(screen.getByText('San Isidro')).toBeInTheDocument()
    expect(screen.getByText('La Molina')).toBeInTheDocument()
  })

  it('filters districts by name', async () => {
    const user = userEvent.setup()

    render(<DistrictsPage />)

    await screen.findByText('Miraflores')

    const search = screen.getByRole('searchbox', {
      name: '¿Dónde deseas estacionar?',
    })

    await user.type(search, 'San')

    expect(screen.getByText('San Isidro')).toBeInTheDocument()
    expect(screen.getByText('San Borja')).toBeInTheDocument()
    expect(screen.queryByText('Miraflores')).not.toBeInTheDocument()
  })

  it('shows an empty state when no district matches', async () => {
    const user = userEvent.setup()

    render(<DistrictsPage />)

    await screen.findByText('Miraflores')

    await user.type(
      screen.getByRole('searchbox'),
      'Arequipa'
    )

    expect(
      screen.getByText('No se encontraron distritos.')
    ).toBeInTheDocument()
  })

  it('shows an error when Parking Service fails', async () => {
    mockedGetDistricts.mockRejectedValue(
      new Error('Connection failed')
    )

    render(<DistrictsPage />)

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('No se pudieron cargar los distritos')
  })
})
