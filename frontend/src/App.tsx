import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import Landing from "./pages/Landing";
import DynamicDashboard from "./pages/DynamicDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅ import ProtectedRoute

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="zetdc-theme">
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<Landing />} />

            {/* Protected dashboard */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DynamicDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
