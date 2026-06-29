import { useAuth } from '@/context/AuthContext'
import { LayoutDashboard } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your job search.
        </p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: '—' },
          { label: 'Interviews', value: '—' },
          { label: 'Offers', value: '—' },
          { label: 'LeetCode Solved', value: '—' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard