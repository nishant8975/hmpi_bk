import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// 1. Create a QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✨ THE FIX: Set the default retry count for ALL queries to 3.
      // This will automatically handle cold starts by giving the server
      // more time to wake up before failing.
      retry: 3,
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

