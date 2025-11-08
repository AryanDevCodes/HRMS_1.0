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

const performanceReviewSchema = z.object({
  employeeName: z.string().min(1, 'Please select an employee'),
  reviewPeriod: z.string().min(1, 'Please select a review period'),
  overallRating: z.number().min(1).max(5),
  technicalSkills: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  teamwork: z.number().min(1).max(5),
  productivity: z.number().min(1).max(5),
  strengths: z.string().min(20, 'Strengths must be at least 20 characters'),
  areasForImprovement: z.string().min(20, 'Areas for improvement must be at least 20 characters'),
  goals: z.string().min(20, 'Goals must be at least 20 characters'),
  comments: z.string().optional(),
});

type PerformanceReviewFormValues = z.infer<typeof performanceReviewSchema>;

export default function PerformanceReviewDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PerformanceReviewFormValues>({
    resolver: zodResolver(performanceReviewSchema),
    defaultValues: {
      employeeName: '',
      reviewPeriod: '',
      overallRating: 3,
      technicalSkills: 3,
      communication: 3,
      teamwork: 3,
      productivity: 3,
      strengths: '',
      areasForImprovement: '',
      goals: '',
      comments: '',
    },
  });

  const onSubmit = (data: PerformanceReviewFormValues) => {
    console.log('Performance review:', data);
    toast({
      title: 'Review submitted',
      description: `Performance review for ${data.employeeName} has been saved successfully.`,
    });
    setOpen(false);
    form.reset();
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
                step={1}
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
                name="employeeName"
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
                        <SelectItem value="John Smith">John Smith</SelectItem>
                        <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                        <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                        <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reviewPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Period</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                        <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                        <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                        <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                        <SelectItem value="Annual 2024">Annual 2024</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Performance Ratings</h3>
              <RatingField 
                name="overallRating" 
                label="Overall Performance" 
                description="General assessment of employee's performance"
              />
              <RatingField name="technicalSkills" label="Technical Skills" />
              <RatingField name="communication" label="Communication" />
              <RatingField name="teamwork" label="Teamwork & Collaboration" />
              <RatingField name="productivity" label="Productivity & Efficiency" />
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
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments (Optional)</FormLabel>
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
              <Button type="submit">Submit Review</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
