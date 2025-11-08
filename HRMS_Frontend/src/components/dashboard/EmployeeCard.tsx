import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeeCardProps {
  employee: {
    employeeId: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    attendanceStatus: string;
    profilePictureUrl?: string;
  };
}

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusIcon = () => {
    switch (employee.attendanceStatus) {
      case 'PRESENT':
        return <Circle className="h-4 w-4 fill-green-500 text-green-500" />;
      case 'ON_LEAVE':
        return <Plane className="h-4 w-4 text-blue-500" />;
      case 'ABSENT':
        return <Circle className="h-4 w-4 fill-yellow-500 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 fill-gray-400 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (employee.attendanceStatus) {
      case 'PRESENT':
        return 'Present in office';
      case 'ON_LEAVE':
        return 'On leave';
      case 'ABSENT':
        return 'Absent (No time off applied)';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Profile Picture */}
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={employee.profilePictureUrl || undefined} 
                alt={`${employee.firstName} ${employee.lastName}`} 
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
            
            {/* Attendance Status Indicator */}
            <div 
              className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"
              title={getStatusText()}
            >
              {getStatusIcon()}
            </div>
          </div>

          {/* Employee Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {employee.employeeCode}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {employee.department}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {employee.email}
            </p>
            
            {/* Status Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                "mt-2 text-xs",
                employee.attendanceStatus === 'PRESENT' && "border-green-500 text-green-700 bg-green-50",
                employee.attendanceStatus === 'ON_LEAVE' && "border-blue-500 text-blue-700 bg-blue-50",
                employee.attendanceStatus === 'ABSENT' && "border-yellow-500 text-yellow-700 bg-yellow-50"
              )}
            >
              {getStatusText()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
