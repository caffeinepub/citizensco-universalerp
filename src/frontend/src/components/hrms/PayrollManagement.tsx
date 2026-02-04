import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function PayrollManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Management</CardTitle>
        <CardDescription>Process payroll and manage employee compensation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Payroll processing functionality coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
