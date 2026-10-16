
import { useEffect, useState } from 'react'
import { getDistricts, type District } from '../api/districts'

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getDistricts()
      .then((data) => {
        if (active) setDistricts(data)
      })
      .catch(() => {
        if (active) {
          setError('No se pudieron cargar los distritos')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filteredDistricts = districts.filter((district) =>
    district.name
      .toLocaleLowerCase('es-PE')
      .includes(search.trim().toLocaleLowerCase('es-PE'))
  )

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-label">
            TU ESTACIONAMIENTO EN LIMA
          </span>

          <h1>
            Estaciona fácil.
            <br />
            <span>Muévete libre.</span>
          </h1>

          <p>
            Encuentra estacionamientos en los principales
            distritos de Lima. Empieza explorando tu zona.
          </p>

          <div className="search-panel">
            <label htmlFor="district-search">
              ¿Dónde deseas estacionar?
            </label>

            <div className="search-field">
              <input
                id="district-search"
                type="search"
                placeholder="Buscar distrito..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className="districts-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              EXPLORA LIMA
            </span>
            <h2>Encuentra tu distrito</h2>
            <p>
              Explora las zonas disponibles en Parking Lima.
            </p>
          </div>

          <span className="district-counter">
            {filteredDistricts.length} distritos
          </span>
        </div>

        {loading && (
          <p role="status">Cargando distritos...</p>
        )}

        {error && (
          <p role="alert">{error}</p>
        )}

        {!loading && !error && filteredDistricts.length === 0 && (
          <p>No se encontraron distritos.</p>
        )}

        {!loading && !error && filteredDistricts.length > 0 && (
          <div className="district-grid">
            {filteredDistricts.map((district) => (
              <article
                key={district.id}
                className="district-card"
              >
                <div className="district-icon" aria-hidden="true">
                  📍
                </div>

                <h3>{district.name}</h3>
                <p>Lima, Perú</p>

                <span className="district-explore">
                  Distrito disponible →
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
