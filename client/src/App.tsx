import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { DiscoverPage } from './pages/DiscoverPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { FindNgosPage } from './pages/FindNgosPage'

export function App() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/discover" element={<DiscoverPage />} />
    <Route path="/app/:role" element={<DashboardPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/find-ngos" element={<FindNgosPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
