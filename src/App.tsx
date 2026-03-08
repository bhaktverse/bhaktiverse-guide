import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PremiumProvider } from "@/hooks/usePremium";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

// Spiritual loading fallback
const SpiritualLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="text-6xl animate-om-pulse">🕉️</div>
      <p className="text-muted-foreground text-sm">Loading...</p>
      <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary/50" />
    </div>
  </div>
);

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Saints = lazy(() => import("./pages/Saints"));
const SaintChat = lazy(() => import("./pages/SaintChat"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Temples = lazy(() => import("./pages/Temples"));
const TempleDetail = lazy(() => import("./pages/TempleDetail"));
const Scriptures = lazy(() => import("./pages/Scriptures"));
const ScriptureReader = lazy(() => import("./pages/ScriptureReader"));
const SpiritualCalendar = lazy(() => import("./pages/SpiritualCalendar"));
const AudioLibrary = lazy(() => import("./pages/AudioLibrary"));
const Community = lazy(() => import("./pages/Community"));
const Premium = lazy(() => import("./pages/Premium"));
const Numerology = lazy(() => import("./pages/Numerology"));
const DailyDevotion = lazy(() => import("./pages/DailyDevotion"));
const PalmReading = lazy(() => import("./pages/PalmReading"));
const Profile = lazy(() => import("./pages/Profile"));
const Horoscope = lazy(() => import("./pages/Horoscope"));
const KundaliMatch = lazy(() => import("./pages/KundaliMatch"));
const SharedPalmReading = lazy(() => import("./pages/SharedPalmReading"));
const Favorites = lazy(() => import("./pages/Favorites"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PremiumProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <Suspense fallback={<SpiritualLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Public Content Routes */}
                <Route path="/saints" element={<Saints />} />
                <Route path="/scriptures" element={<Scriptures />} />
                <Route path="/temples" element={<Temples />} />
                <Route path="/temples/:templeId" element={<TempleDetail />} />
                <Route path="/audio-library" element={<AudioLibrary />} />
                <Route path="/community" element={<Community />} />
                <Route path="/daily-devotion" element={<DailyDevotion />} />
                <Route path="/spiritual-calendar" element={<SpiritualCalendar />} />
                <Route path="/palm-reading/shared/:readingId" element={<SharedPalmReading />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/saints/:saintId/chat" element={<ProtectedRoute><SaintChat /></ProtectedRoute>} />
                <Route path="/scriptures/:scriptureId" element={<ProtectedRoute><ScriptureReader /></ProtectedRoute>} />
                <Route path="/numerology" element={<ProtectedRoute><Numerology /></ProtectedRoute>} />
                <Route path="/palm-reading" element={<ProtectedRoute><PalmReading /></ProtectedRoute>} />
                <Route path="/horoscope" element={<ProtectedRoute><Horoscope /></ProtectedRoute>} />
                <Route path="/kundali-match" element={<ProtectedRoute><KundaliMatch /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />

                {/* CATCH-ALL */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
