import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import '../lib/styles/viewport-glow.css'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Missing #root element for demo app')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
