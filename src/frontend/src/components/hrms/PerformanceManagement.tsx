import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function PerformanceManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Management</CardTitle>
        <CardDescription>Track and manage employee performance records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Performance tracking functionality coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
