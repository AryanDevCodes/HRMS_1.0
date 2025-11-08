import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import PerformanceReviewDialog from '@/components/performance/PerformanceReviewDialog';

export default function Performance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Management</h1>
          <p className="text-muted-foreground">Track and evaluate employee performance</p>
        </div>
        <PerformanceReviewDialog />
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <TrendingUp className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">Performance Reviews</h3>
          <p className="text-center text-muted-foreground">
            Performance management features will be implemented here.<br />
            This will include KPIs, reviews, goals, and feedback tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
