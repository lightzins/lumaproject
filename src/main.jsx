import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import { ClientChat } from './ClientChat.jsx'
import { AdminPanel } from './AdminPanel.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chat" element={<ClientChat />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
