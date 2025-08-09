import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { 
  DollarSign, 
  LayoutDashboard, 
  Receipt, 
  Settings, 
  LogOut, 
  Menu,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActiveRoute = (href) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  // Get current page title
  const getCurrentPageTitle = () => {
    const currentNav = navigation.find(nav => isActiveRoute(nav.href));
    return currentNav ? currentNav.name : "Dashboard";
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-6">
            <DollarSign size={24} className="text-white mr-3" />
            <h1 className="text-lg font-medium text-white">ExpenseTracker</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }
                  `}
                >
                  <Icon size={18} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Mobile menu + Page title */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-zinc-400 hover:text-white mr-4 lg:hidden"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-medium text-white">
                {getCurrentPageTitle()}
              </h1>
            </div>

            {/* Right: Add Expense + Logout */}
            <div className="flex items-center space-x-3">
              <Button 
                asChild
                size="sm"
                className="bg-white text-black hover:bg-zinc-200 font-medium"
              >
                <Link to="/expenses/new">
                  <Plus size={16} className="mr-2" />
                  Add Expense
                </Link>
              </Button>
              
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}