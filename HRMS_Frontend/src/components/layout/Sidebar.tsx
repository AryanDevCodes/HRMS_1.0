import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  ClipboardCheck, 
  DollarSign, 
  TrendingUp,
  Settings,
  FileText,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  requiredRoles?: string[]; 
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users, requiredRoles: ['ADMIN', 'HR_MANAGER'] },
  { name: 'Leave Management', href: '/leave', icon: CalendarDays },
  { name: 'Attendance', href: '/attendance', icon: ClipboardCheck },
  { name: 'Payroll', href: '/payroll', icon: DollarSign, requiredRoles: ['ADMIN', 'PAYROLL_OFFICER'] },
  { name: 'Performance', href: '/performance', icon: TrendingUp },
  { name: 'Reports', href: '/reports', icon: FileText, requiredRoles: ['ADMIN', 'HR_MANAGER'] },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const { hasRole, user } = useAuth();

  // Filter navigation items based on user role
  const accessibleNavigation = navigation.filter(item => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }
    return hasRole(item.requiredRoles);
  });

  // Use uploaded company logo if available, else fallback
  const logoUrl = user?.companyLogo || "https://cdn.freebiesupply.com/logos/large/2x/odoo-logo-png-transparent.png";

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar">
      {/* Organization Logo and Name */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="WorkZen Logo" className="h-10 w-10 rounded-lg" />
          {/* Organization Name */}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-sidebar-foreground leading-tight">WorkZen</h1>
            <p className="text-xs text-sidebar-foreground/60">HRMS Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {accessibleNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
