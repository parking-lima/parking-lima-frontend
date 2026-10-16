
export interface Parking {
  id: number
  district_id: number
  name: string
  address: string
}

export interface ParkingSpace {
  id: number
  parking_id: number
  code: string
  is_active: boolean
}

export async function getParkings(
  districtId?: number
): Promise<Parking[]> {
  const query =
    districtId === undefined
      ? ''
      : `?district_id=${districtId}`

  const response = await fetch(`/api/v1/parkings${query}`)

  if (!response.ok) {
    throw new Error('No se pudieron cargar los estacionamientos')
  }

  return response.json() as Promise<Parking[]>
}

export async function getParkingSpaces(
  parkingId: number
): Promise<ParkingSpace[]> {
  const response = await fetch(
    `/api/v1/parkings/${parkingId}/spaces`
  )

  if (!response.ok) {
    throw new Error('No se pudieron cargar los espacios')
  }

  return response.json() as Promise<ParkingSpace[]>
}
