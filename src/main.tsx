import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MobileServices } from './services/mobileServices'
import { setupServiceWorker } from './pwa/registerServiceWorker'

// Initialize mobile services for native app
MobileServices.initializeApp()

// Guarded PWA registration (production only, never in Lovable preview)
setupServiceWorker()

createRoot(document.getElementById("root")!).render(<App />);

