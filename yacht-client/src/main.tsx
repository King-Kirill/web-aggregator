// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'normalize.css';
import { ToggleProvider } from "./components/ToggleContext";

createRoot(document.getElementById('root')!).render(
  <ToggleProvider>
    <App />
  </ToggleProvider>,
)
