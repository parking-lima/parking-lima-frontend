
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UsersPage from './UsersPage'
import { getUsers } from '../api/users'

vi.mock('../api/users', () => ({
  getUsers: vi.fn(),
}))

const mockedGetUsers = vi.mocked(getUsers)

describe('UsersPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows loading state', () => {
    mockedGetUsers.mockReturnValue(new Promise(() => {}))

    render(<UsersPage />)

    expect(screen.getByRole('status'))
      .toHaveTextContent('Cargando usuarios...')
  })

  it('displays registered users', async () => {
    mockedGetUsers.mockResolvedValue([
      {
        id: 1,
        fullName: 'Usuario de prueba',
        email: 'prueba@example.com',
        createdAt: '2026-10-15T04:53:57Z',
      },
    ])

    render(<UsersPage />)

    expect(
      await screen.findByText('Usuario de prueba')
    ).toBeInTheDocument()

    expect(
      screen.getByText('prueba@example.com')
    ).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    mockedGetUsers.mockResolvedValue([])

    render(<UsersPage />)

    expect(
      await screen.findByText('No hay usuarios registrados.')
    ).toBeInTheDocument()
  })

  it('shows an error when Users Service fails', async () => {
    mockedGetUsers.mockRejectedValue(
      new Error('Connection failed')
    )

    render(<UsersPage />)

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('No se pudieron cargar los usuarios')
  })
})
