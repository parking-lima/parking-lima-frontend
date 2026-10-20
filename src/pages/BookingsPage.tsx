
import { useEffect, useState } from 'react'
import { getBookings, type Booking } from '../api/bookings'

function formatBookingDate(value: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Lima',
  }).format(new Date(value))
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  }

  return labels[status] ?? status
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getBookings()
      .then((data) => {
        if (active) setBookings(data)
      })
      .catch(() => {
        if (active) {
          setError('No se pudieron cargar las reservas')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="container bookings-page">
      <div className="bookings-page-heading">
        <span className="section-label">
          TU ACTIVIDAD EN PARKING LIMA
        </span>

        <h1>Reservas</h1>
        <p>Reservas registradas en Parking Lima</p>
      </div>

      {loading && (
        <p role="status">Cargando reservas...</p>
      )}

      {error && (
        <p role="alert">{error}</p>
      )}

      {!loading && !error && bookings.length === 0 && (
        <p>No hay reservas registradas.</p>
      )}

      {!loading && !error && bookings.length > 0 && (
        <>
          <div className="bookings-summary">
            <span>Historial de reservas</span>
            <strong>
              {bookings.length} {bookings.length === 1
                ? 'reserva'
                : 'reservas'}
            </strong>
          </div>

          <ul className="bookings-grid">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="booking-card booking-card-modern"
              >
                <div className="booking-card-header">
                  <div>
                    <span className="booking-eyebrow">
                      RESERVA REGISTRADA
                    </span>

                    <h2>Reserva #{booking.id}</h2>
                  </div>

                  <span
                    className={`booking-status booking-status-${booking.status.toLowerCase()}`}
                  >
                    {formatStatus(booking.status)}
                  </span>
                </div>

                <div className="booking-card-meta">
                  <div>
                    <span className="booking-meta-label">
                      Usuario
                    </span>
                    <strong>Usuario: {booking.user_id}</strong>
                  </div>

                  <div>
                    <span className="booking-meta-label">
                      Espacio
                    </span>
                    <strong>Espacio: {booking.parking_space_id}</strong>
                  </div>
                </div>

                <div className="booking-card-dates">
                  <div>
                    <span>Inicio</span>
                    <strong>
                      {formatBookingDate(booking.starts_at)}
                    </strong>
                  </div>

                  <div>
                    <span>Fin</span>
                    <strong>
                      {formatBookingDate(booking.ends_at)}
                    </strong>
                  </div>
                </div>

                <span className="booking-status-raw">
                  Estado: {booking.status}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
