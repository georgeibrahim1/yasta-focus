import { Navigate } from 'react-router'
import { useUser } from '../services/authServices'

export default function ProtectedRoute({ children, requiredRole, allowedRoles = [] }) {
  const { data, isLoading, error } = useUser()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (error || !data) {
    return <Navigate to="/auth" replace />
  }

  const user = data?.data?.user

  if (requiredRole !== undefined && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
