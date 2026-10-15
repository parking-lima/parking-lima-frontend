
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { getDistricts } from './api/districts'

vi.mock('./api/districts', () => ({
  getDistricts: vi.fn(),
}))

const mockedGetDistricts = vi.mocked(getDistricts)

describe('Parking Lima App', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows loading state', () => {
    mockedGetDistricts.mockReturnValue(new Promise(() => {}))

    render(<App />)

    expect(
      screen.getByRole('status')
    ).toHaveTextContent('Cargando distritos...')
  })

  it('displays districts returned by Parking Service', async () => {
    mockedGetDistricts.mockResolvedValue([
      { id: 1, name: 'Miraflores' },
      { id: 2, name: 'San Isidro' },
      { id: 3, name: 'Santiago de Surco' },
      { id: 4, name: 'San Borja' },
      { id: 5, name: 'La Molina' },
    ])

    render(<App />)

    expect(
      await screen.findByText('Miraflores')
    ).toBeInTheDocument()

    expect(screen.getByText('San Isidro')).toBeInTheDocument()
    expect(screen.getByText('Santiago de Surco')).toBeInTheDocument()
    expect(screen.getByText('San Borja')).toBeInTheDocument()
    expect(screen.getByText('La Molina')).toBeInTheDocument()
  })

  it('shows an error when Parking Service fails', async () => {
    mockedGetDistricts.mockRejectedValue(
      new Error('Network error')
    )

    render(<App />)

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('No se pudieron cargar los distritos')
  })
})
