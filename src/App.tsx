import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
