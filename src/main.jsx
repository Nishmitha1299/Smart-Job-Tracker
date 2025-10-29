// Enable React's StrictMode for highlighting potential issues
import { StrictMode } from 'react'

// Create root for rendering the React app
import { createRoot } from 'react-dom/client'

// Import route definitions
import Routes from './routes/routes.jsx'

// Toast notification system
import { Toaster } from 'react-hot-toast'

// Authentication context provider
import { AuthProvider } from './context/AuthContext.jsx'

// Mount the app to the DOM
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Toast notifications positioned top-right */}
    <Toaster position='top-right'/>

    {/* Provide authentication state to the entire app */}
    <AuthProvider>
      {/* Render all defined routes */}
      <Routes/>
    </AuthProvider>
  </StrictMode>,
)