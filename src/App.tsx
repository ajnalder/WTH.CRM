
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageWithSidebar } from "@/components/PageWithSidebar";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import Team from "./pages/Team";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Calendar from "./pages/Calendar";
import DayPlanner from "./pages/DayPlanner";
import Invoices from "./pages/Invoices";
import NewInvoice from "./pages/NewInvoice";
import InvoiceDetail from "./pages/InvoiceDetail";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SiteLaunch from "./pages/SiteLaunch";
import Ideas from "./pages/Ideas";
import Domains from "./pages/Domains";
import EmailMarketing from "./pages/EmailMarketing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><PageWithSidebar><Index /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><PageWithSidebar><Projects /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><PageWithSidebar><ProjectDetail /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><PageWithSidebar><Tasks /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/tasks/:id" element={<ProtectedRoute><PageWithSidebar><TaskDetails /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><PageWithSidebar><Team /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><PageWithSidebar><Clients /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><PageWithSidebar><ClientDetail /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/domains" element={<ProtectedRoute><PageWithSidebar><Domains /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><PageWithSidebar><Invoices /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/invoices/new" element={<ProtectedRoute><PageWithSidebar><NewInvoice /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/invoices/:id" element={<ProtectedRoute><PageWithSidebar><InvoiceDetail /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/invoices/:id/edit" element={<ProtectedRoute><PageWithSidebar><InvoiceDetail editMode /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/email-marketing" element={<ProtectedRoute><PageWithSidebar><EmailMarketing /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><PageWithSidebar><Calendar /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/day-planner" element={<ProtectedRoute><PageWithSidebar><DayPlanner /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/site-launch" element={<ProtectedRoute><PageWithSidebar><SiteLaunch /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/ideas" element={<ProtectedRoute><PageWithSidebar><Ideas /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><PageWithSidebar><Reports /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><PageWithSidebar><Settings /></PageWithSidebar></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
