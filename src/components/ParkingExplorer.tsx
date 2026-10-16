
import { useEffect, useState } from 'react'
import {
  getParkings,
  getParkingSpaces,
  type Parking,
  type ParkingSpace,
} from '../api/parkings'

import BookingForm from './BookingForm'

interface ParkingExplorerProps {
  districtId: number
  districtName: string
}

export default function ParkingExplorer({
  districtId,
  districtName,
}: ParkingExplorerProps) {
  const [parkings, setParkings] = useState<Parking[]>([])
  const [selectedParking, setSelectedParking] = useState<number | null>(null)
  const [spaces, setSpaces] = useState<ParkingSpace[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSpaces, setLoadingSpaces] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [spacesError, setSpacesError] = useState<string | null>(null)
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null)

  useEffect(() => {
    let active = true

    getParkings(districtId)
      .then((data) => {
        if (active) setParkings(data)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar los estacionamientos')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [districtId])


  useEffect(() => {
    if (selectedParking === null) {
      return
    }

    let active = true

    getParkingSpaces(selectedParking)
      .then((data) => {
        if (active) {
          setSpaces(data)
        }
      })
      .catch(() => {
        if (active) {
          setSpacesError('No se pudieron cargar los espacios')
        }
      })
      .finally(() => {
        if (active) {
          setLoadingSpaces(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedParking])


  function selectParking(parkingId: number) {
    if (selectedParking === parkingId) return

    setSelectedParking(parkingId)
    setSpaces([])
    setSpacesError(null)
    setLoadingSpaces(true)
    setSelectedSpace(null)
  }

  return (
    <section className="parking-explorer">
      <h2>Estacionamientos en {districtName}</h2>

      {loading && <p role="status">Cargando estacionamientos...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && parkings.length === 0 && (
        <p>No hay estacionamientos registrados en este distrito.</p>
      )}

      {!loading && !error && (
        <div className="parking-list">
          {parkings.map((parking) => (
            <article key={parking.id} className="parking-item">
              <h3>{parking.name}</h3>
              <p>{parking.address}</p>

              <button
                type="button"
                onClick={() => selectParking(parking.id)}
              >
                Ver espacios
              </button>

              {selectedParking === parking.id && (
                <div className="parking-spaces">
                  {loadingSpaces && (
                    <p role="status">Cargando espacios...</p>
                  )}

                  {spacesError && (
                    <p role="alert">{spacesError}</p>
                  )}

                  {!loadingSpaces && !spacesError && spaces.length === 0 && (
                    <p>No hay espacios registrados.</p>
                  )}

                  {!loadingSpaces && !spacesError && spaces.length > 0 && (
                    <div className="spaces-grid">
                      {spaces.map((space) => (

                        <div key={space.id} className="space-item">
                          <strong>{space.code}</strong>

                          <span>
                            {space.is_active ? 'Habilitado' : 'Inhabilitado'}
                          </span>

                          {space.is_active && (
                            <button
                              type="button"
                              onClick={() => setSelectedSpace(space.id)}
                            >
                              Reservar
                            </button>
                          )}
                        </div>

                      ))}
                    </div>
                  )}

                  {!loadingSpaces &&
                    !spacesError &&
                    spaces
                      .filter((space) => space.id === selectedSpace && space.is_active)
                      .map((space) => (
                        <BookingForm
                          key={space.id}
                          parkingSpaceId={space.id}
                          spaceCode={space.code}
                        />
                      ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
