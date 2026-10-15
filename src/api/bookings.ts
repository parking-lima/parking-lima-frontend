
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
