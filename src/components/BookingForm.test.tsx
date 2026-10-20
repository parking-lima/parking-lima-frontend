
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BookingForm from './BookingForm'
import { createBooking } from '../api/bookings'
import { getUsers } from '../api/users'

vi.mock('../api/bookings', () => ({
  createBooking: vi.fn(),
}))

vi.mock('../api/users', () => ({
  getUsers: vi.fn(),
}))

const mockedCreateBooking = vi.mocked(createBooking)
const mockedGetUsers = vi.mocked(getUsers)

const demoUsers = [
  {
    id: 1,
    fullName: 'Usuario Demo Lima',
    email: 'demo@example.com',
    createdAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 7,
    fullName: 'Usuario Prueba',
    email: 'prueba@example.com',
    createdAt: '2026-10-18T11:00:00Z',
  },
]

const createdBooking = {
  id: '2',
  user_id: '7',
  parking_space_id: '2',
  starts_at: '2030-10-20T15:00:00.000Z',
  ends_at: '2030-10-20T17:00:00.000Z',
  status: 'PENDING' as const,
  created_at: '2030-10-01T12:00:00.000Z',
}

function fillBookingForm(
  date = '2030-10-20',
  time = '10:00',
) {
  fireEvent.change(screen.getByLabelText('Fecha'), {
    target: { value: date },
  })

  fireEvent.change(screen.getByLabelText('Hora de inicio'), {
    target: { value: time },
  })
}

async function selectDemoUser(
  user: ReturnType<typeof userEvent.setup>,
  id = '7',
) {
  const selector = await screen.findByRole('combobox', {
    name: 'Usuario',
  })

  await waitFor(() => {
    expect(selector).toBeEnabled()
  })

  await user.selectOptions(selector, id)
}

function submitButton() {
  return screen.getByRole('button', {
    name: /Confirmar reserva/,
  })
}

describe('BookingForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    mockedGetUsers.mockResolvedValue(demoUsers)
    mockedCreateBooking.mockResolvedValue(createdBooking)
  })

  it('displays the selected parking space', async () => {
    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />,
    )

    expect(
      screen.getByText('Reservar espacio A02'),
    ).toBeInTheDocument()

    expect(submitButton()).toBeDisabled()

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Usuario' }),
      ).toBeEnabled()
    })

    expect(submitButton()).toBeInTheDocument()
  })

  it('does not submit an invalid past date', async () => {
    const user = userEvent.setup()

    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />,
    )

    await selectDemoUser(user)

    fillBookingForm('2020-01-01', '10:00')

    await user.click(submitButton())

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent(/horario futuro/)

    expect(mockedCreateBooking).not.toHaveBeenCalled()
  })

  it('creates a booking with the selected user', async () => {
    const user = userEvent.setup()

    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />,
    )

    await selectDemoUser(user, '7')

    fillBookingForm()

    await user.click(submitButton())

    await waitFor(() => {
      expect(mockedCreateBooking).toHaveBeenCalledOnce()
    })

    expect(mockedCreateBooking).toHaveBeenCalledWith({
      userId: 7,
      parkingSpaceId: 2,
      startsAt: expect.any(String),
      endsAt: expect.any(String),
    })

    expect(
      await screen.findByText(/Reserva #2 creada correctamente/),
    ).toBeInTheDocument()
  })

  it('shows an error for overlapping bookings', async () => {
    const user = userEvent.setup()

    mockedCreateBooking.mockRejectedValue(
      new Error(
        'Este espacio ya está reservado en el horario seleccionado.',
      ),
    )

    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />,
    )

    await selectDemoUser(user)

    fillBookingForm()

    await user.click(submitButton())

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/ya está reservado/)

    expect(mockedCreateBooking).toHaveBeenCalledOnce()
  })

  it('disables submission while booking is being created', async () => {
    const user = userEvent.setup()

    mockedCreateBooking.mockReturnValue(
      new Promise<Awaited<ReturnType<typeof createBooking>>>(
        () => {},
      ),
    )

    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />,
    )

    await selectDemoUser(user)

    fillBookingForm()

    await user.click(submitButton())

    expect(
      screen.getByRole('button', {
        name: 'Registrando reserva...',
      }),
    ).toBeDisabled()

    expect(mockedCreateBooking).toHaveBeenCalledOnce()
  })

  it('disables booking when there are no users', async () => {
    mockedGetUsers.mockResolvedValue([])

    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />,
    )

    expect(
      await screen.findByText(/No hay usuarios registrados/),
    ).toBeInTheDocument()

    expect(submitButton()).toBeDisabled()
    expect(mockedCreateBooking).not.toHaveBeenCalled()
  })

  it('shows an error when users cannot be loaded', async () => {
    mockedGetUsers.mockRejectedValue(
      new Error('Network error'),
    )

    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />,
    )

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/No se pudieron cargar los usuarios/)

    expect(submitButton()).toBeDisabled()
    expect(mockedCreateBooking).not.toHaveBeenCalled()
  })

  it('does not select a user automatically', async () => {
    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />,
    )

    const selector = screen.getByRole('combobox', {
      name: 'Usuario',
    })

    await waitFor(() => {
      expect(selector).toBeEnabled()
    })

    expect(selector).toHaveValue('')
    expect(submitButton()).toBeInTheDocument()
    expect(mockedCreateBooking).not.toHaveBeenCalled()
  })
})
