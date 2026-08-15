import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MobileServices } from './services/mobileServices'
import { setupServiceWorker } from './pwa/registerServiceWorker'
import { initBackgroundDownloadSync } from './lib/audioDownloadQueue'

// Initialize mobile services for native app
MobileServices.initializeApp()

// Guarded PWA registration (production only, never in Lovable preview)
setupServiceWorker()

// Resume interrupted offline audio downloads (on start + when back online)
initBackgroundDownloadSync()


createRoot(document.getElementById("root")!).render(<App />);

