import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const AuthPage = () => {
  const location = useLocation()
  const isSignup = location.pathname === '/signup'
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Account created! Setting up your restaurant...')
        navigate('/onboarding')
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // Check if restaurant already set up
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', data.user.id)
          .single()
        navigate(restaurant ? '/dashboard' : '/onboarding')
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center font-black text-2xl text-white mb-10">
          Wajba<span className="text-brand">.</span>
        </Link>

        <h1 className="text-2xl font-black text-white mb-1">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-white/30 text-sm mb-8">
          {isSignup ? 'Get your restaurant online in minutes.' : 'Sign in to your dashboard.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest font-mono mb-1.5">Email</label>
            <input
              type="email"
              required
              placeholder="you@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest font-mono mb-1.5">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 mt-6">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <Link to={isSignup ? '/login' : '/signup'} className="text-brand hover:underline">
            {isSignup ? 'Sign in' : 'Sign up free'}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthPage
