import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/themeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'  // ← ADD THIS

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
          <Toaster
            position="top-right"
            containerStyle={{
              marginRight: '2rem', 
            }}
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(30, 41, 59, 0.85)',
                color: '#fff',
                border: '1px solid #6366f1',
                boxShadow: '0 4px 32px 0 rgba(99,102,241,0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: '1rem',
                fontWeight: 500,
                fontSize: '1rem',
                padding: '0.6rem 1.2rem',
                letterSpacing: '0.01em',
                minWidth: '180px',
                maxWidth: '320px',
              },
              success: {
                duration: 3200,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid #4ade80',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#d1fae5',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid #ef4444',
                  background: 'rgba(239, 68, 68, 0.10)',
                  color: '#fee2e2',
                },
              },
              loading: {
                duration: 5000,
                iconTheme: {
                  primary: '#6366f1',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid #6366f1',
                  background: 'rgba(99, 102, 241, 0.10)',
                  color: '#c7d2fe',
                },
              },
            }}
          />
        </ThemeProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)