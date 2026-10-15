
import { useEffect, useState } from 'react'
import { getBookings, type Booking } from '../api/bookings'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getBookings()
      .then(data => {
        if (active) setBookings(data)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar las reservas')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="container">
      <h1>Reservas</h1>
      <p>Reservas registradas en Parking Lima</p>

      {loading && <p role="status">Cargando reservas...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p>No hay reservas registradas.</p>
      )}

      {!loading && !error && bookings.length > 0 && (
        <ul className="bookings-grid">
          {bookings.map(booking => (
            <li key={booking.id} className="booking-card">
              <strong>Reserva #{booking.id}</strong>
              <span>Usuario: {booking.user_id}</span>
              <span>Espacio: {booking.parking_space_id}</span>
              <span>Inicio: {new Date(booking.starts_at).toLocaleString('es-PE')}</span>
              <span>Fin: {new Date(booking.ends_at).toLocaleString('es-PE')}</span>
              <span>Estado: {booking.status}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
