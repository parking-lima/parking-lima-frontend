
export interface District {
  id: number
  name: string
}

export async function getDistricts(): Promise<District[]> {
  const response = await fetch('/api/v1/districts')

  if (!response.ok) {
    throw new Error('No se pudieron cargar los distritos')
  }

  return response.json() as Promise<District[]>
}
