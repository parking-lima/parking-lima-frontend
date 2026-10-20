
import { useEffect, useState, type FormEvent } from 'react'
import {
  createUser,
  getUsers,
  type User,
} from '../api/users'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  async function handleCreateUser(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (saving) return

    setFormError(null)
    setSuccess(null)

    const name = fullName.trim()
    const userEmail = email.trim()

    if (!name || !userEmail) {
      setFormError('Completa todos los campos.')
      return
    }

    setSaving(true)

    try {
      const newUser = await createUser({
        fullName: name,
        email: userEmail,
      })

      setUsers((current) => [...current, newUser])
      setFullName('')
      setEmail('')
      setShowForm(false)
      setSuccess('Usuario registrado correctamente.')
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar el usuario.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="container users-page">
      <div className="users-page-heading">
        <div>
          <span className="section-label">
            COMUNIDAD PARKING LIMA
          </span>
          <h1>Usuarios registrados</h1>
          <p>Gestiona los usuarios de Parking Lima.</p>
        </div>

        <button
          type="button"
          className="users-new-button"
          onClick={() => {
            setShowForm((current) => !current)
            setFormError(null)
          }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {showForm && (
        <form
          className="user-create-form"
          onSubmit={handleCreateUser}
        >
          <h2>Registrar usuario</h2>
          <p>Ingresa los datos del nuevo usuario.</p>

          <div className="user-form-grid">
            <div className="user-form-field">
              <label htmlFor="user-full-name">
                Nombre completo
              </label>
              <input
                id="user-full-name"
                type="text"
                placeholder="Ej. Juan Pérez"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                maxLength={150}
                required
              />
            </div>

            <div className="user-form-field">
              <label htmlFor="user-email">
                Correo electrónico
              </label>
              <input
                id="user-email"
                type="email"
                placeholder="juan@ejemplo.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                maxLength={255}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="user-submit-button"
            disabled={saving}
          >
            {saving ? 'Registrando...' : 'Crear usuario →'}
          </button>

          {formError && (
            <p role="alert" className="user-form-error">
              {formError}
            </p>
          )}
        </form>
      )}

      {success && (
        <p role="status" className="user-form-success">
          {success}
        </p>
      )}

      {loading && <p role="status">Cargando usuarios...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && users.length === 0 && (
        <p>No hay usuarios registrados.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <ul className="users-grid">
          {users.map((user) => (
            <li key={user.id} className="user-card">
              <div className="user-avatar" aria-hidden="true">
                {user.fullName.charAt(0).toUpperCase()}
              </div>

              <div className="user-card-details">
                <strong>{user.fullName}</strong>
                <span>{user.email}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
