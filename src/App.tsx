
import { useEffect, useState } from 'react'
import { getDistricts, type District } from './api/districts'
import './App.css'

function App() {
  const [districts, setDistricts] = useState<District[]>([])
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

  return (
    <main className="container">
      <header>
        <h1>Parking Lima</h1>
        <p>Encuentra estacionamiento en Lima</p>
      </header>

      <section aria-labelledby="districts-title">
        <h2 id="districts-title">Distritos disponibles</h2>

        {loading && <p role="status">Cargando distritos...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && (
          <ul className="district-grid">
            {districts.map((district) => (
              <li key={district.id} className="district-card">
                {district.name}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
