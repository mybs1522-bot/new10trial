import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import ResetPassword from "./pages/ResetPassword";
import StudentDashboard from "./pages/StudentDashboard";
import CoursesTab from "./pages/dashboard/CoursesTab";
import BooksTab from "./pages/dashboard/BooksTab";
import CalendarTab from "./pages/dashboard/CalendarTab";
import MessagesTab from "./pages/dashboard/MessagesTab";
import CertificatesTab from "./pages/dashboard/CertificatesTab";
import FreelanceTab from "./pages/dashboard/FreelanceTab";
import ExecutionTab from "./pages/dashboard/ExecutionTab";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentPage from "./pages/PaymentPage";
import StartCourseTab from "./pages/dashboard/StartCourseTab";
import ProfileTab from "./pages/dashboard/ProfileTab";
import NotFound from "./pages/NotFound";
import PreviewPage from "./pages/PreviewPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/start" element={<ProtectedRoute><StartCourseTab /></ProtectedRoute>} />
            <Route path="/dashboard/courses" element={<ProtectedRoute><CoursesTab /></ProtectedRoute>} />
            <Route path="/dashboard/books" element={<ProtectedRoute><BooksTab /></ProtectedRoute>} />
            <Route path="/dashboard/calendar" element={<ProtectedRoute><CalendarTab /></ProtectedRoute>} />
            <Route path="/dashboard/messages" element={<ProtectedRoute><MessagesTab /></ProtectedRoute>} />
            <Route path="/dashboard/certificates" element={<ProtectedRoute><CertificatesTab /></ProtectedRoute>} />
            <Route path="/dashboard/freelance" element={<ProtectedRoute><FreelanceTab /></ProtectedRoute>} />
            <Route path="/dashboard/execution" element={<ProtectedRoute><ExecutionTab /></ProtectedRoute>} />
            <Route path="/dashboard/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><ProfileTab /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
