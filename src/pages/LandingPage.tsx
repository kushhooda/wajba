import { Link } from 'react-router-dom'
import { ArrowRight, Zap, TrendingDown, Printer, Bell } from 'lucide-react'

const features = [
  { icon: Zap, title: 'Your own ordering page', desc: 'Customers order directly from your branded menu link. No app download needed.' },
  { icon: TrendingDown, title: 'Zero commission', desc: 'Keep 100% of every order. No platform taking 15-30% off the top.' },
  { icon: Bell, title: 'Real-time order alerts', desc: 'Orders appear instantly on your dashboard. Accept or decline in one tap.' },
  { icon: Printer, title: 'Printable bills', desc: 'Generate a clean printed receipt for every order. Perfect for delivery.' },
]

const LandingPage = () => (
  <div className="min-h-screen bg-[#0A0A0A] text-white">
    {/* Nav */}
    <nav className="flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/10">
      <span className="font-black text-xl">Wajba<span className="text-brand">.</span></span>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
        <Link to="/signup" className="bg-brand text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors">
          Get started free
        </Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="px-6 md:px-16 pt-24 pb-20 max-w-5xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded-full mb-8">
        Built for the Middle East
      </div>
      <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-none mb-6">
        Stop paying<br />
        <span className="text-brand">Talabat's cut.</span>
      </h1>
      <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        Give your restaurant a direct ordering page. Customers order, you get paid — no middleman, no commission, no nonsense.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/signup"
          className="flex items-center gap-2 bg-brand text-white font-bold px-6 py-3.5 rounded-xl hover:bg-orange-500 transition-colors text-base w-full sm:w-auto justify-center"
        >
          Create your menu link <ArrowRight size={18} />
        </Link>
        <Link
          to="/menu/demo"
          className="flex items-center gap-2 border border-white/10 text-white/60 hover:text-white hover:border-white/30 font-medium px-6 py-3.5 rounded-xl transition-colors text-base w-full sm:w-auto justify-center"
        >
          See a demo menu
        </Link>
      </div>
    </section>

    {/* Features */}
    <section className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <div key={f.title} className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
              <f.icon size={20} className="text-brand" />
            </div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="px-6 md:px-16 py-20 text-center">
      <h2 className="text-3xl md:text-5xl font-black mb-4">Ready to cut the middleman?</h2>
      <p className="text-white/40 mb-8">Free to start. No credit card needed.</p>
      <Link
        to="/signup"
        className="inline-flex items-center gap-2 bg-brand text-white font-bold px-8 py-4 rounded-xl hover:bg-orange-500 transition-colors text-lg"
      >
        Get your menu link <ArrowRight size={20} />
      </Link>
    </section>

    {/* Footer */}
    <footer className="border-t border-white/10 px-6 md:px-16 py-6 text-center text-white/20 text-sm">
      Wajba · Built by <a href="https://bykush.dev" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Kush Hooda</a> · UAE
    </footer>
  </div>
)

export default LandingPage
