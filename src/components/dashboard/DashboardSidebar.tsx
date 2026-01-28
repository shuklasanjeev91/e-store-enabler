import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Truck,
  Package,
  BarChart3,
  Wallet,
  Percent,
  Users,
  Palette,
  Puzzle,
  Settings,
  ExternalLink,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  storeName: string;
  storeSlug: string;
}

const navItems = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Orders", icon: ShoppingCart, path: "/dashboard/orders" },
  { label: "Delivery", icon: Truck, path: "/dashboard/delivery" },
  { label: "Products", icon: Package, path: "/dashboard/products" },
  { label: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
  { label: "Payouts", icon: Wallet, path: "/dashboard/payouts" },
  { label: "Discounts", icon: Percent, path: "/dashboard/discounts" },
  { label: "Audience", icon: Users, path: "/dashboard/audience" },
  { label: "Appearance", icon: Palette, path: "/dashboard/appearance" },
  { label: "Plugins", icon: Puzzle, path: "/dashboard/plugins" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

export default function DashboardSidebar({ storeName, storeSlug }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b bg-slate-900 px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              {storeName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-semibold text-white">{storeName}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col bg-slate-900 text-white transition-all duration-300",
          isCollapsed ? "w-16" : "w-56",
          "lg:translate-x-0",
          isCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="hidden h-14 items-center justify-between border-b border-white/10 px-4 lg:flex">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                {storeName.charAt(0).toUpperCase()}
              </span>
            </div>
            {!isCollapsed && (
              <span className="truncate font-semibold">{storeName}</span>
            )}
          </div>
          <a
            href={`/store/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-white/60 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="hidden border-t border-white/10 p-2 lg:block">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "rotate-180"
              )}
            />
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
