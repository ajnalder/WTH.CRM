
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageLayout } from "@/components/PageLayout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectPlanning from "./pages/ProjectPlanning";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route
                      path="/projects"
                      element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Projects />
                          </PageLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/projects/:id"
                      element={
                        <ProtectedRoute>
                          <PageLayout>
                            <ProjectDetail />
                          </PageLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/planning"
                      element={
                        <ProtectedRoute>
                          <PageLayout>
                            <ProjectPlanning />
                          </PageLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clients"
                      element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Clients />
                          </PageLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clients/:id"
                      element={
                        <ProtectedRoute>
                          <PageLayout>
                            <ClientDetail />
                          </PageLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/invoices"
                      element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Invoices />
                          </PageLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/invoices/:id"
                      element={
                        <ProtectedRoute>
                          <PageLayout>
                            <InvoiceDetail />
                          </PageLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tasks"
                      element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Tasks />
                          </PageLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tasks/:id"
                      element={
                        <ProtectedRoute>
                          <PageLayout>
                            <TaskDetails />
                          </PageLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Settings />
                          </PageLayout>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
