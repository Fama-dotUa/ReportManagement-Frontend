import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/ThemeContext/ThemeContext.tsx'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,         // sensible default
      gcTime: 30 * 60 * 1000,           // keep cache around for 30m
      retry: 1,                         // fail fast
      refetchOnWindowFocus: false,      // do not spam on focus
      refetchOnReconnect: true,
      structuralSharing: true,
    },
    mutations: {
      retry: 0,
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)
