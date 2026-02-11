import AccessControl "authorization/access-control";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Nat "mo:core/Nat";
import OutCall "http-outcalls/outcall";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import Text "mo:core/Text";
import Time "mo:core/Time";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

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
    organizationId : Text;
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

  public type Fee = {
    id : Text;
    feeType : { #fixed; #percentage };
    amount : Nat;
    description : Text;
    applicableTo : [Text];
  };

  public type AccountingData = {};

  public type WalletId = Text;
  public type CurrencyCode = Text;

  public type Wallet = {
    id : WalletId;
    organizationId : OrganizationId;
    name : Text;
    description : ?Text;
    balance : Nat;
    currency : CurrencyCode;
    createdBy : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    isActive : Bool;
  };

  public type TransactionId = Text;

  public type TransactionType = {
    #deposit;
    #withdrawal;
    #transfer;
  };

  public type TransactionStatus = {
    #pending;
    #completed;
    #failed;
  };

  public type WalletTransaction = {
    id : TransactionId;
    walletId : WalletId;
    organizationId : OrganizationId;
    transactionType : TransactionType;
    amount : Nat;
    currency : CurrencyCode;
    status : TransactionStatus;
    createdBy : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type WalletEventId = Text;
  public type EventType = Text;

  public type WalletEvent = {
    id : WalletEventId;
    walletId : WalletId;
    organizationId : OrganizationId;
    eventType : EventType;
    description : Text;
    payload : ?Text;
    createdBy : Principal;
    createdAt : Time.Time;
  };

  public type WalletSummaryData = {
    wallet : Wallet;
    transactions : [WalletTransaction];
    events : [WalletEvent];
  };

  public type WalletSummary = {
    wallets : [Wallet];
    transactions : [WalletTransaction];
    events : [WalletEvent];
  };

  public type WalletOverviewResponse = {
    id : WalletId;
    name : Text;
    description : ?Text;
    balance : Nat;
    currency : Text;
    transactionCount : Nat;
    eventCount : Nat;
    isActive : Bool;
  };

  public type SidebarFinancialSection = {
    sectionName : Text;
    overviewData : {
      totalBalance : Nat;
      activeWallets : Nat;
      transactionVolume : Nat;
      recentTransactions : [WalletTransaction];
    };
  };

  public type SidebarFinancialsResponse = {
    wallets : [WalletOverviewResponse];
    transactions : [WalletTransaction];
    events : [WalletEvent];
    financialSections : [SidebarFinancialSection];
  };

  let organizations = Map.empty<Text, Organization>();
  let organizationMembers = Map.empty<Text, List.List<OrganizationMember>>();
  let products = Map.empty<Text, Product>();
  let categories = Map.empty<Text, Category>();
  let orders = Map.empty<Text, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let contacts = Map.empty<Text, Contact>();
  let leads = Map.empty<Text, Lead>();
  let opportunities = Map.empty<Text, Opportunity>();
  let crmTasks = Map.empty<Text, CrmTask>();
  let employees = Map.empty<Text, Employee>();
  let departments = Map.empty<Text, Department>();
  let attendanceRecords = Map.empty<Text, Attendance>();
  let leaveRequests = Map.empty<Text, LeaveRequest>();
  let payrolls = Map.empty<Text, Payroll>();
  let performanceRecords = Map.empty<Text, PerformanceRecord>();

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  var wallets = Map.empty<WalletId, Wallet>();
  var walletTransactions = Map.empty<TransactionId, WalletTransaction>();
  var walletEvents = Map.empty<WalletEventId, WalletEvent>();

  private func isOrganizationMember(caller : Principal, orgId : Text) : Bool {
    switch (organizationMembers.get(orgId)) {
      case null { false };
      case (?members) {
        members.any(
          func(m : OrganizationMember) : Bool {
            Principal.equal(m.userId, caller)
          },
        );
      };
    };
  };

  private func isOrganizationAdmin(caller : Principal, orgId : Text) : Bool {
    switch (organizationMembers.get(orgId)) {
      case null { false };
      case (?members) {
        members.any(
          func(m : OrganizationMember) : Bool {
            Principal.equal(m.userId, caller) and m.roles.find<OrganizationRole>(
              func(r : OrganizationRole) : Bool { r == #org_admin },
            ) != null
          },
        );
      };
    };
  };

  private func getEmployeeByUserId(userId : Principal) : ?Employee {
    for ((_, emp) in employees.entries()) {
      switch (emp.userId) {
        case (?uid) {
          if (Principal.equal(uid, userId)) {
            return ?emp;
          };
        };
        case null {};
      };
    };
    null;
  };

  private func getDepartmentOrganizationId(departmentId : Text) : ?OrganizationId {
    switch (departments.get(departmentId)) {
      case null { null };
      case (?dept) {
        for ((_, emp) in employees.entries()) {
          if (emp.departmentId == departmentId) {
            for ((orgId, members) in organizationMembers.entries()) {
              let isMember = members.any(
                func(m : OrganizationMember) : Bool {
                  switch (emp.userId) {
                    case (?uid) { Principal.equal(m.userId, uid) };
                    case null { false };
                  };
                },
              );
              if (isMember) {
                return ?orgId;
              };
            };
          };
        };
        null;
      };
    };
  };

  private func getWalletOrganizationId(walletId : WalletId) : ?OrganizationId {
    switch (wallets.get(walletId)) {
      case null { null };
      case (?wallet) { ?wallet.organizationId };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller.notEqual(user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getOrganization(_orgId : Text) : async ?Organization {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get organizations");
    };
    if (not isOrganizationMember(caller, _orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You must be a member of this organization");
    };
    organizations.get(_orgId);
  };

  public query ({ caller }) func getProduct(_productId : Text) : async ?Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get products");
    };
    products.get(_productId);
  };

  public query ({ caller }) func getOrder(_orderId : Text) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get orders");
    };
    switch (orders.get(_orderId)) {
      case null { null };
      case (?order) {
        if (caller.notEqual(order.userId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own orders");
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func getContact(_contactId : Text) : async ?Contact {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get contacts");
    };
    switch (contacts.get(_contactId)) {
      case null { null };
      case (?contact) {
        if (caller.notEqual(contact.ownerId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own contacts");
        };
        ?contact;
      };
    };
  };

  public query ({ caller }) func getLead(_leadId : Text) : async ?Lead {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get leads");
    };
    switch (leads.get(_leadId)) {
      case null { null };
      case (?lead) {
        if (caller.notEqual(lead.ownerId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own leads");
        };
        ?lead;
      };
    };
  };

  public query ({ caller }) func getOpportunity(_opportunityId : Text) : async ?Opportunity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get opportunities");
    };
    switch (opportunities.get(_opportunityId)) {
      case null { null };
      case (?opportunity) {
        if (caller.notEqual(opportunity.ownerId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own opportunities");
        };
        ?opportunity;
      };
    };
  };

  public query ({ caller }) func getCrmTask(_taskId : Text) : async ?CrmTask {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get tasks");
    };
    switch (crmTasks.get(_taskId)) {
      case null { null };
      case (?task) {
        if (caller.notEqual(task.assignedTo) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view tasks assigned to you");
        };
        ?task;
      };
    };
  };

  public query ({ caller }) func getEmployee(_employeeId : Text) : async ?Employee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get employees");
    };
    switch (employees.get(_employeeId)) {
      case null { null };
      case (?employee) {
        let isOwnRecord = switch (employee.userId) {
          case (?uid) { Principal.equal(caller, uid) };
          case null { false };
        };
        if (not isOwnRecord and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own employee record");
        };
        ?employee;
      };
    };
  };

  public query ({ caller }) func getDepartment(_departmentId : Text) : async ?Department {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get departments");
    };

    switch (getDepartmentOrganizationId(_departmentId)) {
      case null {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You must be a member of the department's organization or an admin");
        };
      };
      case (?orgId) {
        if (not isOrganizationMember(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You must be a member of the department's organization");
        };
      };
    };

    departments.get(_departmentId);
  };

  public query ({ caller }) func getAttendance(_attendanceId : Text) : async ?Attendance {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get attendance");
    };
    switch (attendanceRecords.get(_attendanceId)) {
      case null { null };
      case (?attendance) {
        switch (employees.get(attendance.employeeId)) {
          case null { null };
          case (?employee) {
            let isOwnRecord = switch (employee.userId) {
              case (?uid) { Principal.equal(caller, uid) };
              case null { false };
            };
            if (not isOwnRecord and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You can only view your own attendance");
            };
            ?attendance;
          };
        };
      };
    };
  };

  public query ({ caller }) func getLeaveRequest(_leaveId : Text) : async ?LeaveRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get leave requests");
    };
    switch (leaveRequests.get(_leaveId)) {
      case null { null };
      case (?leave) {
        switch (employees.get(leave.employeeId)) {
          case null { null };
          case (?employee) {
            let isOwnRecord = switch (employee.userId) {
              case (?uid) { Principal.equal(caller, uid) };
              case null { false };
            };
            if (not isOwnRecord and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You can only view your own leave requests");
            };
            ?leave;
          };
        };
      };
    };
  };

  public query ({ caller }) func getPayroll(_payrollId : Text) : async ?Payroll {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get payroll");
    };
    switch (payrolls.get(_payrollId)) {
      case null { null };
      case (?payroll) {
        switch (employees.get(payroll.employeeId)) {
          case null { null };
          case (?employee) {
            let isOwnRecord = switch (employee.userId) {
              case (?uid) { Principal.equal(caller, uid) };
              case null { false };
            };
            if (not isOwnRecord and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You can only view your own payroll");
            };
            ?payroll;
          };
        };
      };
    };
  };

  public query ({ caller }) func getPerformanceRecord(_recordId : Text) : async ?PerformanceRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get performance records");
    };
    switch (performanceRecords.get(_recordId)) {
      case null { null };
      case (?record) {
        switch (employees.get(record.employeeId)) {
          case null { null };
          case (?employee) {
            let isOwnRecord = switch (employee.userId) {
              case (?uid) { Principal.equal(caller, uid) };
              case null { false };
            };
            if (not isOwnRecord and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You can only view your own performance records");
            };
            ?record;
          };
        };
      };
    };
  };

  public query ({ caller }) func getWallet(_walletId : WalletId) : async ?Wallet {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get wallets");
    };
    switch (wallets.get(_walletId)) {
      case null { null };
      case (?wallet) {
        if (not isOrganizationMember(caller, wallet.organizationId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You must be a member of the wallet's organization");
        };
        ?wallet;
      };
    };
  };

  public query ({ caller }) func getWalletTransaction(_transactionId : TransactionId) : async ?WalletTransaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get wallet transactions");
    };
    switch (walletTransactions.get(_transactionId)) {
      case null { null };
      case (?transaction) {
        if (not isOrganizationMember(caller, transaction.organizationId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You must be a member of the transaction's organization");
        };
        ?transaction;
      };
    };
  };

  public query ({ caller }) func getWalletEvent(_eventId : WalletEventId) : async ?WalletEvent {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get wallet events");
    };
    switch (walletEvents.get(_eventId)) {
      case null { null };
      case (?event) {
        if (not isOrganizationMember(caller, event.organizationId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You must be a member of the event's organization");
        };
        ?event;
      };
    };
  };

  public query ({ caller }) func getOrganizationWallets(orgId : Text) : async [Wallet] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get wallet data");
    };
    if (not isOrganizationMember(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You must be a member of the organization");
    };
    wallets.values().filter(func(w) { w.organizationId == orgId }).toArray();
  };

  public query ({ caller }) func getOrganizationWalletTransactions(orgId : Text, walletId : WalletId) : async [WalletTransaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get wallet transactions");
    };
    if (walletId == "") {
      if (not isOrganizationMember(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
        Runtime.trap("Unauthorized: You must be a member of the organization");
      };
    } else {
      switch (wallets.get(walletId)) {
        case (null) { Runtime.trap("Wallet not found") };
        case (?wallet) {
          if (wallet.organizationId != orgId) {
            Runtime.trap("Unauthorized: Wallet does not belong to this organization");
          };
          if (not isOrganizationMember(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: You must be a member of the wallet's organization");
          };
        };
      };
    };

    var filtered = walletTransactions.values();
    if (walletId != "") {
      filtered := filtered.filter(func(t) { t.organizationId == orgId and t.walletId == walletId });
    } else {
      filtered := filtered.filter(func(t) { t.organizationId == orgId });
    };
    filtered.toArray();
  };

  public query ({ caller }) func getOrganizationWalletEvents(orgId : Text, walletId : WalletId) : async [WalletEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get wallet events");
    };
    if (walletId == "") {
      if (not isOrganizationMember(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
        Runtime.trap("Unauthorized: You must be a member of the organization");
      };
    } else {
      switch (wallets.get(walletId)) {
        case (null) { Runtime.trap("Wallet not found") };
        case (?wallet) {
          if (wallet.organizationId != orgId) {
            Runtime.trap("Unauthorized: Wallet does not belong to this organization");
          };
          if (not isOrganizationMember(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: You must be a member of the wallet's organization");
          };
        };
      };
    };

    var filtered = walletEvents.values();
    if (walletId != "") {
      filtered := filtered.filter(func(e) { e.organizationId == orgId and e.walletId == walletId });
    } else {
      filtered := filtered.filter(func(e) { e.organizationId == orgId });
    };
    filtered.toArray();
  };

  public query ({ caller }) func getOrganizationWalletsSummary(orgId : Text) : async [WalletOverviewResponse] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get wallet summaries");
    };
    if (not isOrganizationMember(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You must be a member of the organization");
    };
    wallets.values().filter(func(w) { w.organizationId == orgId }).toArray().map(
      func(wallet) {
        {
          id = wallet.id;
          name = wallet.name;
          description = wallet.description;
          balance = wallet.balance;
          currency = wallet.currency;
          transactionCount = walletTransactions.values().filter(func(t) { t.walletId == wallet.id }).size();
          eventCount = walletEvents.values().filter(func(e) { e.walletId == wallet.id }).size();
          isActive = wallet.isActive;
        };
      }
    );
  };

  public query ({ caller }) func getOrganizationSidebarFinancials(orgId : Text) : async SidebarFinancialsResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access wallet data");
    };
    if (not isOrganizationMember(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You must be a member of the organization");
    };

    let orgWallets = wallets.values().filter(func(w) { w.organizationId == orgId }).toArray();
    let orgTransactions = walletTransactions.values().filter(func(t) { t.organizationId == orgId }).toArray();
    let orgEvents = walletEvents.values().filter(func(e) { e.organizationId == orgId }).toArray();

    let walletOverviews = orgWallets.map(
      func(wallet) {
        {
          id = wallet.id;
          name = wallet.name;
          description = wallet.description;
          balance = wallet.balance;
          currency = wallet.currency;
          transactionCount = orgTransactions.filter(func(t) { t.walletId == wallet.id }).size();
          eventCount = orgEvents.filter(func(e) { e.walletId == wallet.id }).size();
          isActive = wallet.isActive;
        };
      }
    );

    if (orgWallets.size() == 0) {
      return {
        wallets = [];
        transactions = [];
        events = [];
        financialSections = [];
      };
    };

    let financialSections = [ {
      sectionName = "Wallet Overview";
      overviewData = {
        totalBalance = orgWallets.foldLeft(
          0,
          func(acc, wallet) { acc + wallet.balance },
        );
        activeWallets = orgWallets.filter(func(w) { w.isActive }).size();
        transactionVolume = orgTransactions.foldLeft(
          0,
          func(acc, t) { acc + t.amount },
        );
        recentTransactions = orgTransactions;
      };
    } ];

    {
      wallets = walletOverviews;
      transactions = orgTransactions;
      events = orgEvents;
      financialSections;
    };
  };

  public query ({ caller }) func getWalletSummary(walletId : WalletId) : async WalletSummaryData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get wallet summaries");
    };
    switch (wallets.get(walletId)) {
      case null { Runtime.trap("Wallet not found") };
      case (?wallet) {
        if (not isOrganizationMember(caller, wallet.organizationId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You must be a member of the wallet's organization");
        };

        let transactions = walletTransactions.values().filter(func(t) { t.walletId == walletId }).toArray();
        let events = walletEvents.values().filter(func(e) { e.walletId == walletId }).toArray();

        {
          wallet;
          transactions;
          events;
        };
      };
    };
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func getOrganizations() : async [Organization] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list organizations");
    };

    let isGlobalAdmin = AccessControl.isAdmin(accessControlState, caller);
    var result : [Organization] = [];

    for ((_, org) in organizations.entries()) {
      if (isGlobalAdmin or isOrganizationMember(caller, org.id)) {
        result := result.concat([org]);
      };
    };

    result;
  };

  public shared ({ caller }) func createOrganization(name : Text, description : ?Text) : async Organization {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create organizations");
    };

    let orgId = name # "_" # Time.now().toText();
    let org : Organization = {
      id = orgId;
      name;
      description;
      createdBy = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
      memberCount = 1;
      adminCount = 1;
    };

    organizations.add(orgId, org);

    let adminMember : OrganizationMember = {
      organizationId = orgId;
      userId = caller;
      roles = [#org_admin];
      joinedAt = Time.now();
    };

    let members = List.fromArray<OrganizationMember>([adminMember]);
    organizationMembers.add(orgId, members);
    org;
  };

  public query ({ caller }) func getOrganizationMembers(orgId : Text) : async [OrganizationMember] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view organization members");
    };
    if (not isOrganizationMember(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You must be a member or admin of this organization to view members");
    };
    switch (organizationMembers.get(orgId)) {
      case (null) { Runtime.trap("Organization not found") };
      case (?members) {
        members.toArray();
      };
    };
  };

  public shared ({ caller }) func addOrganizationMember(orgId : Text, user : Principal, roles : [OrganizationRole]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add organization members");
    };
    if (not isOrganizationAdmin(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only organization admins can add members");
    };

    let newMember : OrganizationMember = {
      organizationId = orgId;
      userId = user;
      roles = roles;
      joinedAt = Time.now();
    };

    let currentMembers = switch (organizationMembers.get(orgId)) {
      case (null) { Runtime.trap("Organization not found") };
      case (?members) { members };
    };

    let alreadyMember = currentMembers.any(
      func(m : OrganizationMember) : Bool {
        Principal.equal(m.userId, user)
      }
    );

    if (alreadyMember) {
      Runtime.trap("User is already a member of this organization");
    };

    let currentMembersArray = currentMembers.toArray();
    let updatedMembers = List.fromArray<OrganizationMember>(
      [newMember].concat(currentMembersArray)
    );
    organizationMembers.add(orgId, updatedMembers);
  };

  public shared ({ caller }) func removeOrganizationMember(orgId : Text, user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove organization members");
    };
    if (not isOrganizationAdmin(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only organization admins can remove members");
    };

    switch (organizationMembers.get(orgId)) {
      case (null) { Runtime.trap("Organization not found") };
      case (?members) {
        let memberToRemove = members.find(
          func(m : OrganizationMember) : Bool {
            Principal.equal(m.userId, user)
          }
        );

        switch (memberToRemove) {
          case (null) { Runtime.trap("User is not a member of this organization") };
          case (?member) {
            let isAdmin = member.roles.find<OrganizationRole>(
              func(role : OrganizationRole) : Bool { role == #org_admin }
            ) != null;

            if (isAdmin) {
              Runtime.trap("Cannot remove admin members");
            };

            let filteredMembers = members.filter(
              func(m : OrganizationMember) : Bool {
                not Principal.equal(m.userId, user)
              }
            );
            organizationMembers.add(orgId, filteredMembers);
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateOrganizationMemberRoles(orgId : Text, user : Principal, roles : [OrganizationRole]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update organization member roles");
    };
    if (not isOrganizationAdmin(caller, orgId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only organization admins can update member roles");
    };

    switch (organizationMembers.get(orgId)) {
      case (null) { Runtime.trap("Organization not found") };
      case (?members) {
        let memberExists = members.any(
          func(m : OrganizationMember) : Bool {
            Principal.equal(m.userId, user)
          }
        );

        if (not memberExists) {
          Runtime.trap("User is not a member of this organization");
        };

        let updatedMembers = members.map<OrganizationMember, OrganizationMember>(
          func(member : OrganizationMember) : OrganizationMember {
            if (Principal.equal(member.userId, user)) {
              {
                organizationId = member.organizationId;
                userId = member.userId;
                roles = roles;
                joinedAt = member.joinedAt;
              };
            } else {
              member;
            };
          }
        );
        organizationMembers.add(orgId, updatedMembers);
      };
    };
  };
};
