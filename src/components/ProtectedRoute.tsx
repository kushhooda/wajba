import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default ProtectedRoute
