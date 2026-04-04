import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { ScenariosPage } from '@/pages/ScenariosPage'
import { ChatPage } from '@/pages/ChatPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/scenarios" element={<ScenariosPage />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  )
}

export default App

