import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section>
      <h1>Página no encontrada</h1>
      <Link to="/">Volver al inicio</Link>
    </section>
  )
}