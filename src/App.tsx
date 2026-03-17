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
import ErrorBoundary from "@/components/ErrorBoundary";

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
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const DeityPage = lazy(() => import("./pages/DeityPage"));

// Admin pages
const AdminRoute = lazy(() => import("./components/admin/AdminRoute"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminAISystems = lazy(() => import("./pages/admin/AdminAISystems"));
const AdminPalmReading = lazy(() => import("./pages/admin/AdminPalmReading"));
const AdminDarshan = lazy(() => import("./pages/admin/AdminDarshan"));
const AdminCommunity = lazy(() => import("./pages/admin/AdminCommunity"));
const AdminShorts = lazy(() => import("./pages/admin/AdminShorts"));
const AdminDonations = lazy(() => import("./pages/admin/AdminDonations"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminCalendar = lazy(() => import("./pages/admin/AdminCalendar"));
const AdminDatabase = lazy(() => import("./pages/admin/AdminDatabase"));
const AdminStorage = lazy(() => import("./pages/admin/AdminStorage"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PremiumProvider>
          <TooltipProvider>
            <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
            <Suspense fallback={<SpiritualLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                
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
                <Route path="/deity/:deitySlug" element={<DeityPage />} />

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

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="ai-systems" element={<AdminAISystems />} />
                  <Route path="palm-reading" element={<AdminPalmReading />} />
                  <Route path="darshan" element={<AdminDarshan />} />
                  <Route path="community" element={<AdminCommunity />} />
                  <Route path="shorts" element={<AdminShorts />} />
                  <Route path="donations" element={<AdminDonations />} />
                  <Route path="subscriptions" element={<AdminSubscriptions />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="calendar" element={<AdminCalendar />} />
                  <Route path="database" element={<AdminDatabase />} />
                  <Route path="storage" element={<AdminStorage />} />
                  <Route path="roles" element={<AdminRoles />} />
                  <Route path="security" element={<AdminSecurity />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="support" element={<AdminSupport />} />
                </Route>

                {/* CATCH-ALL */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
