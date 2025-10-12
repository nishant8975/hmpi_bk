import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// 1. Create a QueryClient with a more robust retry strategy
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✨ THE FIX (ENHANCED VERSION) ✨
      
      // Still retry up to 3 times...
      retry: 3,
      
      // ...but now, wait longer between each attempt.
      // 1st retry: wait 2 seconds
      // 2nd retry: wait 4 seconds
      // 3rd retry: wait 8 seconds
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 2. Wrap your app in the QueryClientProvider */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);


