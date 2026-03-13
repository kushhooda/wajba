import { Link } from 'react-router-dom'

const NotFound = () => (
  <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-center px-6">
    <div>
      <p className="text-brand font-mono text-sm uppercase tracking-widest mb-3">404</p>
      <h1 className="text-4xl font-black text-white mb-3">Page not found</h1>
      <p className="text-white/30 mb-8">This page doesn't exist.</p>
      <Link to="/" className="text-brand hover:underline text-sm font-medium">← Go home</Link>
    </div>
  </div>
)

export default NotFound
