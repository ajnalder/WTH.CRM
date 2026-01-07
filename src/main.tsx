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

const appTree = convexClient && clerkKey ? (
  <ClerkProvider publishableKey={clerkKey}>
    <ConvexProviderWithClerk client={convexClient!} useAuth={useAuth}>
      <App />
    </ConvexProviderWithClerk>
  </ClerkProvider>
) : (
  <App />
);

createRoot(rootElement).render(appTree);
console.log('App mounted');
