import { useState } from 'react';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Activity3Spec, generateBuildInstruction, isSpecEmpty } from '../utils/activity3BuildInstruction';

const defaultSpec: Activity3Spec = {
  goal: '',
  scope: '',
  backendChanges: '',
  frontendChanges: '',
  acceptanceCriteria: '',
  rolesImpacted: {
    admin: false,
    orgAdmin: false,
    orgManager: false,
    orgEmployee: false,
    regularUser: false,
    guest: false,
    notes: '',
  },
  uiImpacted: {
    newPage: false,
    newPageDetails: '',
    existingPage: false,
    existingPageDetails: '',
    headerNav: false,
    dashboard: false,
    other: false,
    otherDetails: '',
    uiDescription: '',
  },
  backendApis: {
    newDataTypes: '',
    newMethods: '',
    updatedMethods: '',
    authorizationRules: '',
  },
};

export default function Activity3RequirementsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const [spec, setSpec] = useLocalStorageState<Activity3Spec>('activity3-spec-draft', defaultSpec);
  const [copied, setCopied] = useState(false);

  const updateField = (field: keyof Activity3Spec, value: string) => {
    setSpec({ ...spec, [field]: value });
  };

  const updateRoleField = (field: keyof Activity3Spec['rolesImpacted'], value: boolean | string) => {
    setSpec({
      ...spec,
      rolesImpacted: { ...spec.rolesImpacted, [field]: value },
    });
  };

  const updateUiField = (field: keyof Activity3Spec['uiImpacted'], value: boolean | string) => {
    setSpec({
      ...spec,
      uiImpacted: { ...spec.uiImpacted, [field]: value },
    });
  };

  const updateApiField = (field: keyof Activity3Spec['backendApis'], value: string) => {
    setSpec({
      ...spec,
      backendApis: { ...spec.backendApis, [field]: value },
    });
  };

  const handleCopyInstruction = async () => {
    if (isSpecEmpty(spec)) {
      toast.error('Please fill in at least one field before copying');
      return;
    }

    const instruction = generateBuildInstruction(spec);

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
            <CardTitle>User Roles Impacted</CardTitle>
            <CardDescription>
              Which user roles will interact with this feature? Select all that apply.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-admin"
                  checked={spec.rolesImpacted.admin}
                  onCheckedChange={(checked) => updateRoleField('admin', checked as boolean)}
                />
                <Label htmlFor="role-admin" className="cursor-pointer">
                  Admin
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-org-admin"
                  checked={spec.rolesImpacted.orgAdmin}
                  onCheckedChange={(checked) => updateRoleField('orgAdmin', checked as boolean)}
                />
                <Label htmlFor="role-org-admin" className="cursor-pointer">
                  Organization Admin
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-org-manager"
                  checked={spec.rolesImpacted.orgManager}
                  onCheckedChange={(checked) => updateRoleField('orgManager', checked as boolean)}
                />
                <Label htmlFor="role-org-manager" className="cursor-pointer">
                  Organization Manager
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-org-employee"
                  checked={spec.rolesImpacted.orgEmployee}
                  onCheckedChange={(checked) => updateRoleField('orgEmployee', checked as boolean)}
                />
                <Label htmlFor="role-org-employee" className="cursor-pointer">
                  Organization Employee
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-regular-user"
                  checked={spec.rolesImpacted.regularUser}
                  onCheckedChange={(checked) => updateRoleField('regularUser', checked as boolean)}
                />
                <Label htmlFor="role-regular-user" className="cursor-pointer">
                  Regular User
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-guest"
                  checked={spec.rolesImpacted.guest}
                  onCheckedChange={(checked) => updateRoleField('guest', checked as boolean)}
                />
                <Label htmlFor="role-guest" className="cursor-pointer">
                  Guest
                </Label>
              </div>
            </div>
            <div>
              <Label htmlFor="role-notes">Role-specific behavior notes (optional)</Label>
              <Textarea
                id="role-notes"
                value={spec.rolesImpacted.notes}
                onChange={(e) => updateRoleField('notes', e.target.value)}
                placeholder="Example: Organization Admins can create and edit projects, while Organization Employees can only view projects assigned to them..."
                rows={3}
                className="resize-y mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>UI / Pages Impacted</CardTitle>
            <CardDescription>
              Which pages or UI components will be affected? Select all that apply.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ui-new-page"
                    checked={spec.uiImpacted.newPage}
                    onCheckedChange={(checked) => updateUiField('newPage', checked as boolean)}
                  />
                  <Label htmlFor="ui-new-page" className="cursor-pointer">
                    New page
                  </Label>
                </div>
                {spec.uiImpacted.newPage && (
                  <Input
                    value={spec.uiImpacted.newPageDetails}
                    onChange={(e) => updateUiField('newPageDetails', e.target.value)}
                    placeholder="Page name and route (e.g., Projects page at /projects)"
                    className="ml-6"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ui-existing-page"
                    checked={spec.uiImpacted.existingPage}
                    onCheckedChange={(checked) => updateUiField('existingPage', checked as boolean)}
                  />
                  <Label htmlFor="ui-existing-page" className="cursor-pointer">
                    Existing page
                  </Label>
                </div>
                {spec.uiImpacted.existingPage && (
                  <Input
                    value={spec.uiImpacted.existingPageDetails}
                    onChange={(e) => updateUiField('existingPageDetails', e.target.value)}
                    placeholder="Page name (e.g., Admin Dashboard, CRM Dashboard)"
                    className="ml-6"
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ui-header-nav"
                  checked={spec.uiImpacted.headerNav}
                  onCheckedChange={(checked) => updateUiField('headerNav', checked as boolean)}
                />
                <Label htmlFor="ui-header-nav" className="cursor-pointer">
                  Header navigation
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ui-dashboard"
                  checked={spec.uiImpacted.dashboard}
                  onCheckedChange={(checked) => updateUiField('dashboard', checked as boolean)}
                />
                <Label htmlFor="ui-dashboard" className="cursor-pointer">
                  Dashboard
                </Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ui-other"
                    checked={spec.uiImpacted.other}
                    onCheckedChange={(checked) => updateUiField('other', checked as boolean)}
                  />
                  <Label htmlFor="ui-other" className="cursor-pointer">
                    Other
                  </Label>
                </div>
                {spec.uiImpacted.other && (
                  <Input
                    value={spec.uiImpacted.otherDetails}
                    onChange={(e) => updateUiField('otherDetails', e.target.value)}
                    placeholder="Specify other UI components"
                    className="ml-6"
                  />
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="ui-description">Detailed UI changes description (optional)</Label>
              <Textarea
                id="ui-description"
                value={spec.uiImpacted.uiDescription}
                onChange={(e) => updateUiField('uiDescription', e.target.value)}
                placeholder="Example: Add a Projects button to the header for admins. The Projects page should display a table with columns for project name, deadline, status, and actions. Include a 'New Project' button that opens a dialog form..."
                rows={4}
                className="resize-y mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backend APIs / Data Needed</CardTitle>
            <CardDescription>
              What backend methods and data structures are required?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-new-types">New Data Types</Label>
              <Textarea
                id="api-new-types"
                value={spec.backendApis.newDataTypes}
                onChange={(e) => updateApiField('newDataTypes', e.target.value)}
                placeholder="Example: Project type with fields: id (Text), name (Text), description (?Text), deadline (Time), status (ProjectStatus enum), organizationId (Text), createdBy (Principal), createdAt (Time)"
                rows={4}
                className="resize-y mt-2"
              />
            </div>

            <div>
              <Label htmlFor="api-new-methods">New Methods</Label>
              <Textarea
                id="api-new-methods"
                value={spec.backendApis.newMethods}
                onChange={(e) => updateApiField('newMethods', e.target.value)}
                placeholder="Example: createProject(name: Text, description: ?Text, deadline: Time, orgId: Text): async Project; getProjectsByOrganization(orgId: Text): async [Project]; updateProjectStatus(projectId: Text, status: ProjectStatus): async ()"
                rows={4}
                className="resize-y mt-2"
              />
            </div>

            <div>
              <Label htmlFor="api-updated-methods">Updated Methods (optional)</Label>
              <Textarea
                id="api-updated-methods"
                value={spec.backendApis.updatedMethods}
                onChange={(e) => updateApiField('updatedMethods', e.target.value)}
                placeholder="Example: Modify getOrganization() to include projectCount field"
                rows={3}
                className="resize-y mt-2"
              />
            </div>

            <div>
              <Label htmlFor="api-auth-rules">Authorization Rules</Label>
              <Textarea
                id="api-auth-rules"
                value={spec.backendApis.authorizationRules}
                onChange={(e) => updateApiField('authorizationRules', e.target.value)}
                placeholder="Example: Only organization admins can create/edit/delete projects. Organization members can view projects for their organization. Global admins can access all projects."
                rows={4}
                className="resize-y mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scope / Affected Modules & Pages (Legacy)</CardTitle>
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
            <CardTitle>Backend / Data Model Changes (Legacy)</CardTitle>
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
            <CardTitle>Frontend / UI Changes (Legacy)</CardTitle>
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
          <Button onClick={handleCopyInstruction} size="lg" className="flex-1">
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
          <Button onClick={handleClearDraft} variant="outline" size="lg">
            Clear Draft
          </Button>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Tip:</strong> Fill in as much detail as possible. The more specific your requirements, the better
            the AI can implement Activity 3 Option 1. Your draft is saved automatically in your browser.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
