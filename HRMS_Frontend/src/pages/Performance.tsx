import { useQuery } from '@tanstack/react-query';
import { performanceApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2, Star, Target, Award, Calendar } from 'lucide-react';
import PerformanceReviewDialog from '@/components/performance/PerformanceReviewDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Performance() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Fetch performance reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['my-reviews', page],
    queryFn: () => performanceApi.getMyReviewsPaginated(page, pageSize),
  });

  // Fetch average rating
  const { data: avgRating } = useQuery({
    queryKey: ['average-rating'],
    queryFn: async () => {
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      return performanceApi.getAverageRating(userInfo.id);
    },
  });

  const reviews = reviewsData?.content || [];
  const totalPages = reviewsData?.totalPages || 0;
  const averageRating = avgRating?.averageRating || 0;

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Average';
    return 'Needs Improvement';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'draft':
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Management</h1>
          <p className="text-muted-foreground">Track and evaluate employee performance</p>
        </div>
        <div className="flex gap-3">
          <Select 
            value={selectedYear.toString()} 
            onValueChange={(val) => setSelectedYear(Number(val))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <PerformanceReviewDialog />
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getRatingColor(averageRating)}`}>
              {averageRating.toFixed(1)}
            </div>
            <div className="mt-2 flex items-center gap-2">
              {renderStars(averageRating)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {getRatingBadge(averageRating)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground mt-2">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reviews.filter((r: any) => r.status?.toLowerCase() === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Out of {reviews.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Last Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {reviews.length > 0 && reviews[0].reviewDate
                ? format(new Date(reviews[0].reviewDate), 'MMM yyyy')
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Most recent</p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Breakdown */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Technical Skills</span>
                  <span className="text-sm text-muted-foreground">
                    {reviews[0]?.technicalSkillsRating?.toFixed(1) || 0}/5
                  </span>
                </div>
                <Progress value={(reviews[0]?.technicalSkillsRating || 0) * 20} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Communication</span>
                  <span className="text-sm text-muted-foreground">
                    {reviews[0]?.communicationRating?.toFixed(1) || 0}/5
                  </span>
                </div>
                <Progress value={(reviews[0]?.communicationRating || 0) * 20} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Teamwork</span>
                  <span className="text-sm text-muted-foreground">
                    {reviews[0]?.teamworkRating?.toFixed(1) || 0}/5
                  </span>
                </div>
                <Progress value={(reviews[0]?.teamworkRating || 0) * 20} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Leadership</span>
                  <span className="text-sm text-muted-foreground">
                    {reviews[0]?.leadershipRating?.toFixed(1) || 0}/5
                  </span>
                </div>
                <Progress value={(reviews[0]?.leadershipRating || 0) * 20} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No Performance Reviews</h3>
              <p className="text-center text-muted-foreground">
                No performance reviews found for the selected period.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Review Period</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Overall Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Review Date</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review: any) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">
                        {review.reviewPeriodStart && review.reviewPeriodEnd ? (
                          <>
                            {format(new Date(review.reviewPeriodStart), 'MMM dd')} -{' '}
                            {format(new Date(review.reviewPeriodEnd), 'MMM dd, yyyy')}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {review.reviewer?.firstName} {review.reviewer?.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getRatingColor(review.overallRating || 0)}`}>
                            {review.overallRating?.toFixed(1) || 0}
                          </span>
                          {renderStars(review.overallRating || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(review.status)}>
                          {review.status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {review.reviewDate 
                          ? format(new Date(review.reviewDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <button className="text-sm text-primary hover:underline">
                          View Details
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 text-sm border rounded hover:bg-accent disabled:opacity-50"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </button>
                    <button
                      className="px-3 py-1 text-sm border rounded hover:bg-accent disabled:opacity-50"
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Latest Review Details */}
      {reviews.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {reviews[0]?.strengths || 'No strengths recorded'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {reviews[0]?.areasForImprovement || 'No areas for improvement recorded'}
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Goals & Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {reviews[0]?.goals || 'No goals set'}
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Reviewer Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {reviews[0]?.reviewerComments || 'No comments provided'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
