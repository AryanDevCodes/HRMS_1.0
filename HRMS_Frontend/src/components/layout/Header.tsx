import { Search, User, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { format } from 'date-fns';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Fetch today's attendance status
  const { data: todayAttendance } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: async () => {
      try {
        return await apiRequest('/attendance/my-attendance/today');
      } catch (error) {
        return null;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!user,
    retry: false, // Don't retry on error
  }) as { data: any };

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees, departments..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Attendance Status Circle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative flex items-center justify-center">
                {todayAttendance ? (
                  <>
                    {/* Green Glowing Circle */}
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                      <div className="absolute inset-0 h-4 w-4 rounded-full bg-green-500 opacity-75 animate-ping"></div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Red Circle */}
                    <div className="h-8 w-8 rounded-full bg-red-500 shadow-md shadow-red-500/50"></div>
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {todayAttendance ? (
                <div className="text-center">
                  <p className="font-semibold text-green-600">Attendance Marked ✓</p>
                  {todayAttendance.checkIn && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Check-in: {format(new Date(todayAttendance.checkIn), 'hh:mm a')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-red-600 font-semibold">Attendance Not Marked</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="text-right">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role?.toLowerCase().replace('_', ' ')}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
