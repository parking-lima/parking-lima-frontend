
import { NavLink, Outlet } from 'react-router'
import '../App.css'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="brand">
          Parking Lima
        </NavLink>

        <nav aria-label="Navegación principal">
          <NavLink to="/" end>
            Distritos
          </NavLink>
          <NavLink to="/users">
            Usuarios
          </NavLink>
          <NavLink to="/bookings">
            Reservas
          </NavLink>
        </nav>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}
