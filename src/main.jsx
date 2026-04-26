import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const ClientChat = React.lazy(() => import('./ClientChat.jsx').then(m => ({ default: m.ClientChat })));
const AdminPanel = React.lazy(() => import('./AdminPanel.jsx').then(m => ({ default: m.AdminPanel })));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <React.Suspense fallback={<div className="min-h-screen bg-[#0D0D12] flex items-center justify-center text-accent font-mono text-xs uppercase tracking-widest animate-pulse">Iniciando Lume_System...</div>}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/chat" element={<ClientChat />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </React.Suspense>
    </Router>
  </React.StrictMode>,
)
