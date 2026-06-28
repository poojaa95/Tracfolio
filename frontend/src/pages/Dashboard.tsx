import { useAuth } from '@/context/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-900 font-semibold">Welcome, {user?.name}</p>
        <p className="text-gray-500 text-sm mt-1">Dashboard — Phase 3</p>
        <button onClick={logout} className="btn-primary mt-4">Logout</button>
      </div>
    </div>
  )
}

export default Dashboard