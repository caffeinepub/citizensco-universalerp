import { useState } from 'react';
import { useIsCallerAdmin, useGetHRDashboard } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Building2, Calendar, FileText, DollarSign, TrendingUp } from 'lucide-react';
import EmployeeManagement from '../components/hrms/EmployeeManagement';
import DepartmentManagement from '../components/hrms/DepartmentManagement';
import AttendanceManagement from '../components/hrms/AttendanceManagement';
import LeaveManagement from '../components/hrms/LeaveManagement';
import PayrollManagement from '../components/hrms/PayrollManagement';
import PerformanceManagement from '../components/hrms/PerformanceManagement';
import WalletSummary from '../components/WalletSummary';

export default function HrmsDashboard() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: hrDashboard, isLoading: dashboardLoading } = useGetHRDashboard();
  const [activeTab, setActiveTab] = useState('overview');

  if (adminLoading || dashboardLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>
            You do not have permission to access the HRMS Dashboard. Admin access required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HRMS Dashboard</h1>
          <p className="text-muted-foreground">Manage employees, departments, attendance, and more</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrDashboard ? Number(hrDashboard.totalEmployees) : 0}</div>
                <p className="text-xs text-muted-foreground">
                  {hrDashboard ? Number(hrDashboard.activeEmployees) : 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrDashboard ? Number(hrDashboard.activeEmployees) : 0}</div>
                <p className="text-xs text-muted-foreground">Currently working</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrDashboard ? Number(hrDashboard.attendanceRate) : 0}%</div>
                <p className="text-xs text-muted-foreground">Overall attendance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hrDashboard ? hrDashboard.departmentDistribution.length : 0}
                </div>
                <p className="text-xs text-muted-foreground">Active departments</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Employees per department</CardDescription>
              </CardHeader>
              <CardContent>
                {hrDashboard && hrDashboard.departmentDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {hrDashboard.departmentDistribution.map(([deptId, count]) => (
                      <div key={deptId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{deptId}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{Number(count)} employees</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No departments yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Summary</CardTitle>
                <CardDescription>Leave requests by department</CardDescription>
              </CardHeader>
              <CardContent>
                {hrDashboard && hrDashboard.leaveSummary.length > 0 ? (
                  <div className="space-y-4">
                    {hrDashboard.leaveSummary.map(([deptId, count]) => (
                      <div key={deptId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{deptId}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{Number(count)} requests</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No leave requests yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeManagement />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentManagement />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceManagement />
        </TabsContent>

        <TabsContent value="leaves">
          <LeaveManagement />
        </TabsContent>

        <TabsContent value="payroll">
          <PayrollManagement />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceManagement />
        </TabsContent>

        <TabsContent value="wallets">
          <WalletSummary isLoading={false} showTransactions={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
