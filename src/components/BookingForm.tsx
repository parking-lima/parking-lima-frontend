
import { useState, type FormEvent } from 'react'
import { createBooking } from '../api/bookings'

interface BookingFormProps {
  parkingSpaceId: number
  spaceCode: string
}

export default function BookingForm({
  parkingSpaceId,
  spaceCode,
}: BookingFormProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setError(null)
    setSuccess(null)

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
        userId: 1,
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
      <h4>Reservar espacio {spaceCode}</h4>

      <p>Selecciona cuándo deseas estacionar.</p>

      <label htmlFor="booking-date">Fecha</label>
      <input
        id="booking-date"
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        required
      />

      <label htmlFor="booking-time">Hora de inicio</label>
      <input
        id="booking-time"
        type="time"
        value={time}
        onChange={(event) => setTime(event.target.value)}
        required
      />

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

      <button type="submit" disabled={loading}>
        {loading ? 'Registrando reserva...' : 'Confirmar reserva'}
      </button>

      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
    </form>
  )
}
