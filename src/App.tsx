import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect, Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
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
import Unsubscribe from "./pages/Unsubscribe";

// Lazy-loaded admin & affiliate routes
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminAffiliates = lazy(() => import("./pages/admin/AdminAffiliates"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AffiliateDashboard = lazy(() => import("./pages/affiliate/AffiliateDashboard"));
const AffiliateLogin = lazy(() => import("./pages/affiliate/AffiliateLogin"));
const AffiliateRegister = lazy(() => import("./pages/affiliate/AffiliateRegister"));
const AffiliateTerms = lazy(() => import("./pages/affiliate/AffiliateTerms"));
const AffiliateLayout = lazy(() => import("@/components/affiliate/AffiliateLayout").then(m => ({ default: m.AffiliateLayout })));

const queryClient = new QueryClient();

function RefCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("adcure_ref", JSON.stringify({ code: ref, ts: Date.now() }));
    }
  }, []);
  return null;
}

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <RefCapture />
          <ErrorBoundary>
            <Suspense fallback={<LazyFallback />}>
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
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/affiliate" element={<Affiliate />} />
                <Route path="/affiliate/login" element={<AffiliateLogin />} />
                <Route path="/affiliate/register" element={<AffiliateRegister />} />
                <Route path="/affiliate/terms" element={<AffiliateTerms />} />
                <Route path="/affiliate/dashboard" element={<AffiliateLayout />}>
                  <Route index element={<AffiliateDashboard />} />
                </Route>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="subscriptions" element={<AdminSubscriptions />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="affiliates" element={<AdminAffiliates />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
