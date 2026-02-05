import Map "mo:core/Map";

module {
  public type WalletId = Text;
  public type TransactionId = Text;
  public type WalletEventId = Text;
  public type OrganizationId = Text;
  public type CurrencyCode = Text;

  public type Wallet = {
    id : WalletId;
    organizationId : OrganizationId;
    name : Text;
    description : ?Text;
    balance : Nat;
    currency : CurrencyCode;
    createdBy : Principal;
    createdAt : Int;
    updatedAt : Int;
    isActive : Bool;
  };

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
    createdAt : Int;
    updatedAt : Int;
  };

  public type EventType = Text;

  public type WalletEvent = {
    id : WalletEventId;
    walletId : WalletId;
    organizationId : OrganizationId;
    eventType : EventType;
    description : Text;
    payload : ?Text;
    createdBy : Principal;
    createdAt : Int;
  };

  public type LegacyWalletState = {
    wallets : Map.Map<WalletId, Wallet>;
    walletTransactions : Map.Map<TransactionId, WalletTransaction>;
    walletEvents : Map.Map<WalletEventId, WalletEvent>;
  };

  public type MigratedWalletState = {
    wallets : Map.Map<WalletId, Wallet>;
    walletTransactions : Map.Map<TransactionId, WalletTransaction>;
    walletEvents : Map.Map<WalletEventId, WalletEvent>;
  };

  public func run(legacyState : LegacyWalletState) : MigratedWalletState {
    {
      wallets = legacyState.wallets;
      walletTransactions = legacyState.walletTransactions;
      walletEvents = legacyState.walletEvents;
    };
  };
};
