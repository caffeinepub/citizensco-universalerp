import { useState } from 'react';
import { useGetHRDashboard, useGetAllDepartments, useAddEmployee, useUpdateEmployee, useDeleteEmployee } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmployeeStatus } from '../../types/erp-types';
import type { Employee } from '../../types/erp-types';

export default function EmployeeManagement() {
  const { data: hrDashboard, isLoading } = useGetHRDashboard();
  const { data: departments } = useGetAllDepartments();
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    role: '',
    departmentId: '',
    salary: '',
    status: EmployeeStatus.Active,
  });

  const employees = hrDashboard?.departmentDistribution.flatMap(([deptId]) => 
    // This is a simplified view - in reality we'd need a separate query for all employees
    []
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const employeeData: Employee = {
        id: formData.id || `emp-${Date.now()}`,
        name: formData.name,
        role: formData.role,
        departmentId: formData.departmentId,
        joiningDate: BigInt(Date.now() * 1000000),
        salary: BigInt(formData.salary),
        status: formData.status,
        userId: undefined,
      };

      if (editingEmployee) {
        await updateEmployee.mutateAsync({ employeeId: editingEmployee.id, employee: employeeData });
        toast.success('Employee updated successfully');
      } else {
        await addEmployee.mutateAsync(employeeData);
        toast.success('Employee added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save employee');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      id: employee.id,
      name: employee.name,
      role: employee.role,
      departmentId: employee.departmentId,
      salary: employee.salary.toString(),
      status: employee.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await deleteEmployee.mutateAsync(employeeId);
      toast.success('Employee deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete employee');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      role: '',
      departmentId: '',
      salary: '',
      status: EmployeeStatus.Active,
    });
    setEditingEmployee(null);
  };

  const getStatusBadge = (status: EmployeeStatus) => {
    let statusLabel = 'Active';
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';

    if (status === EmployeeStatus.Active) {
      statusLabel = 'Active';
      variant = 'default';
    } else if (status === EmployeeStatus.Inactive) {
      statusLabel = 'Inactive';
      variant = 'secondary';
    } else if (status === EmployeeStatus.Terminated) {
      statusLabel = 'Terminated';
      variant = 'destructive';
    } else if (status === EmployeeStatus.OnLeave) {
      statusLabel = 'On Leave';
      variant = 'outline';
    }

    return <Badge variant={variant}>{statusLabel}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>Manage employee records and information</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                <DialogDescription>
                  {editingEmployee ? 'Update employee information' : 'Enter employee details'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as EmployeeStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EmployeeStatus.Active}>Active</SelectItem>
                      <SelectItem value={EmployeeStatus.Inactive}>Inactive</SelectItem>
                      <SelectItem value={EmployeeStatus.OnLeave}>On Leave</SelectItem>
                      <SelectItem value={EmployeeStatus.Terminated}>Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addEmployee.isPending || updateEmployee.isPending}>
                    {(addEmployee.isPending || updateEmployee.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingEmployee ? 'Update' : 'Add'} Employee
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No employees yet. Add your first employee to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee: Employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.departmentId}</TableCell>
                  <TableCell>${Number(employee.salary).toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(employee)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
                        disabled={deleteEmployee.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
