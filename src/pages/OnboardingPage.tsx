import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const OnboardingPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    phone: '',
    address: '',
    currency: 'AED',
  })
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    setForm((f) => ({ ...f, name, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!form.name.trim() || !form.slug.trim()) { toast.error('Name and URL slug are required'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('restaurants').insert({
        owner_id: user.id,
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        currency: form.currency,
      })
      if (error) throw error
      toast.success('Restaurant created!')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create restaurant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <span className="font-black text-2xl text-white block mb-2">Wajba<span className="text-brand">.</span></span>
        <h1 className="text-3xl font-black text-white mb-1">Set up your restaurant</h1>
        <p className="text-white/30 text-sm mb-8">Takes 2 minutes. You can edit everything later.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest font-mono mb-1.5">Restaurant Name *</label>
            <input
              type="text" required placeholder="e.g. Al Baik Express"
              value={form.name} onChange={handleNameChange}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest font-mono mb-1.5">Your Menu URL *</label>
            <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden focus-within:border-brand transition-colors">
              <span className="text-white/30 text-sm pl-4 pr-1 whitespace-nowrap">wajba.app/menu/</span>
              <input
                type="text" required placeholder="al-baik-express"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                className="flex-1 bg-transparent px-2 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none"
              />
            </div>
            <p className="text-white/20 text-xs font-mono mt-1">Only lowercase letters, numbers and hyphens</p>
          </div>

          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest font-mono mb-1.5">Description</label>
            <textarea
              rows={2} placeholder="What kind of food do you serve?"
              value={form.description} onChange={set('description')}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest font-mono mb-1.5">Phone</label>
              <input
                type="tel" placeholder="+971 50 000 0000"
                value={form.phone} onChange={set('phone')}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest font-mono mb-1.5">Currency</label>
              <select value={form.currency} onChange={set('currency')}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors appearance-none"
              >
                <option value="AED">AED — UAE Dirham</option>
                <option value="KWD">KWD — Kuwaiti Dinar</option>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="QAR">QAR — Qatari Riyal</option>
                <option value="BHD">BHD — Bahraini Dinar</option>
                <option value="OMR">OMR — Omani Rial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest font-mono mb-1.5">Address</label>
            <input
              type="text" placeholder="Building, Street, Area, City"
              value={form.address} onChange={set('address')}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 text-base mt-2"
          >
            {loading ? 'Creating…' : 'Create my restaurant →'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default OnboardingPage
