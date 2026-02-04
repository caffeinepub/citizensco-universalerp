import { useState } from 'react';
import { useGetAllDepartments, useAddDepartment, useUpdateDepartment, useDeleteDepartment } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Department } from '../../types/erp-types';

export default function DepartmentManagement() {
  const { data: departments, isLoading } = useGetAllDepartments();
  const addDepartment = useAddDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const departmentData: Department = {
        id: formData.id || `dept-${Date.now()}`,
        name: formData.name,
        managerId: undefined,
        createdAt: BigInt(Date.now() * 1000000),
      };

      if (editingDepartment) {
        await updateDepartment.mutateAsync({ departmentId: editingDepartment.id, department: departmentData });
        toast.success('Department updated successfully');
      } else {
        await addDepartment.mutateAsync(departmentData);
        toast.success('Department added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save department');
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      id: department.id,
      name: department.name,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      await deleteDepartment.mutateAsync(departmentId);
      toast.success('Department deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete department');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
    });
    setEditingDepartment(null);
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
            <CardTitle>Department Management</CardTitle>
            <CardDescription>Manage organizational departments</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add New Department'}</DialogTitle>
                <DialogDescription>
                  {editingDepartment ? 'Update department information' : 'Enter department details'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Engineering, Sales, HR"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addDepartment.isPending || updateDepartment.isPending}>
                    {(addDepartment.isPending || updateDepartment.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingDepartment ? 'Update' : 'Add'} Department
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!departments || departments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No departments yet. Add your first department to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Department ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {department.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{department.id}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(department)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(department.id)}
                        disabled={deleteDepartment.isPending}
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
