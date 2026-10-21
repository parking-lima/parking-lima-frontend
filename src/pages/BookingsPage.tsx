
import { useEffect, useState } from 'react'
import { getBookings, type Booking } from '../api/bookings'
import { getUsers, type User } from '../api/users'
import {
  getParkings,
  getParkingSpaces,
  type Parking,
  type ParkingSpace,
} from '../api/parkings'

interface SpaceDetails {
  code: string
  parkingName: string
}

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
  const [users, setUsers] = useState<User[]>([])
  const [spaceDetails, setSpaceDetails] = useState<
    Record<string, SpaceDetails>
  >({})

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

  useEffect(() => {
    let active = true

    getUsers()
      .then((data) => {
        if (active) setUsers(data)
      })
      .catch(() => {
        // Los IDs se mantienen visibles si Users Service falla.
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadSpaceDetails() {
      try {
        const parkings: Parking[] = await getParkings()

        const results = await Promise.allSettled(
          parkings.map(async (parking) => {
            const spaces: ParkingSpace[] =
              await getParkingSpaces(parking.id)

            return { parking, spaces }
          }),
        )

        const details: Record<string, SpaceDetails> = {}

        for (const result of results) {
          if (result.status !== 'fulfilled') continue

          const { parking, spaces } = result.value

          for (const space of spaces) {
            details[String(space.id)] = {
              code: space.code,
              parkingName: parking.name,
            }
          }
        }

        if (active) setSpaceDetails(details)
      } catch {
        // Se muestran los IDs si Parking Service falla.
      }
    }

    void loadSpaceDetails()

    return () => {
      active = false
    }
  }, [])

  function getUserName(userId: string): string {
    const user = users.find(
      (item) => item.id === Number(userId),
    )

    return user?.fullName ?? `Usuario #${userId}`
  }

  function getSpaceDetails(spaceId: string): SpaceDetails | null {
    return spaceDetails[spaceId] ?? null
  }

  return (
    <section className="container bookings-page">
      <div className="bookings-page-heading">
        <span className="section-label">
          TU ACTIVIDAD EN PARKING LIMA
        </span>

        <h1>Reservas</h1>
        <p>Consulta aquí el detalle de tus reservas en Parking Lima.</p>
      </div>

      {loading && (
        <p role="status">Cargando reservas...</p>
      )}

      {error && (
        <p role="alert">{error}</p>
      )}

      {!loading && !error && bookings.length === 0 && (
        <p>Aún no tienes reservas registradas.</p>
      )}

      {!loading && !error && bookings.length > 0 && (
        <>
          <div className="bookings-summary">
            <span>Historial de reservas</span>
            <strong>
              {bookings.length}{' '}
              {bookings.length === 1 ? 'reserva' : 'reservas'}
            </strong>
          </div>

          <ul className="bookings-grid">
            {bookings.map((booking) => {
              const space = getSpaceDetails(
                booking.parking_space_id,
              )

              return (
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
                      className={
                        `booking-status booking-status-${booking.status.toLowerCase()}`
                      }
                    >
                      {formatStatus(booking.status)}
                    </span>
                  </div>

                  <div className="booking-card-meta">
                    <div>
                      <span className="booking-meta-label">
                        Usuario
                      </span>
                      <strong>
                        {getUserName(booking.user_id)}
                      </strong>
                    </div>

                    <div>
                      <span className="booking-meta-label">
                        Espacio
                      </span>
                      <strong>
                        {space?.code ??
                          `Espacio #${booking.parking_space_id}`}
                      </strong>
                      {space && (
                        <small>{space.parkingName}</small>
                      )}
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
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
