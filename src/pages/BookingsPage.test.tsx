
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BookingsPage from './BookingsPage'
import { getBookings } from '../api/bookings'
import { getUsers } from '../api/users'
import {
  getParkings,
  getParkingSpaces,
} from '../api/parkings'

vi.mock('../api/bookings', () => ({
  getBookings: vi.fn(),
}))

vi.mock('../api/users', () => ({
  getUsers: vi.fn(),
}))

vi.mock('../api/parkings', () => ({
  getParkings: vi.fn(),
  getParkingSpaces: vi.fn(),
}))

const mockedGetBookings = vi.mocked(getBookings)
const mockedGetUsers = vi.mocked(getUsers)
const mockedGetParkings = vi.mocked(getParkings)
const mockedGetParkingSpaces = vi.mocked(getParkingSpaces)

const demoBooking = {
  id: '14',
  user_id: '7',
  parking_space_id: '1',
  starts_at: '2026-10-25T15:00:00Z',
  ends_at: '2026-10-25T17:00:00Z',
  status: 'PENDING' as const,
  created_at: '2026-10-19T17:53:02Z',
}

describe('BookingsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    mockedGetBookings.mockResolvedValue([demoBooking])

    mockedGetUsers.mockResolvedValue([
      {
        id: 7,
        fullName: 'Usuario yellow',
        email: 'yellow.edition@example.com',
        createdAt: '2026-10-19T12:00:00Z',
      },
    ])

    mockedGetParkings.mockResolvedValue([
      {
        id: 1,
        district_id: 1,
        name: 'Parking Demo Miraflores',
        address: 'Dirección ficticia',
      },
    ])

    mockedGetParkingSpaces.mockResolvedValue([
      {
        id: 1,
        parking_id: 1,
        code: 'A01',
        is_active: true,
      },
    ])
  })

  it('shows loading state', () => {
    mockedGetBookings.mockReturnValue(
      new Promise(() => {}),
    )

    render(<BookingsPage />)

    expect(screen.getByRole('status'))
      .toHaveTextContent('Cargando reservas...')
  })

  it('displays booking details with real names', async () => {
    render(<BookingsPage />)

    expect(
      await screen.findByText('Reserva #14'),
    ).toBeInTheDocument()

    expect(
      await screen.findByText('Usuario yellow'),
    ).toBeInTheDocument()

    expect(
      await screen.findByText('A01'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Parking Demo Miraflores'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Pendiente'),
    ).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    mockedGetBookings.mockResolvedValue([])

    render(<BookingsPage />)

    expect(
      await screen.findByText('No hay reservas registradas.'),
    ).toBeInTheDocument()
  })

  it('shows an error when Booking Service fails', async () => {
    mockedGetBookings.mockRejectedValue(
      new Error('Connection failed'),
    )

    render(<BookingsPage />)

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('No se pudieron cargar las reservas')
  })

  it('uses IDs when Users Service fails', async () => {
    mockedGetUsers.mockRejectedValue(
      new Error('Users unavailable'),
    )

    render(<BookingsPage />)

    expect(
      await screen.findByText('Usuario #7'),
    ).toBeInTheDocument()
  })

  it('uses IDs when Parking Service fails', async () => {
    mockedGetParkings.mockRejectedValue(
      new Error('Parking unavailable'),
    )

    render(<BookingsPage />)

    expect(
      await screen.findByText('Espacio #1'),
    ).toBeInTheDocument()
  })

  it('keeps available spaces when one parking fails', async () => {
    mockedGetParkings.mockResolvedValue([
      {
        id: 1,
        district_id: 1,
        name: 'Parking Demo Miraflores',
        address: 'Dirección ficticia',
      },
      {
        id: 2,
        district_id: 2,
        name: 'Otro estacionamiento',
        address: 'Dirección ficticia',
      },
    ])

    mockedGetParkingSpaces.mockImplementation(
      async (parkingId) => {
        if (parkingId === 2) {
          throw new Error('Unavailable')
        }

        return [
          {
            id: 1,
            parking_id: 1,
            code: 'A01',
            is_active: true,
          },
        ]
      },
    )

    render(<BookingsPage />)

    expect(
      await screen.findByText('A01'),
    ).toBeInTheDocument()
  })
})
