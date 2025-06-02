
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserMenu } from "@/components/UserMenu";
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
import InvoiceDetail from "./pages/InvoiceDetail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

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
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <SidebarInset>
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                          <SidebarTrigger className="-ml-1" />
                          <div className="ml-auto">
                            <UserMenu />
                          </div>
                        </header>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/projects" element={<Projects />} />
                          <Route path="/projects/:id" element={<ProjectDetail />} />
                          <Route path="/tasks" element={<Tasks />} />
                          <Route path="/tasks/:id" element={<TaskDetails />} />
                          <Route path="/team" element={<Team />} />
                          <Route path="/clients" element={<Clients />} />
                          <Route path="/clients/:id" element={<ClientDetail />} />
                          <Route path="/invoices" element={<Invoices />} />
                          <Route path="/invoices/:id" element={<InvoiceDetail />} />
                          <Route path="/invoices/:id/edit" element={<InvoiceDetail editMode />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/day-planner" element={<DayPlanner />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </SidebarInset>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
