import { useState } from 'react';
import { useGetAllLeads, useGetAllContacts, useAddLead, useUpdateLead, useDeleteLead } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Lead, LeadStage } from '../../types/erp-types';

export default function LeadManagement() {
  const { data: leads, isLoading } = useGetAllLeads();
  const { data: contacts } = useGetAllContacts();
  const addLead = useAddLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const { identity } = useInternetIdentity();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    contactId: '',
    stage: LeadStage.New,
    source: '',
    expectedRevenue: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      contactId: '',
      stage: LeadStage.New,
      source: '',
      expectedRevenue: '',
      notes: '',
    });
    setEditingLead(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) return;

    try {
      const leadData: Lead = {
        id: editingLead?.id || `lead-${Date.now()}`,
        contactId: formData.contactId,
        opportunityId: editingLead?.opportunityId,
        stage: formData.stage,
        source: formData.source || undefined,
        expectedRevenue: formData.expectedRevenue ? BigInt(Math.round(parseFloat(formData.expectedRevenue) * 100)) : undefined,
        createdAt: editingLead?.createdAt || BigInt(Date.now() * 1000000),
        ownerId: identity.getPrincipal().toString(),
        notes: formData.notes ? [formData.notes] : [],
      };

      if (editingLead) {
        await updateLead.mutateAsync({ leadId: editingLead.id, lead: leadData });
        toast.success('Lead updated successfully');
      } else {
        await addLead.mutateAsync(leadData);
        toast.success('Lead added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save lead');
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      contactId: lead.contactId,
      stage: lead.stage,
      source: lead.source || '',
      expectedRevenue: lead.expectedRevenue ? (Number(lead.expectedRevenue) / 100).toString() : '',
      notes: lead.notes.join('\n'),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await deleteLead.mutateAsync(leadId);
      toast.success('Lead deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete lead');
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

  const getContactName = (contactId: string) => {
    const contact = contacts?.find(c => c.id === contactId);
    return contact?.name || 'Unknown';
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
        <CardTitle>Lead Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactId">Contact *</Label>
                <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts?.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} ({contact.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    placeholder="e.g., Website, Referral"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedRevenue">Expected Revenue ($)</Label>
                <Input
                  id="expectedRevenue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.expectedRevenue}
                  onChange={(e) => setFormData({ ...formData, expectedRevenue: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Add notes about this lead"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addLead.isPending || updateLead.isPending}>
                  {addLead.isPending || updateLead.isPending ? 'Saving...' : 'Save Lead'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {leads && leads.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Expected Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{getContactName(lead.contactId)}</TableCell>
                  <TableCell>
                    <Badge className={getStageColor(lead.stage)}>
                      {lead.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.source || '-'}</TableCell>
                  <TableCell>
                    {lead.expectedRevenue ? `$${(Number(lead.expectedRevenue) / 100).toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(lead)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead.id)}
                        disabled={deleteLead.isPending}
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
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No leads yet. Add your first lead to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
