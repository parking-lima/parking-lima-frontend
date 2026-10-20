
export interface User {
  id: number
  fullName: string
  email: string
  createdAt: string
}

export interface CreateUserRequest {
  fullName: string
  email: string
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch('/api/v1/users')

  if (!response.ok) {
    throw new Error('No se pudieron cargar los usuarios')
  }

  return response.json() as Promise<User[]>
}

export async function createUser(
  data: CreateUserRequest,
): Promise<User> {
  const response = await fetch('/api/v1/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('El correo electrónico ya está registrado.')
    }

    if (response.status === 400) {
      throw new Error('Revisa el nombre y el correo electrónico.')
    }

    throw new Error('No se pudo registrar el usuario.')
  }

  return response.json() as Promise<User>
}
