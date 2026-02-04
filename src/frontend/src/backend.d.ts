import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Payroll {
    id: string;
    salary: bigint;
    createdAt: Time;
    deductions: bigint;
    netPay: bigint;
    employeeId: string;
    bonus: bigint;
}
export interface Product {
    id: string;
    sku: string;
    categoryId: string;
    name: string;
    description: string;
    variants?: Array<string>;
    stock: bigint;
    image?: ExternalBlob;
    price: bigint;
    digital: boolean;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface OrderItem {
    sku: string;
    productId: string;
    quantity: bigint;
    price: bigint;
}
export interface Lead {
    id: string;
    source?: string;
    ownerId: Principal;
    createdAt: Time;
    opportunityId?: string;
    stage: LeadStage;
    notes: Array<string>;
    contactId: string;
    expectedRevenue?: bigint;
}
export interface PerformanceRecord {
    id: string;
    kpis: {
        communication: bigint;
        teamwork: bigint;
        productivity: bigint;
        leadership: bigint;
    };
    createdAt: Time;
    reviewStatus: PerformanceReviewStatus;
    feedback?: string;
    employeeId: string;
}
export interface LeaveRequest {
    id: string;
    status: Variant_pending_approved_rejected;
    endDate: Time;
    createdAt: Time;
    employeeId: string;
    startDate: Time;
    reason: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Employee {
    id: string;
    status: EmployeeStatus;
    salary: bigint;
    userId?: Principal;
    name: string;
    role: string;
    joiningDate: Time;
    departmentId: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface CrmTask {
    id: string;
    title: string;
    assignedTo: Principal;
    relatedOpportunity?: string;
    createdAt: Time;
    completed: boolean;
    dueDate: Time;
    description?: string;
    relatedContact?: string;
    relatedLead?: string;
}
export interface Contact {
    id: string;
    ownerId: Principal;
    name: string;
    createdAt: Time;
    email: string;
    company?: string;
    address?: string;
    phone?: string;
    relationshipType: string;
}
export interface Attendance {
    id: string;
    status: Variant_present_leave_absent;
    date: Time;
    clockOutTime?: Time;
    employeeId: string;
    clockInTime: Time;
}
export interface Order {
    id: string;
    status: string;
    total: bigint;
    paymentMethod: string;
    userId: Principal;
    createdAt: Time;
    items: Array<OrderItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Opportunity {
    id: string;
    probability: bigint;
    value: bigint;
    ownerId: Principal;
    name: string;
    createdAt: Time;
    description?: string;
    expectedCloseDate?: Time;
    stage: LeadStage;
    notes: Array<string>;
}
export interface Department {
    id: string;
    name: string;
    createdAt: Time;
    managerId?: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type OrganizationId = string;
export interface Organization {
    id: OrganizationId;
    name: string;
    createdAt: Time;
    createdBy: Principal;
    memberCount: bigint;
    description?: string;
    updatedAt: Time;
    adminCount: bigint;
}
export interface UserProfile {
    name: string;
    shippingAddress?: string;
    paymentMethods: Array<string>;
}
export enum EmployeeStatus {
    onLeave = "onLeave",
    active = "active",
    terminated = "terminated",
    inactive = "inactive"
}
export enum LeadStage {
    new_ = "new",
    closed = "closed",
    contacted = "contacted",
    qualified = "qualified"
}
export enum PerformanceReviewStatus {
    notStarted = "notStarted",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum Variant_present_leave_absent {
    present = "present",
    leave = "leave",
    absent = "absent"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    getAttendance(_attendanceId: string): Promise<Attendance | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContact(_contactId: string): Promise<Contact | null>;
    getCrmTask(_taskId: string): Promise<CrmTask | null>;
    getDepartment(_departmentId: string): Promise<Department | null>;
    getEmployee(_employeeId: string): Promise<Employee | null>;
    getLead(_leadId: string): Promise<Lead | null>;
    getLeaveRequest(_leaveId: string): Promise<LeaveRequest | null>;
    getOpportunity(_opportunityId: string): Promise<Opportunity | null>;
    getOrder(_orderId: string): Promise<Order | null>;
    getOrganization(_orgId: string): Promise<Organization | null>;
    getPayroll(_payrollId: string): Promise<Payroll | null>;
    getPerformanceRecord(_recordId: string): Promise<PerformanceRecord | null>;
    getProduct(_productId: string): Promise<Product | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
