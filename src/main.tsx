import { createRoot } from 'react-dom/client';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import App from './App.tsx';
import './index.css';
import { convexClient } from '@/integrations/convex/client';

console.log('App initializing...');
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!convexClient) {
  console.error('VITE_CONVEX_URL is not set. Please configure environment variables.');
}

if (!clerkKey) {
  console.error('VITE_CLERK_PUBLISHABLE_KEY is not set. Please configure environment variables.');
}

if (!convexClient || !clerkKey) {
  createRoot(rootElement).render(
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      flexDirection: 'column',
      gap: '1rem',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1>Configuration Error</h1>
      <p>Required environment variables are not set.</p>
      <p style={{ fontSize: '0.875rem', color: '#666' }}>
        {!convexClient && 'Missing: VITE_CONVEX_URL'}
        {!convexClient && !clerkKey && ' and '}
        {!clerkKey && 'Missing: VITE_CLERK_PUBLISHABLE_KEY'}
      </p>
      <p style={{ fontSize: '0.875rem', color: '#666' }}>
        Please configure environment variables in your deployment settings.
      </p>
    </div>
  );
} else {
  createRoot(rootElement).render(
    <ClerkProvider publishableKey={clerkKey}>
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
  console.log('App mounted');
}
