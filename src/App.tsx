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
import DivineDashboard from "./pages/DivineDashboard";
import DailyDevotion from "./pages/DailyDevotion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/saints" element={<Saints />} />
            <Route path="/saints/:saintId/chat" element={<SaintChat />} />
            <Route path="/temples" element={<Temples />} />
            <Route path="/scriptures" element={<Scriptures />} />
            <Route path="/scriptures/:scriptureId" element={<ScriptureReader />} />
            <Route path="/spiritual-calendar" element={<SpiritualCalendar />} />
            <Route path="/audio-library" element={<AudioLibrary />} />
            <Route path="/community" element={<Community />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/numerology" element={<Numerology />} />
            <Route path="/divine-dashboard" element={<DivineDashboard />} />
            <Route path="/daily-devotion" element={<DailyDevotion />} />

            {/* CATCH-ALL */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
