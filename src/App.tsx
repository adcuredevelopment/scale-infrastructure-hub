import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import SubscriptionPolicy from "./pages/SubscriptionPolicy";
import FacebookAccounts from "./pages/FacebookAccounts";
import BusinessManagers from "./pages/BusinessManagers";
import FacebookPages from "./pages/FacebookPages";
import FacebookStructures from "./pages/FacebookStructures";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import Affiliate from "./pages/Affiliate";
import AdminLogin from "./pages/AdminLogin";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/subscription-policy" element={<SubscriptionPolicy />} />
            <Route path="/facebook-accounts" element={<FacebookAccounts />} />
            <Route path="/business-managers" element={<BusinessManagers />} />
            <Route path="/facebook-pages" element={<FacebookPages />} />
            <Route path="/facebook-structures" element={<FacebookStructures />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
