
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { getDistricts } from './api/districts'
import { getUsers } from './api/users'
import { getBookings } from './api/bookings'

vi.mock('./api/districts', () => ({
  getDistricts: vi.fn(),
}))

vi.mock('./api/users', () => ({
  getUsers: vi.fn(),
}))

vi.mock('./api/bookings', () => ({
  getBookings: vi.fn(),
}))

const mockedGetDistricts = vi.mocked(getDistricts)
const mockedGetUsers = vi.mocked(getUsers)
const mockedGetBookings = vi.mocked(getBookings)

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
    mockedGetUsers.mockResolvedValue([])
    mockedGetBookings.mockResolvedValue([])
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

    expect(
      screen.getByText('San Isidro')
    ).toBeInTheDocument()
  })

  it('displays the users page', async () => {
    renderAt('/users')

    expect(
      screen.getByRole('heading', {
        name: 'Usuarios registrados',
      })
    ).toBeInTheDocument()

    expect(
      await screen.findByText('No hay usuarios registrados.')
    ).toBeInTheDocument()
  })

  it('displays the bookings page', async () => {
    renderAt('/bookings')

    expect(
      screen.getByRole('heading', { name: 'Reservas' })
    ).toBeInTheDocument()

    expect(
      await screen.findByText('No hay reservas registradas.')
    ).toBeInTheDocument()
  })

  it('displays the not found page', () => {
    renderAt('/unknown')

    expect(
      screen.getByRole('heading', {
        name: 'Página no encontrada',
      })
    ).toBeInTheDocument()
  })

  it('renders the navigation links', async () => {
    mockedGetDistricts.mockResolvedValue([
      { id: 1, name: 'Miraflores' },
    ])

    renderAt('/')

    const navigation = screen.getByRole('navigation', {
      name: 'Navegación principal',
    })

    expect(navigation).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Explorar' })
    ).toHaveAttribute('href', '/')

    expect(
      screen.getByRole('link', { name: 'Reservas' })
    ).toHaveAttribute('href', '/bookings')

    expect(
      screen.getByRole('link', { name: 'Usuarios' })
    ).toHaveAttribute('href', '/users')

    expect(
      await screen.findByText('Miraflores')
    ).toBeInTheDocument()
  })
})
