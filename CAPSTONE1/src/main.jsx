import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply the indigo theme by default
if (typeof document !== 'undefined') {
  const el = document.documentElement
  el.classList.remove('theme-teal')
  el.classList.add('theme-indigo')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
