
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import UsersPage from './UsersPage'
import { createUser, getUsers } from '../api/users'

vi.mock('../api/users', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
}))

const mockedGetUsers = vi.mocked(getUsers)
const mockedCreateUser = vi.mocked(createUser)

const existingUser = {
  id: 1,
  fullName: 'Usuario de prueba',
  email: 'prueba@example.com',
  createdAt: '2026-10-15T04:53:57Z',
}

const newUser = {
  id: 7,
  fullName: 'Juan Pérez',
  email: 'juan@example.com',
  createdAt: '2026-10-19T12:00:00Z',
}

async function openRegistrationForm(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(
    screen.getByRole('button', { name: /Nuevo usuario/ }),
  )
}

async function fillRegistrationForm(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(
    screen.getByLabelText('Nombre completo'),
    'Juan Pérez',
  )

  await user.type(
    screen.getByLabelText('Correo electrónico'),
    'juan@example.com',
  )
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockedGetUsers.mockResolvedValue([])
    mockedCreateUser.mockResolvedValue(newUser)
  })

  // Pruebas originales

  it('shows loading state', () => {
    mockedGetUsers.mockReturnValue(
      new Promise(() => {}),
    )

    render(<UsersPage />)

    expect(screen.getByRole('status'))
      .toHaveTextContent('Cargando usuarios...')
  })

  it('displays registered users', async () => {
    mockedGetUsers.mockResolvedValue([existingUser])

    render(<UsersPage />)

    expect(
      await screen.findByText('Usuario de prueba'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('prueba@example.com'),
    ).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    render(<UsersPage />)

    expect(
      await screen.findByText('No hay usuarios registrados.'),
    ).toBeInTheDocument()
  })

  it('shows an error when Users Service fails', async () => {
    mockedGetUsers.mockRejectedValue(
      new Error('Connection failed'),
    )

    render(<UsersPage />)

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('No se pudieron cargar los usuarios')
  })

  // Nuevas pruebas del registro

  it('opens and closes the registration form', async () => {
    const user = userEvent.setup()

    render(<UsersPage />)

    await openRegistrationForm(user)

    expect(
      screen.getByRole('heading', { name: 'Registrar usuario' }),
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText('Nombre completo'),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Cancelar' }),
    )

    expect(
      screen.queryByRole('heading', {
        name: 'Registrar usuario',
      }),
    ).not.toBeInTheDocument()
  })

  it('creates a user and updates the list', async () => {
    const user = userEvent.setup()

    mockedGetUsers.mockResolvedValue([existingUser])

    render(<UsersPage />)

    await screen.findByText('Usuario de prueba')

    await openRegistrationForm(user)
    await fillRegistrationForm(user)

    await user.click(
      screen.getByRole('button', { name: /Crear usuario/ }),
    )

    await waitFor(() => {
      expect(mockedCreateUser).toHaveBeenCalledOnce()
    })

    expect(mockedCreateUser).toHaveBeenCalledWith({
      fullName: 'Juan Pérez',
      email: 'juan@example.com',
    })

    expect(
      await screen.findByText('Juan Pérez'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('juan@example.com'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Usuario de prueba'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent('Usuario registrado correctamente.')
  })

  it('requires a valid name and email', async () => {
    const user = userEvent.setup()

    render(<UsersPage />)

    await openRegistrationForm(user)

    const nameInput = screen.getByLabelText('Nombre completo')
    const emailInput = screen.getByLabelText('Correo electrónico')

    expect(nameInput).toBeRequired()
    expect(emailInput).toBeRequired()

    await user.type(nameInput, 'Juan Pérez')
    await user.type(emailInput, 'correo-invalido')

    expect(emailInput).toBeInvalid()
    expect(mockedCreateUser).not.toHaveBeenCalled()
  })

  it('shows an error when user creation fails', async () => {
    const user = userEvent.setup()

    mockedCreateUser.mockRejectedValue(
      new Error('El correo electrónico ya está registrado.'),
    )

    render(<UsersPage />)

    await openRegistrationForm(user)
    await fillRegistrationForm(user)

    await user.click(
      screen.getByRole('button', { name: /Crear usuario/ }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/correo electrónico ya está registrado/)

    expect(
      screen.queryByText('Juan Pérez'),
    ).not.toBeInTheDocument()
  })

  it('disables submission while creating a user', async () => {
    const user = userEvent.setup()

    mockedCreateUser.mockReturnValue(
      new Promise<Awaited<ReturnType<typeof createUser>>>(
        () => {},
      ),
    )

    render(<UsersPage />)

    await openRegistrationForm(user)
    await fillRegistrationForm(user)

    await user.click(
      screen.getByRole('button', { name: /Crear usuario/ }),
    )

    expect(
      screen.getByRole('button', { name: 'Registrando...' }),
    ).toBeDisabled()

    expect(mockedCreateUser).toHaveBeenCalledOnce()
  })
})
