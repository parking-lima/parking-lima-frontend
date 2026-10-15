
import { Routes, Route } from 'react-router'
import AppLayout from './components/AppLayout'
import DistrictsPage from './pages/DistrictsPage'
import UsersPage from './pages/UsersPage'
import BookingsPage from './pages/BookingsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DistrictsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
