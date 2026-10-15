
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { getDistricts } from './api/districts'

vi.mock('./api/districts', () => ({
  getDistricts: vi.fn(),
}))

const mockedGetDistricts = vi.mocked(getDistricts)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

describe('Parking Lima navigation', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockedGetDistricts.mockResolvedValue([])
  })

  it('displays districts on the home page', async () => {
    mockedGetDistricts.mockResolvedValue([
      { id: 1, name: 'Miraflores' },
      { id: 2, name: 'San Isidro' },
    ])

    renderAt('/')

    expect(
      await screen.findByText('Miraflores')
    ).toBeInTheDocument()

    expect(screen.getByText('San Isidro')).toBeInTheDocument()
  })

  it('displays the users page', () => {
    renderAt('/users')

    expect(
      screen.getByRole('heading', { name: 'Usuarios' })
    ).toBeInTheDocument()
  })

  it('displays the bookings page', () => {
    renderAt('/bookings')

    expect(
      screen.getByRole('heading', { name: 'Reservas' })
    ).toBeInTheDocument()
  })

  it('displays the not found page', () => {
    renderAt('/unknown')

    expect(
      screen.getByRole('heading', { name: 'Página no encontrada' })
    ).toBeInTheDocument()
  })

  it('renders the navigation links', () => {
    renderAt('/users')

    const navigation = screen.getByRole('navigation', {
      name: 'Navegación principal',
    })

    expect(navigation).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Distritos' })
    ).toHaveAttribute('href', '/')
    expect(
      screen.getByRole('link', { name: 'Reservas' })
    ).toHaveAttribute('href', '/bookings')
  })
})
