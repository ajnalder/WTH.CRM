
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageLayout } from "@/components/PageLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import Team from "./pages/Team";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import NewInvoice from "./pages/NewInvoice";
import Quotes from "./pages/Quotes";
import QuoteBuilder from "./pages/QuoteBuilder";
import QuoteView from "./pages/QuoteView";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import SiteLaunch from "./pages/SiteLaunch";
import DayPlanner from "./pages/DayPlanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/quote/:token" element={<QuoteView />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <PageLayout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/tasks/:id" element={<TaskDetails />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/clients" element={<Clients />} />
                        <Route path="/clients/:id" element={<ClientDetail />} />
                        <Route path="/quotes" element={<Quotes />} />
                        <Route path="/quote-builder/:id" element={<QuoteBuilder />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/invoices/:id" element={<InvoiceDetail />} />
                        <Route path="/invoices/new" element={<NewInvoice />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/site-launch" element={<SiteLaunch />} />
                        <Route path="/day-planner" element={<DayPlanner />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </PageLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </SidebarProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
