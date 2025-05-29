import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  PieChart, 
  FileText, 
  BarChart3, 
  Bell, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/auth";

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Portfolio", href: "/portfolio", icon: PieChart },
    { name: "Transactions", href: "/transactions", icon: FileText },
    { name: "Analysis", href: "/analysis", icon: BarChart3 },
    { name: "Alerts", href: "/alerts", icon: Bell },
  ];

  const handleLogout = () => {
    AuthService.logout();
    onLogout();
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40 border-r">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">FundTracker</h1>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="absolute bottom-6 left-6 right-6">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:bg-gray-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
