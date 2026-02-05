import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";

module {
  public type OrganizationId = Text;

  public type Organization = {
    id : OrganizationId;
    name : Text;
    description : ?Text;
    createdBy : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    memberCount : Nat;
    adminCount : Nat;
  };

  public type OrganizationRole = {
    #org_admin;
    #org_manager;
    #org_employee;
  };

  public type OrganizationMember = {
    organizationId : OrganizationId;
    userId : Principal;
    roles : [OrganizationRole];
    joinedAt : Time.Time;
  };

  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    categoryId : Text;
    image : ?Storage.ExternalBlob;
    stock : Nat;
    sku : Text;
    digital : Bool;
    variants : ?[Text];
  };

  public type Category = {
    id : Text;
    name : Text;
    parentId : ?Text;
  };

  public type OrderItem = {
    productId : Text;
    quantity : Nat;
    price : Nat;
    sku : Text;
  };

  public type Order = {
    id : Text;
    userId : Principal;
    items : [OrderItem];
    total : Nat;
    status : Text;
    paymentMethod : Text;
    createdAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    shippingAddress : ?Text;
    paymentMethods : [Text];
  };

  public type Contact = {
    id : Text;
    name : Text;
    email : Text;
    phone : ?Text;
    relationshipType : Text;
    company : ?Text;
    address : ?Text;
    createdAt : Time.Time;
    ownerId : Principal;
  };

  public type LeadStage = {
    #new;
    #contacted;
    #qualified;
    #closed;
  };

  public type Lead = {
    id : Text;
    contactId : Text;
    opportunityId : ?Text;
    stage : LeadStage;
    source : ?Text;
    expectedRevenue : ?Nat;
    createdAt : Time.Time;
    ownerId : Principal;
    notes : [Text];
  };

  public type Opportunity = {
    id : Text;
    name : Text;
    description : ?Text;
    value : Nat;
    stage : LeadStage;
    probability : Nat;
    expectedCloseDate : ?Time.Time;
    createdAt : Time.Time;
    ownerId : Principal;
    notes : [Text];
  };

  public type CrmTask = {
    id : Text;
    title : Text;
    description : ?Text;
    dueDate : Time.Time;
    relatedContact : ?Text;
    relatedLead : ?Text;
    relatedOpportunity : ?Text;
    assignedTo : Principal;
    completed : Bool;
    createdAt : Time.Time;
  };

  public type PerformanceReviewStatus = {
    #notStarted;
    #inProgress;
    #completed;
  };

  public type EmployeeStatus = {
    #active;
    #inactive;
    #terminated;
    #onLeave;
  };

  public type Employee = {
    id : Text;
    name : Text;
    role : Text;
    departmentId : Text;
    joiningDate : Time.Time;
    salary : Nat;
    status : EmployeeStatus;
    userId : ?Principal;
  };

  public type Department = {
    id : Text;
    name : Text;
    managerId : ?Text;
    createdAt : Time.Time;
  };

  public type Attendance = {
    id : Text;
    employeeId : Text;
    clockInTime : Time.Time;
    clockOutTime : ?Time.Time;
    date : Time.Time;
    status : { #present; #absent; #leave };
  };

  public type LeaveRequest = {
    id : Text;
    employeeId : Text;
    startDate : Time.Time;
    endDate : Time.Time;
    reason : Text;
    status : { #pending; #approved; #rejected };
    createdAt : Time.Time;
  };

  public type Payroll = {
    id : Text;
    employeeId : Text;
    salary : Nat;
    bonus : Nat;
    deductions : Nat;
    netPay : Nat;
    createdAt : Time.Time;
  };

  public type PerformanceRecord = {
    id : Text;
    employeeId : Text;
    kpis : {
      communication : Nat;
      productivity : Nat;
      teamwork : Nat;
      leadership : Nat;
    };
    feedback : ?Text;
    reviewStatus : PerformanceReviewStatus;
    createdAt : Time.Time;
  };

  public type AccountingData = {};
  public type Actor = {
    organizations : Map.Map<Text, Organization>;
    organizationMembers : Map.Map<Text, List.List<OrganizationMember>>;
    products : Map.Map<Text, Product>;
    categories : Map.Map<Text, Category>;
    orders : Map.Map<Text, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    contacts : Map.Map<Text, Contact>;
    leads : Map.Map<Text, Lead>;
    opportunities : Map.Map<Text, Opportunity>;
    crmTasks : Map.Map<Text, CrmTask>;
    employees : Map.Map<Text, Employee>;
    departments : Map.Map<Text, Department>;
    attendanceRecords : Map.Map<Text, Attendance>;
    leaveRequests : Map.Map<Text, LeaveRequest>;
    payrolls : Map.Map<Text, Payroll>;
    performanceRecords : Map.Map<Text, PerformanceRecord>;
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  public func run(oldState : Actor) : Actor {
    oldState;
  };
};
