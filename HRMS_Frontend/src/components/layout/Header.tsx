import { Search, User, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  // Simulate attendance marking after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setAttendanceMarked(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    // TODO: Implement real logout logic
    navigate('/login');
  };

  const isActive = isLoggedIn && attendanceMarked;

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
        <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          isActive ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <div className="h-6 w-6 rounded-full bg-card" />
        </div>

        <div className="flex items-center gap-3 border-l border-border pl-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <User className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
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
