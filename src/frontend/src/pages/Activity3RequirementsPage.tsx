import { useState } from 'react';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Activity3Spec {
  goal: string;
  scope: string;
  backendChanges: string;
  frontendChanges: string;
  acceptanceCriteria: string;
}

const defaultSpec: Activity3Spec = {
  goal: '',
  scope: '',
  backendChanges: '',
  frontendChanges: '',
  acceptanceCriteria: '',
};

export default function Activity3RequirementsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const [spec, setSpec] = useLocalStorageState<Activity3Spec>('activity3-spec-draft', defaultSpec);
  const [copied, setCopied] = useState(false);

  const updateField = (field: keyof Activity3Spec, value: string) => {
    setSpec({ ...spec, [field]: value });
  };

  const generateBuildInstruction = (): string => {
    const parts: string[] = [];
    
    parts.push('Please implement Activity 3 Option 1 with the following requirements:');
    parts.push('');
    
    if (spec.goal.trim()) {
      parts.push(`**Goal:**`);
      parts.push(spec.goal.trim());
      parts.push('');
    }
    
    if (spec.scope.trim()) {
      parts.push(`**Scope (affected modules/pages):**`);
      parts.push(spec.scope.trim());
      parts.push('');
    }
    
    if (spec.backendChanges.trim()) {
      parts.push(`**Backend/Data Model Changes:**`);
      parts.push(spec.backendChanges.trim());
      parts.push('');
    }
    
    if (spec.frontendChanges.trim()) {
      parts.push(`**Frontend/UI Changes:**`);
      parts.push(spec.frontendChanges.trim());
      parts.push('');
    }
    
    if (spec.acceptanceCriteria.trim()) {
      parts.push(`**Acceptance Criteria:**`);
      parts.push(spec.acceptanceCriteria.trim());
      parts.push('');
    }
    
    if (parts.length <= 2) {
      return 'Please fill in at least one field to generate a build-ready instruction.';
    }
    
    return parts.join('\n');
  };

  const handleCopyInstruction = async () => {
    const instruction = generateBuildInstruction();
    
    if (instruction.includes('fill in at least one field')) {
      toast.error('Please fill in at least one field before copying');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(instruction);
      setCopied(true);
      toast.success('Build-ready instruction copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleClearDraft = () => {
    if (confirm('Are you sure you want to clear all fields? This cannot be undone.')) {
      setSpec(defaultSpec);
      toast.success('Draft cleared');
    }
  };

  if (adminLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only administrators can access the Activity 3 requirements capture page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Activity 3 Option 1 Requirements</h1>
        <p className="text-muted-foreground">
          Capture detailed requirements for Activity 3 Option 1. Your draft is automatically saved locally.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Goal</CardTitle>
            <CardDescription>
              What is the primary objective of Activity 3 Option 1? What problem does it solve?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={spec.goal}
              onChange={(e) => updateField('goal', e.target.value)}
              placeholder="Example: Enable users to track project milestones and automatically notify stakeholders when deadlines approach..."
              rows={4}
              className="resize-y"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scope / Affected Modules & Pages</CardTitle>
            <CardDescription>
              Which parts of the application will be affected? List modules, pages, or components.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={spec.scope}
              onChange={(e) => updateField('scope', e.target.value)}
              placeholder="Example: Admin Dashboard, CRM module, new /projects page, Header navigation..."
              rows={4}
              className="resize-y"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backend / Data Model Changes</CardTitle>
            <CardDescription>
              What backend APIs, data structures, or business logic need to be added or modified?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={spec.backendChanges}
              onChange={(e) => updateField('backendChanges', e.target.value)}
              placeholder="Example: Add Project type with fields (id, name, deadline, status), createProject() method, getProjectsByOrganization() query..."
              rows={5}
              className="resize-y"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frontend / UI Changes</CardTitle>
            <CardDescription>
              What UI components, pages, or user interactions need to be implemented?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={spec.frontendChanges}
              onChange={(e) => updateField('frontendChanges', e.target.value)}
              placeholder="Example: New ProjectsPage with table view, ProjectForm dialog for create/edit, add 'Projects' button to Header for admins, status badges..."
              rows={5}
              className="resize-y"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acceptance Criteria</CardTitle>
            <CardDescription>
              How will you know when Activity 3 Option 1 is complete? List specific, testable criteria.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={spec.acceptanceCriteria}
              onChange={(e) => updateField('acceptanceCriteria', e.target.value)}
              placeholder="Example: 1. Admin can create a new project with name and deadline. 2. Projects are listed in a table with status. 3. Non-admin users cannot access project management..."
              rows={5}
              className="resize-y"
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={handleCopyInstruction}
            size="lg"
            className="flex-1"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Build-Ready Instruction
              </>
            )}
          </Button>
          <Button
            onClick={handleClearDraft}
            variant="outline"
            size="lg"
          >
            Clear Draft
          </Button>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Tip:</strong> Fill in as much detail as possible. The more specific your requirements, 
            the better the AI can implement Activity 3 Option 1. Your draft is saved automatically in your browser.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
