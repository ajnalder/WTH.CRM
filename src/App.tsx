
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageWithSidebar } from "@/components/PageWithSidebar";
import { ReminderNotifier } from "@/components/reminders/ReminderNotifier";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Calendar from "./pages/Calendar";
import DayPlanner from "./pages/DayPlanner";
import Invoices from "./pages/Invoices";
import NewInvoice from "./pages/NewInvoice";
import InvoiceDetail from "./pages/InvoiceDetail";
import Quotes from "./pages/Quotes";
import QuoteBuilder from "./pages/QuoteBuilder";
import PublicQuoteView from "./pages/PublicQuoteView";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import SiteLaunch from "./pages/SiteLaunch";
import Ideas from "./pages/Ideas";
import Domains from "./pages/Domains";
import EmailMarketing from "./pages/EmailMarketing";
import PromoAdminDashboard from "./pages/PromoAdminDashboard";
import PromoAdminImport from "./pages/PromoAdminImport";
import PromoAdminPromotionDetail from "./pages/PromoAdminPromotionDetail";
import PromoPortalHome from "./pages/PromoPortalHome";
import PromoPortalNew from "./pages/PromoPortalNew";
import PromoPortalPromotionDetail from "./pages/PromoPortalPromotionDetail";
import PromoPortalCampaignResults from "./pages/PromoPortalCampaignResults";

const queryClient = new QueryClient();

const ReminderNotifierGate = () => {
  const location = useLocation();
  if (location.pathname.startsWith("/p/")) {
    return null;
  }
  return <ReminderNotifier />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <ReminderNotifierGate />
          <Routes>
            <Route path="/auth/*" element={<Auth />} />
            <Route path="/sign-up/*" element={<SignUp />} />
            <Route path="/quote/view/:token" element={<PublicQuoteView />} />
            <Route path="/" element={<ProtectedRoute><PageWithSidebar><Index /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><PageWithSidebar><Projects /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><PageWithSidebar><ProjectDetail /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><PageWithSidebar><Tasks /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/tasks/:id" element={<ProtectedRoute><PageWithSidebar><TaskDetails /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><PageWithSidebar><Clients /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><PageWithSidebar><ClientDetail /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/domains" element={<ProtectedRoute><PageWithSidebar><Domains /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/quotes" element={<ProtectedRoute><PageWithSidebar><Quotes /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/quotes/new" element={<ProtectedRoute><PageWithSidebar><QuoteBuilder /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/quotes/:id" element={<ProtectedRoute><PageWithSidebar><QuoteBuilder /></PageWithSidebar></ProtectedRoute>} />
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
            <Route path="/admin" element={<ProtectedRoute><PageWithSidebar><PromoAdminDashboard /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/admin/import" element={<ProtectedRoute><PageWithSidebar><PromoAdminImport /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/admin/promotions/:id" element={<ProtectedRoute><PageWithSidebar><PromoAdminPromotionDetail /></PageWithSidebar></ProtectedRoute>} />
            <Route path="/p/:clientId" element={<PromoPortalHome />} />
            <Route path="/p/:clientId/new" element={<PromoPortalNew />} />
            <Route path="/p/:clientId/promotions/:id" element={<PromoPortalPromotionDetail />} />
            <Route
              path="/p/:clientId/promotions/:id/results"
              element={<PromoPortalCampaignResults />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
