// Placeholder types for ERP functionality until backend is fully implemented
// These types mirror the backend types defined in main.mo but not yet exposed in the interface

import type { Principal } from '@icp-sdk/core/principal';

export type ProductId = string;
export type CategoryId = string;
export type SKU = string;
export type OrderId = string;
export type ContactId = string;
export type LeadId = string;
export type OpportunityId = string;
export type TaskId = string;
export type EmployeeId = string;
export type DepartmentId = string;
export type AttendanceId = string;
export type LeaveId = string;
export type PayrollId = string;
export type PerformanceId = string;

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  price: bigint;
  categoryId: CategoryId;
  image?: any; // ExternalBlob type
  stock: bigint;
  sku: SKU;
  digital: boolean;
  variants?: string[];
}

export interface Category {
  id: CategoryId;
  name: string;
  parentId?: CategoryId;
}

export interface OrderItem {
  productId: ProductId;
  quantity: bigint;
  price: bigint;
  sku: SKU;
}

export interface Order {
  id: OrderId;
  userId: string;
  items: OrderItem[];
  total: bigint;
  status: string;
  paymentMethod: string;
  createdAt: bigint;
}

export interface AnalyticsData {
  totalOrders: bigint;
  totalRevenue: bigint;
  activeUsers: bigint;
  ordersByStatus: [string, bigint][];
}

export interface Contact {
  id: ContactId;
  name: string;
  email: string;
  phone?: string;
  relationshipType: string;
  company?: string;
  address?: string;
  createdAt: bigint;
  ownerId: string;
}

export enum LeadStage {
  New = 'new',
  Contacted = 'contacted',
  Qualified = 'qualified',
  Closed = 'closed',
}

export interface Lead {
  id: LeadId;
  contactId: ContactId;
  opportunityId?: OpportunityId;
  stage: LeadStage;
  source?: string;
  expectedRevenue?: bigint;
  createdAt: bigint;
  ownerId: string;
  notes: string[];
}

export interface Opportunity {
  id: OpportunityId;
  name: string;
  description?: string;
  value: bigint;
  stage: LeadStage;
  probability: bigint;
  expectedCloseDate?: bigint;
  createdAt: bigint;
  ownerId: string;
  notes: string[];
}

export interface CrmTask {
  id: TaskId;
  title: string;
  description?: string;
  dueDate: bigint;
  relatedContact?: ContactId;
  relatedLead?: LeadId;
  relatedOpportunity?: OpportunityId;
  assignedTo: string;
  completed: boolean;
  createdAt: bigint;
}

export interface CrmStats {
  totalContacts: bigint;
  totalLeads: bigint;
  totalOpportunities: bigint;
  totalExpectedRevenue: bigint;
  pipelineStageDistribution: [LeadStage, bigint][];
}

export interface CrmDashboard {
  totalContacts: bigint;
  totalLeads: bigint;
  totalOpportunities: bigint;
  totalExpectedRevenue: bigint;
  stageCount: [LeadStage, bigint][];
}

export interface ActivityLog {
  timestamp: bigint;
  userId: string;
  action: string;
  details: string;
}

export enum EmployeeStatus {
  Active = 'active',
  Inactive = 'inactive',
  Terminated = 'terminated',
  OnLeave = 'onLeave',
}

export interface Employee {
  id: EmployeeId;
  name: string;
  role: string;
  departmentId: DepartmentId;
  joiningDate: bigint;
  salary: bigint;
  status: EmployeeStatus;
  userId?: string;
}

export interface Department {
  id: DepartmentId;
  name: string;
  managerId?: EmployeeId;
  createdAt: bigint;
}

export enum AttendanceStatus {
  Present = 'present',
  Absent = 'absent',
  Leave = 'leave',
}

export interface Attendance {
  id: AttendanceId;
  employeeId: EmployeeId;
  clockInTime: bigint;
  clockOutTime?: bigint;
  date: bigint;
  status: AttendanceStatus;
}

export enum LeaveStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface LeaveRequest {
  id: LeaveId;
  employeeId: EmployeeId;
  startDate: bigint;
  endDate: bigint;
  reason: string;
  status: LeaveStatus;
  createdAt: bigint;
}

export interface Payroll {
  id: PayrollId;
  employeeId: EmployeeId;
  salary: bigint;
  bonus: bigint;
  deductions: bigint;
  netPay: bigint;
  createdAt: bigint;
}

export enum PerformanceReviewStatus {
  NotStarted = 'notStarted',
  InProgress = 'inProgress',
  Completed = 'completed',
}

export interface PerformanceRecord {
  id: PerformanceId;
  employeeId: EmployeeId;
  kpis: {
    communication: bigint;
    productivity: bigint;
    teamwork: bigint;
    leadership: bigint;
  };
  feedback?: string;
  reviewStatus: PerformanceReviewStatus;
  createdAt: bigint;
}

export interface HRDashboard {
  totalEmployees: bigint;
  activeEmployees: bigint;
  inactiveEmployees: bigint;
  departmentDistribution: [DepartmentId, bigint][];
  attendanceRate: bigint;
  leaveSummary: [DepartmentId, bigint][];
}

// Wallet-related types (not yet in backend interface)
export enum WalletStatus {
  active = 'active',
  inactive = 'inactive',
  suspended = 'suspended',
  closed = 'closed',
}

export type WalletType = 
  | { __kind__: 'icp'; icp: null }
  | { __kind__: 'offChain'; offChain: null }
  | { __kind__: 'fiat'; fiat: null }
  | { __kind__: 'digitalAsset'; digitalAsset: null }
  | { __kind__: 'custom'; custom: string };

export interface UnifiedWallet {
  id: string;
  ownerId: Principal;
  walletType: WalletType;
  name: string;
  description: string;
  balance: bigint;
  currency: string;
  status: WalletStatus;
  createdAt: bigint;
}

export enum TransactionStatusNew {
  pending = 'pending',
  completed = 'completed',
  failed = 'failed',
  cancelled = 'cancelled',
  reversed = 'reversed',
}

export interface WalletTransaction {
  ownerId: string;
  id: string;
  walletId: string;
  amount: bigint;
  transactionType: string;
  sourceModule: { __kind__: 'ecommerce' } | { __kind__: 'hrms' } | { __kind__: 'crm' } | { __kind__: 'accounting' } | { __kind__: 'external' };
  typeIdentifier: string;
  referenceId: string;
  createdAt: bigint;
  updatedAt: bigint;
  status: TransactionStatusNew;
}

export interface WalletTransactionEvent {
  eventType: 
    | { __kind__: 'transactionCreated' }
    | { __kind__: 'transactionUpdated' }
    | { __kind__: 'transactionCompleted' }
    | { __kind__: 'transactionFailed' }
    | { __kind__: 'transactionReversed' };
  transaction: WalletTransaction;
  timestamp: bigint;
}

// Organization types (not yet in backend interface)
export type OrganizationRole = 
  | { __kind__: 'org_admin' }
  | { __kind__: 'org_manager' }
  | { __kind__: 'org_employee' };

export interface OrganizationMember {
  organizationId: string;
  userId: Principal;
  roles: OrganizationRole[];
  joinedAt: bigint;
}
