import { useUser } from '../services/authServices'

export default function AdminDashboardPage() {
  const { data: currentUser } = useUser()
  const user = currentUser?.data?.user || currentUser?.user || currentUser

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-400">
            Welcome back, {user?.user_name || 'Admin'}
          </p>
        </div>

        {/* Dashboard Content - To be implemented */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-indigo-600/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Dashboard Coming Soon
            </h3>
            <p className="text-slate-400">
              Admin dashboard features will be added here
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
