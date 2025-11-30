import { useUser } from '../services/authServices'

export default function ProtectedComponent({ 
  children, 
  requiredRole,
  allowedRoles = [],
  fallback = null 
}) {
  const { data } = useUser()
  const user = data?.data?.user

  if (!user) {
    return fallback
  }

  if (requiredRole !== undefined && user.role !== requiredRole) {
    return fallback
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return fallback
  }

  return children
}
