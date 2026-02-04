import { useState } from 'react';
import { useGetAllOpportunities, useAddOpportunity, useUpdateOpportunity, useDeleteOpportunity } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Opportunity, LeadStage } from '../../types/erp-types';

export default function OpportunityManagement() {
  const { data: opportunities, isLoading } = useGetAllOpportunities();
  const addOpportunity = useAddOpportunity();
  const updateOpportunity = useUpdateOpportunity();
  const deleteOpportunity = useDeleteOpportunity();
  const { identity } = useInternetIdentity();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    stage: LeadStage.New,
    probability: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      value: '',
      stage: LeadStage.New,
      probability: '',
      notes: '',
    });
    setEditingOpportunity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) return;

    try {
      const opportunityData: Opportunity = {
        id: editingOpportunity?.id || `opportunity-${Date.now()}`,
        name: formData.name,
        description: formData.description || undefined,
        value: BigInt(Math.round(parseFloat(formData.value) * 100)),
        stage: formData.stage,
        probability: BigInt(parseInt(formData.probability)),
        expectedCloseDate: undefined,
        createdAt: editingOpportunity?.createdAt || BigInt(Date.now() * 1000000),
        ownerId: identity.getPrincipal().toString(),
        notes: formData.notes ? [formData.notes] : [],
      };

      if (editingOpportunity) {
        await updateOpportunity.mutateAsync({ opportunityId: editingOpportunity.id, opportunity: opportunityData });
        toast.success('Opportunity updated successfully');
      } else {
        await addOpportunity.mutateAsync(opportunityData);
        toast.success('Opportunity added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save opportunity');
    }
  };

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      name: opportunity.name,
      description: opportunity.description || '',
      value: (Number(opportunity.value) / 100).toString(),
      stage: opportunity.stage,
      probability: opportunity.probability.toString(),
      notes: opportunity.notes.join('\n'),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      await deleteOpportunity.mutateAsync(opportunityId);
      toast.success('Opportunity deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete opportunity');
    }
  };

  const getStageColor = (stage: LeadStage) => {
    switch (stage) {
      case LeadStage.New: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case LeadStage.Contacted: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case LeadStage.Qualified: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case LeadStage.Closed: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Opportunity Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Opportunity Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value ($) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability">Probability (%) *</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="50"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage *</Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value as LeadStage })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LeadStage.New}>New</SelectItem>
                    <SelectItem value={LeadStage.Contacted}>Contacted</SelectItem>
                    <SelectItem value={LeadStage.Qualified}>Qualified</SelectItem>
                    <SelectItem value={LeadStage.Closed}>Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this opportunity"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addOpportunity.isPending || updateOpportunity.isPending}>
                  {addOpportunity.isPending || updateOpportunity.isPending ? 'Saving...' : 'Save Opportunity'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {opportunities && opportunities.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Expected Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">{opportunity.name}</TableCell>
                  <TableCell>${(Number(opportunity.value) / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStageColor(opportunity.stage)}>
                      {opportunity.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>{Number(opportunity.probability)}%</TableCell>
                  <TableCell className="font-semibold text-primary">
                    ${((Number(opportunity.value) * Number(opportunity.probability)) / 10000).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(opportunity)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(opportunity.id)}
                        disabled={deleteOpportunity.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <img src="/assets/generated/opportunity-icon-transparent.dim_64x64.png" alt="No opportunities" className="h-16 w-auto mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No opportunities yet. Add your first opportunity to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
