import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Saints from "./pages/Saints";
import SaintChat from "./pages/SaintChat";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Temples from "./pages/Temples";
import Scriptures from "./pages/Scriptures";
import ScriptureReader from "./pages/ScriptureReader";
import SpiritualCalendar from "./pages/SpiritualCalendar";
import AudioLibrary from "./pages/AudioLibrary";
import Community from "./pages/Community";
import Premium from "./pages/Premium";
import Numerology from "./pages/Numerology";
import DailyDevotion from "./pages/DailyDevotion";
import PalmReading from "./pages/PalmReading";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Main Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Content Routes */}
            <Route path="/saints" element={<Saints />} />
            <Route path="/saints/:saintId/chat" element={<SaintChat />} />
            <Route path="/scriptures" element={<Scriptures />} />
            <Route path="/scriptures/:scriptureId" element={<ScriptureReader />} />
            <Route path="/temples" element={<Temples />} />
            
            {/* Features Routes */}
            <Route path="/spiritual-calendar" element={<SpiritualCalendar />} />
            <Route path="/audio-library" element={<AudioLibrary />} />
            <Route path="/numerology" element={<Numerology />} />
            <Route path="/palm-reading" element={<PalmReading />} />
            <Route path="/daily-devotion" element={<DailyDevotion />} />
            
            {/* Social & Premium */}
            <Route path="/community" element={<Community />} />
            <Route path="/premium" element={<Premium />} />

            {/* CATCH-ALL */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;