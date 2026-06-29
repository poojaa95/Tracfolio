import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicRoute from '@/routes/PublicRoute'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import AuthCallback from '@/pages/AuthCallback'
import DashboardLayout from '@/layouts/DashboardLayout'

function App() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<PublicRoute><Login /></PublicRoute>} />
      <Route path={ROUTES.REGISTER} element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Dashboard routes — all wrapped in DashboardLayout */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<Dashboard />} />
        <Route path="applications" element={<div className="p-6"><h1 className="text-xl font-semibold">Applications — Phase 4</h1></div>} />
        <Route path="resumes" element={<div className="p-6"><h1 className="text-xl font-semibold">Resumes — Phase 5</h1></div>} />
        <Route path="questions" element={<div className="p-6"><h1 className="text-xl font-semibold">Interview Questions — Phase 6</h1></div>} />
        <Route path="leetcode" element={<div className="p-6"><h1 className="text-xl font-semibold">LeetCode — Phase 7</h1></div>} />
        <Route path="analytics" element={<div className="p-6"><h1 className="text-xl font-semibold">Analytics — Phase 8</h1></div>} />
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  )
}

export default App