
import { useEffect, useState, type FormEvent } from 'react'
import { createBooking } from '../api/bookings'
import { getUsers, type User } from '../api/users'

interface BookingFormProps {
  parkingSpaceId: number
  spaceCode: string
}

export default function BookingForm({
  parkingSpaceId,
  spaceCode,
}: BookingFormProps) {
  const [users, setUsers] = useState<User[]>([])
  const [userId, setUserId] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getUsers()
      .then((data) => {
        if (active) setUsers(data)
      })
      .catch(() => {
        if (active) {
          setUsersError('No se pudieron cargar los usuarios.')
        }
      })
      .finally(() => {
        if (active) setLoadingUsers(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setError(null)
    setSuccess(null)

    const selectedUserId = Number(userId)

    if (!Number.isSafeInteger(selectedUserId) || selectedUserId <= 0 ||
        !users.some((user) => user.id === selectedUserId)) {
      setError('Selecciona un usuario registrado.')
      return
    }

    if (!date || !time) {
      setError('Selecciona una fecha y hora.')
      return
    }

    const start = new Date(`${date}T${time}:00`)
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000)

    if (
      !Number.isFinite(start.getTime()) ||
      start.getTime() <= Date.now() ||
      !Number.isInteger(duration) ||
      duration < 1
    ) {
      setError('Selecciona un horario futuro válido.')
      return
    }

    setLoading(true)

    try {
      const booking = await createBooking({
        userId: selectedUserId,
        parkingSpaceId,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
      })

      setSuccess(`¡Reserva #${booking.id} creada correctamente!`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la reserva.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="booking-form-heading">
        <span className="booking-form-icon" aria-hidden="true">▣</span>
        <div>
          <h4>Reservar espacio {spaceCode}</h4>
          <p>Completa los datos para confirmar tu reserva.</p>
        </div>
      </div>

      <label htmlFor="booking-user">Usuario</label>
      <select
        id="booking-user"
        value={userId}
        onChange={(event) => setUserId(event.target.value)}
        disabled={loadingUsers || !!usersError || users.length === 0}
        required
      >
        <option value="">
          {loadingUsers ? 'Cargando usuarios...' : 'Seleccionar usuario'}
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.fullName} — {user.email}
          </option>
        ))}
      </select>

      {usersError && <p role="alert">{usersError}</p>}
      {!loadingUsers && !usersError && users.length === 0 && (
        <p role="status">
          No hay usuarios registrados. Registra uno antes de reservar.
        </p>
      )}

      <div className="booking-form-row">
        <div className="booking-field">
          <label htmlFor="booking-date">Fecha</label>
          <input
            id="booking-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <div className="booking-field">
          <label htmlFor="booking-time">Hora de inicio</label>
          <input
            id="booking-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            required
          />
        </div>
      </div>

      <label htmlFor="booking-duration">Duración</label>
      <select
        id="booking-duration"
        value={duration}
        onChange={(event) => setDuration(Number(event.target.value))}
      >
        <option value={1}>1 hora</option>
        <option value={2}>2 horas</option>
        <option value={3}>3 horas</option>
        <option value={4}>4 horas</option>
      </select>

      <button
        type="submit"
        disabled={
          loading ||
          loadingUsers ||
          !!usersError ||
          users.length === 0
        }
      >
        {loading ? 'Registrando reserva...' : 'Confirmar reserva →'}
      </button>

      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
    </form>
  )
}
