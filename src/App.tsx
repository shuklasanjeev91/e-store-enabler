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
import CustomizeTheme from "./pages/CustomizeTheme";
import Pages from "./pages/Pages";
import PageEditor from "./pages/PageEditor";
import Menus from "./pages/Menus";
import Blog from "./pages/Blog";
import MediaLibrary from "./pages/MediaLibrary";
import BlogEditor from "./pages/BlogEditor";
import Storefront from "./pages/Storefront";
import StorePage from "./pages/StorePage";
import StorefrontBlog from "./pages/StorefrontBlog";
import StorefrontBlogPost from "./pages/StorefrontBlogPost";
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
              <Route path="/dashboard/appearance/customize" element={<CustomizeTheme />} />
              <Route path="/dashboard/appearance/pages" element={<Pages />} />
              <Route path="/dashboard/appearance/pages/:pageId" element={<PageEditor />} />
              <Route path="/dashboard/appearance/menus" element={<Menus />} />
              <Route path="/dashboard/appearance/blog" element={<Blog />} />
              <Route path="/dashboard/appearance/blog/:postId" element={<BlogEditor />} />
              <Route path="/dashboard/appearance/media" element={<MediaLibrary />} />
              <Route path="/store/:slug" element={<Storefront />} />
              <Route path="/store/:slug/page/:pageSlug" element={<StorePage />} />
              <Route path="/store/:slug/blog" element={<StorefrontBlog />} />
              <Route path="/store/:slug/blog/:postSlug" element={<StorefrontBlogPost />} />
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
