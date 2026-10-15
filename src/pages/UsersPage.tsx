
import { useEffect, useState } from 'react'
import { getUsers, type User } from '../api/users'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getUsers()
      .then((data) => {
        if (active) setUsers(data)
      })
      .catch(() => {
        if (active) {
          setError('No se pudieron cargar los usuarios')
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
    <section className="container">
      <h1>Usuarios</h1>
      <p>Usuarios registrados en Parking Lima</p>

      {loading && <p role="status">Cargando usuarios...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && users.length === 0 && (
        <p>No hay usuarios registrados.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <ul className="users-grid">
          {users.map((user) => (
            <li key={user.id} className="user-card">
              <strong>{user.fullName}</strong>
              <span>{user.email}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
