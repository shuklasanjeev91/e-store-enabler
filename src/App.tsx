import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Appearance from "./pages/Appearance";
import Pages from "./pages/Pages";
import PageEditor from "./pages/PageEditor";
import Storefront from "./pages/Storefront";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StorefrontProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/appearance" element={<Appearance />} />
              <Route path="/dashboard/appearance/pages" element={<Pages />} />
              <Route path="/dashboard/appearance/pages/:pageId" element={<PageEditor />} />
              <Route path="/store/:slug" element={<Storefront />} />
              <Route path="/store/:slug/product/:productId" element={<ProductDetail />} />
              <Route path="/store/:slug/checkout" element={<Checkout />} />
              <Route path="/store/:slug/order-success/:orderId" element={<OrderSuccess />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </StorefrontProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
