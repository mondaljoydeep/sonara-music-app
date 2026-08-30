import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlayerProvider } from "@/context/PlayerContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGateProvider } from "@/components/AuthGate";
import { SonaraSplash } from "@/components/SonaraSplash";
import { AppShell } from "@/components/layout/AppShell";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import FullPlayer from "./pages/FullPlayer";
import Login from "./pages/Login";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Artist from "./pages/Artist";
import UploadPage from "./pages/UploadPage";
import Community from "./pages/Community";
import CreatorProfile from "./pages/CreatorProfile";
import { RoleOnboarding } from "./components/RoleOnboarding";
import { FavoriteArtistsOnboarding } from "./components/FavoriteArtistsOnboarding";
import NotFound from "./pages/NotFound";
import BlogSunoVsUdio from "./pages/BlogSunoVsUdio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PlayerProvider>
            <ToastProvider>
              <AuthGateProvider>
                <SonaraSplash />
                <RoleOnboarding />
                <FavoriteArtistsOnboarding />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/player" element={<FullPlayer />} />
                  <Route path="/upload" element={<AppShell><UploadPage /></AppShell>} />
                  <Route path="/community" element={<AppShell><Community /></AppShell>} />
                  <Route path="/creator/:id" element={<AppShell><CreatorProfile /></AppShell>} />
                  <Route path="/" element={<AppShell><Home /></AppShell>} />
                  <Route path="/search" element={<AppShell><Search /></AppShell>} />
                  <Route path="/library" element={<AppShell><Library /></AppShell>} />
                  <Route path="/profile" element={<AppShell><Profile /></AppShell>} />
                  <Route path="/artist/:id" element={<AppShell><Artist /></AppShell>} />
                  <Route path="/blog/suno-vs-udio" element={<BlogSunoVsUdio />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthGateProvider>
            </ToastProvider>
          </PlayerProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
