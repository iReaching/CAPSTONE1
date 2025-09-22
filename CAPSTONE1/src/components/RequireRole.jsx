import { Navigate } from 'react-router-dom'

export default function RequireRole({ roles = [], children }) {
  const role = localStorage.getItem('role')
  if (!role || (roles.length > 0 && !roles.includes(role))) {
    return <Navigate to="/login" replace />
  }
  return children
}
