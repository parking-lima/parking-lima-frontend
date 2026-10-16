
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BookingForm from './BookingForm'
import { createBooking } from '../api/bookings'

vi.mock('../api/bookings', () => ({
  createBooking: vi.fn(),
}))

const mockedCreateBooking = vi.mocked(createBooking)

const createdBooking = {
  id: '2',
  user_id: '1',
  parking_space_id: '2',
  starts_at: '2030-10-20T15:00:00.000Z',
  ends_at: '2030-10-20T17:00:00.000Z',
  status: 'PENDING' as const,
  created_at: '2030-10-01T12:00:00.000Z',
}

// Helper para completar el formulario
function fillBookingForm(
  date = '2030-10-20',
  time = '10:00'
) {
  fireEvent.change(screen.getByLabelText('Fecha'), {
    target: { value: date },
  })

  fireEvent.change(screen.getByLabelText('Hora de inicio'), {
    target: { value: time },
  })
}

describe('BookingForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockedCreateBooking.mockResolvedValue(createdBooking)
  })

  it('displays the selected parking space', () => {
    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />
    )

    expect(
      screen.getByText('Reservar espacio A02')
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Confirmar reserva',
      })
    ).toBeInTheDocument()
  })

  it('does not submit an invalid past date', async () => {
    const user = userEvent.setup()

    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />
    )

    fillBookingForm('2020-01-01', '10:00')

    await user.click(
      screen.getByRole('button', {
        name: 'Confirmar reserva',
      })
    )

    expect(
      screen.getByRole('alert')
    ).toHaveTextContent(
      'Selecciona un horario futuro válido.'
    )

    expect(mockedCreateBooking).not.toHaveBeenCalled()
  })

  it('creates a booking successfully', async () => {
    const user = userEvent.setup()

    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />
    )

    fillBookingForm()

    await user.click(
      screen.getByRole('button', {
        name: 'Confirmar reserva',
      })
    )

    await waitFor(() => {
      expect(mockedCreateBooking).toHaveBeenCalledOnce()
    })

    expect(mockedCreateBooking).toHaveBeenCalledWith({
      userId: 1,
      parkingSpaceId: 2,
      startsAt: expect.any(String),
      endsAt: expect.any(String),
    })

    expect(
      await screen.findByText(
        '¡Reserva #2 creada correctamente!'
      )
    ).toBeInTheDocument()
  })

  it('shows an error for overlapping bookings', async () => {
    const user = userEvent.setup()

    mockedCreateBooking.mockRejectedValue(
      new Error(
        'Este espacio ya está reservado en el horario seleccionado.'
      )
    )

    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />
    )

    fillBookingForm()

    await user.click(
      screen.getByRole('button', {
        name: 'Confirmar reserva',
      })
    )

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'Este espacio ya está reservado en el horario seleccionado.'
    )

    expect(mockedCreateBooking).toHaveBeenCalledOnce()
  })

  it('disables submission while booking is being created', async () => {
    const user = userEvent.setup()

    mockedCreateBooking.mockReturnValue(
      new Promise<Awaited<ReturnType<typeof createBooking>>>(
        () => {}
      )
    )

    render(
      <BookingForm parkingSpaceId={2} spaceCode="A02" />
    )

    fillBookingForm()

    await user.click(
      screen.getByRole('button', {
        name: 'Confirmar reserva',
      })
    )

    expect(
      screen.getByRole('button', {
        name: 'Registrando reserva...',
      })
    ).toBeDisabled()

    expect(mockedCreateBooking).toHaveBeenCalledOnce()
  })
})
