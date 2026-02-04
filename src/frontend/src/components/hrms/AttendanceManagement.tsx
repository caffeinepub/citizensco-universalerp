import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function AttendanceManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Management</CardTitle>
        <CardDescription>Track employee attendance and clock in/out records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Attendance tracking functionality coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
