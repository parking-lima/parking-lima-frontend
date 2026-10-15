
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BookingsPage from './BookingsPage'
import { getBookings } from '../api/bookings'

vi.mock('../api/bookings', () => ({
  getBookings: vi.fn(),
}))

const mockedGetBookings = vi.mocked(getBookings)

describe('BookingsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows loading state', () => {
    mockedGetBookings.mockReturnValue(new Promise(() => {}))

    render(<BookingsPage />)

    expect(screen.getByRole('status'))
      .toHaveTextContent('Cargando reservas...')
  })

  it('displays registered bookings', async () => {
    mockedGetBookings.mockResolvedValue([
      {
        id: '1',
        user_id: '1',
        parking_space_id: '1',
        starts_at: '2026-10-20T09:00:00Z',
        ends_at: '2026-10-20T11:00:00Z',
        status: 'PENDING',
        created_at: '2026-10-15T17:53:02Z',
      },
    ])

    render(<BookingsPage />)

    expect(
      await screen.findByText('Reserva #1')
    ).toBeInTheDocument()

    expect(screen.getByText('Usuario: 1')).toBeInTheDocument()
    expect(screen.getByText('Espacio: 1')).toBeInTheDocument()
    expect(screen.getByText('Estado: PENDING')).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    mockedGetBookings.mockResolvedValue([])

    render(<BookingsPage />)

    expect(
      await screen.findByText('No hay reservas registradas.')
    ).toBeInTheDocument()
  })

  it('shows an error when Booking Service fails', async () => {
    mockedGetBookings.mockRejectedValue(
      new Error('Connection failed')
    )

    render(<BookingsPage />)

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('No se pudieron cargar las reservas')
  })
})
