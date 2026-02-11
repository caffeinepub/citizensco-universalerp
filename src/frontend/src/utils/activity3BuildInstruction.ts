/**
 * Utility to generate build-ready Markdown instruction from Activity 3 draft
 */

export interface Activity3Spec {
  goal: string;
  scope: string;
  backendChanges: string;
  frontendChanges: string;
  acceptanceCriteria: string;
  // New structured fields
  rolesImpacted: {
    admin: boolean;
    orgAdmin: boolean;
    orgManager: boolean;
    orgEmployee: boolean;
    regularUser: boolean;
    guest: boolean;
    notes: string;
  };
  uiImpacted: {
    newPage: boolean;
    newPageDetails: string;
    existingPage: boolean;
    existingPageDetails: string;
    headerNav: boolean;
    dashboard: boolean;
    other: boolean;
    otherDetails: string;
    uiDescription: string;
  };
  backendApis: {
    newDataTypes: string;
    newMethods: string;
    updatedMethods: string;
    authorizationRules: string;
  };
}

/**
 * Check if all fields in the spec are empty
 */
export function isSpecEmpty(spec: Activity3Spec): boolean {
  // Check basic fields
  if (spec.goal.trim()) return false;
  if (spec.scope.trim()) return false;
  if (spec.backendChanges.trim()) return false;
  if (spec.frontendChanges.trim()) return false;
  if (spec.acceptanceCriteria.trim()) return false;

  // Check roles
  const roles = spec.rolesImpacted;
  if (roles.admin || roles.orgAdmin || roles.orgManager || roles.orgEmployee || roles.regularUser || roles.guest) {
    return false;
  }
  if (roles.notes.trim()) return false;

  // Check UI
  const ui = spec.uiImpacted;
  if (ui.newPage || ui.existingPage || ui.headerNav || ui.dashboard || ui.other) {
    return false;
  }
  if (ui.newPageDetails.trim() || ui.existingPageDetails.trim() || ui.otherDetails.trim() || ui.uiDescription.trim()) {
    return false;
  }

  // Check backend APIs
  const apis = spec.backendApis;
  if (apis.newDataTypes.trim() || apis.newMethods.trim() || apis.updatedMethods.trim() || apis.authorizationRules.trim()) {
    return false;
  }

  return true;
}

/**
 * Generate build-ready Markdown instruction from Activity 3 spec
 */
export function generateBuildInstruction(spec: Activity3Spec): string {
  const parts: string[] = [];

  parts.push('Please implement Activity 3 Option 1 with the following requirements:');
  parts.push('');

  // Goal
  if (spec.goal.trim()) {
    parts.push('## Goal');
    parts.push('');
    parts.push(spec.goal.trim());
    parts.push('');
  }

  // User Roles Impacted
  const roles = spec.rolesImpacted;
  const hasRoles = roles.admin || roles.orgAdmin || roles.orgManager || roles.orgEmployee || roles.regularUser || roles.guest;
  if (hasRoles || roles.notes.trim()) {
    parts.push('## User Roles Impacted');
    parts.push('');
    if (hasRoles) {
      if (roles.admin) parts.push('- [x] Admin');
      if (roles.orgAdmin) parts.push('- [x] Organization Admin');
      if (roles.orgManager) parts.push('- [x] Organization Manager');
      if (roles.orgEmployee) parts.push('- [x] Organization Employee');
      if (roles.regularUser) parts.push('- [x] Regular User');
      if (roles.guest) parts.push('- [x] Guest');
      parts.push('');
    }
    if (roles.notes.trim()) {
      parts.push(roles.notes.trim());
      parts.push('');
    }
  }

  // UI / Pages Impacted
  const ui = spec.uiImpacted;
  const hasUi = ui.newPage || ui.existingPage || ui.headerNav || ui.dashboard || ui.other;
  const hasUiDetails = ui.newPageDetails.trim() || ui.existingPageDetails.trim() || ui.otherDetails.trim() || ui.uiDescription.trim();
  if (hasUi || hasUiDetails) {
    parts.push('## UI / Pages Impacted');
    parts.push('');
    if (hasUi) {
      if (ui.newPage) {
        if (ui.newPageDetails.trim()) {
          parts.push(`- [x] New page: ${ui.newPageDetails.trim()}`);
        } else {
          parts.push('- [x] New page');
        }
      }
      if (ui.existingPage) {
        if (ui.existingPageDetails.trim()) {
          parts.push(`- [x] Existing page: ${ui.existingPageDetails.trim()}`);
        } else {
          parts.push('- [x] Existing page');
        }
      }
      if (ui.headerNav) parts.push('- [x] Header navigation');
      if (ui.dashboard) parts.push('- [x] Dashboard');
      if (ui.other) {
        if (ui.otherDetails.trim()) {
          parts.push(`- [x] Other: ${ui.otherDetails.trim()}`);
        } else {
          parts.push('- [x] Other');
        }
      }
      parts.push('');
    }
    if (ui.uiDescription.trim()) {
      parts.push(ui.uiDescription.trim());
      parts.push('');
    }
  }

  // Backend APIs / Data Needed
  const apis = spec.backendApis;
  const hasApis = apis.newDataTypes.trim() || apis.newMethods.trim() || apis.updatedMethods.trim() || apis.authorizationRules.trim();
  if (hasApis) {
    parts.push('## Backend APIs / Data Needed');
    parts.push('');
    
    if (apis.newDataTypes.trim()) {
      parts.push('### New Data Types');
      parts.push('');
      parts.push(apis.newDataTypes.trim());
      parts.push('');
    }
    
    if (apis.newMethods.trim()) {
      parts.push('### New Methods');
      parts.push('');
      parts.push(apis.newMethods.trim());
      parts.push('');
    }
    
    if (apis.updatedMethods.trim()) {
      parts.push('### Updated Methods');
      parts.push('');
      parts.push(apis.updatedMethods.trim());
      parts.push('');
    }
    
    if (apis.authorizationRules.trim()) {
      parts.push('### Authorization Rules');
      parts.push('');
      parts.push(apis.authorizationRules.trim());
      parts.push('');
    }
  }

  // Scope (legacy field)
  if (spec.scope.trim()) {
    parts.push('## Scope / Affected Modules & Pages');
    parts.push('');
    parts.push(spec.scope.trim());
    parts.push('');
  }

  // Backend Changes (legacy field)
  if (spec.backendChanges.trim()) {
    parts.push('## Backend / Data Model Changes');
    parts.push('');
    parts.push(spec.backendChanges.trim());
    parts.push('');
  }

  // Frontend Changes (legacy field)
  if (spec.frontendChanges.trim()) {
    parts.push('## Frontend / UI Changes');
    parts.push('');
    parts.push(spec.frontendChanges.trim());
    parts.push('');
  }

  // Acceptance Criteria
  if (spec.acceptanceCriteria.trim()) {
    parts.push('## Acceptance Criteria');
    parts.push('');
    parts.push(spec.acceptanceCriteria.trim());
    parts.push('');
  }

  return parts.join('\n');
}
