import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import LandingPage from '@/pages/LandingPage'
import AuthPage from '@/pages/AuthPage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import MenuPage from '@/pages/MenuPage'
import OrderTrackingPage from '@/pages/OrderTrackingPage'
import BillPage from '@/pages/BillPage'
import NotFound from '@/pages/NotFound'

const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<AuthPage />} />
    <Route path="/signup" element={<AuthPage />} />
    <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/menu/:slug" element={<MenuPage />} />
    <Route path="/order/:orderId" element={<OrderTrackingPage />} />
    <Route path="/bill/:orderId" element={<BillPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
)

export default App
