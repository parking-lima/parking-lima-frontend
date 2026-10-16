
import { NavLink, Outlet } from 'react-router'
import '../App.css'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <NavLink to="/" className="brand">
            <span className="brand-icon" aria-hidden="true">
              P
            </span>
            <span>Parking Lima</span>
          </NavLink>

          <nav className="main-nav" aria-label="Navegación principal">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Explorar
            </NavLink>

            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Reservas
            </NavLink>

            <NavLink
              to="/users"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Usuarios
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>Parking Lima</span>
          <span>Encuentra tu espacio en Lima, Perú.</span>
        </div>
      </footer>
    </div>
  )
}
