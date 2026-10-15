
export interface User {
  id: number
  fullName: string
  email: string
  createdAt: string
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch('/api/v1/users')

  if (!response.ok) {
    throw new Error('No se pudieron cargar los usuarios')
  }

  return response.json() as Promise<User[]>
}
