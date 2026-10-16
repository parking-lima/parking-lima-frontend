
export interface Booking {
  id: string
  user_id: string
  parking_space_id: string
  starts_at: string
  ends_at: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  created_at: string
}

export async function getBookings(): Promise<Booking[]> {
  const response = await fetch('/api/v1/bookings')

  if (!response.ok) {
    throw new Error('No se pudieron cargar las reservas')
  }

  return response.json() as Promise<Booking[]>
}


export interface CreateBookingRequest {
  userId: number
  parkingSpaceId: number
  startsAt: string
  endsAt: string
}

export async function createBooking(
  data: CreateBookingRequest
): Promise<Booking> {
  const response = await fetch('/api/v1/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (response.status === 409) {
    throw new Error(
      'Este espacio ya está reservado en el horario seleccionado.'
    )
  }

  if (response.status === 400) {
    throw new Error(
      'Los datos de la reserva no son válidos.'
    )
  }

  if (!response.ok) {
    throw new Error(
      'No se pudo registrar la reserva. Inténtalo nuevamente.'
    )
  }

  return response.json() as Promise<Booking>
}
