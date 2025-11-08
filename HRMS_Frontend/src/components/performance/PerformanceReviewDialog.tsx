import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi, performanceApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const performanceReviewSchema = z.object({
  employeeId: z.string().min(1, 'Please select an employee'),
  reviewPeriodStart: z.string().min(1, 'Please enter start date'),
  reviewPeriodEnd: z.string().min(1, 'Please enter end date'),
  overallRating: z.number().min(1).max(5),
  technicalSkillsRating: z.number().min(1).max(5),
  communicationRating: z.number().min(1).max(5),
  teamworkRating: z.number().min(1).max(5),
  leadershipRating: z.number().min(1).max(5),
  strengths: z.string().min(20, 'Strengths must be at least 20 characters'),
  areasForImprovement: z.string().min(20, 'Areas for improvement must be at least 20 characters'),
  goals: z.string().min(20, 'Goals must be at least 20 characters'),
  reviewerComments: z.string().optional(),
});

type PerformanceReviewFormValues = z.infer<typeof performanceReviewSchema>;

export default function PerformanceReviewDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Debug: Log current user info
  console.log('Current User:', user);
  console.log('Current User Role:', user?.role);

    // Fetch all employees (always fetch, not just when dialog is open)
  const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useQuery({
    queryKey: ['employees-for-review'],
    queryFn: () => employeeApi.getAll({ page: 0, size: 100 }),
  });

  // Filter out ADMIN users - only show HR_MANAGER and EMPLOYEE roles
  const employees = (employeesData?.content || []).filter((emp: any) => 
    emp.role === 'HR_MANAGER' || emp.role === 'EMPLOYEE'
  );

  // Debug logging
  console.log('Employees Data:', employeesData);
  console.log('Filtered Employees:', employees);
  console.log('Loading:', employeesLoading);
  console.log('Error:', employeesError);
  if (employeesError) {
    console.log('Error Details:', JSON.stringify(employeesError, null, 2));
  }

  console.log('Employees Data:', employeesData);
  console.log('Filtered Employees:', employees);

  const form = useForm<PerformanceReviewFormValues>({
    resolver: zodResolver(performanceReviewSchema),
    defaultValues: {
      employeeId: '',
      reviewPeriodStart: '',
      reviewPeriodEnd: '',
      overallRating: 3,
      technicalSkillsRating: 3,
      communicationRating: 3,
      teamworkRating: 3,
      leadershipRating: 3,
      strengths: '',
      areasForImprovement: '',
      goals: '',
      reviewerComments: '',
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: performanceApi.create,
    onSuccess: () => {
      toast({
        title: 'Review submitted',
        description: 'Performance review has been created successfully.',
      });
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create performance review',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: PerformanceReviewFormValues) => {
    createReviewMutation.mutate({
      employeeId: Number(data.employeeId),
      reviewPeriodStart: data.reviewPeriodStart,
      reviewPeriodEnd: data.reviewPeriodEnd,
      overallRating: data.overallRating,
      technicalSkillsRating: data.technicalSkillsRating,
      communicationRating: data.communicationRating,
      teamworkRating: data.teamworkRating,
      leadershipRating: data.leadershipRating,
      strengths: data.strengths,
      areasForImprovement: data.areasForImprovement,
      goals: data.goals,
      reviewerComments: data.reviewerComments,
      status: 'COMPLETED',
    });
  };

  const RatingField = ({ 
    name, 
    label, 
    description 
  }: { 
    name: keyof PerformanceReviewFormValues; 
    label: string; 
    description?: string;
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <div className="flex items-center gap-4">
              <Slider
                min={1}
                max={5}
                step={0.5}
                value={[field.value as number]}
                onValueChange={(vals) => field.onChange(vals[0])}
                className="flex-1"
              />
              <span className="w-12 text-center font-medium">{field.value}/5</span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Performance Review</DialogTitle>
          <DialogDescription>Evaluate employee performance and set goals</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.employeeCode} - {emp.firstName} {emp.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reviewPeriodStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Period Start</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reviewPeriodEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Period End</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Performance Ratings</h3>
              <RatingField 
                name="overallRating" 
                label="Overall Performance" 
                description="General assessment of employee's performance"
              />
              <RatingField name="technicalSkillsRating" label="Technical Skills" />
              <RatingField name="communicationRating" label="Communication" />
              <RatingField name="teamworkRating" label="Teamwork & Collaboration" />
              <RatingField name="leadershipRating" label="Leadership & Initiative" />
            </div>

            <FormField
              control={form.control}
              name="strengths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Strengths</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the employee's key strengths and accomplishments..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areasForImprovement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Areas for Improvement</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Identify areas where the employee can improve..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goals for Next Period</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Set specific goals and objectives for the next review period..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reviewerComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reviewer Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional feedback or comments..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createReviewMutation.isPending}>
                {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
