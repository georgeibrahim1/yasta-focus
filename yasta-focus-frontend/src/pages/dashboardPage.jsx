import { useUser } from '../services/authServices'
import AdminDashboardPage from './adminDashboardPage'
import StudentDashboardPage from './studentDashboardPage'

export default function DashboardPage() {
  const { data: currentUser, isLoading } = useUser()
  const user = currentUser?.data?.user || currentUser?.user || currentUser

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    )
  }

  // Admin Dashboard (role 0)
  if (user?.role === 0) {
    return <AdminDashboardPage />
  }

  // Student Dashboard (role 1, 2, or others)
  return <StudentDashboardPage />
}
