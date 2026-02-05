import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public type WalletId = Text;
  public type TransactionId = Text;
  public type WalletEventId = Text;
  public type OrganizationId = Text;
  public type CurrencyCode = Text;
  public type EventType = Text;

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

  public type WalletDomainState = {
    wallets : Map.Map<WalletId, Wallet>;
    walletTransactions : Map.Map<TransactionId, WalletTransaction>;
    walletEvents : Map.Map<WalletEventId, WalletEvent>;
  };

  public func run(state : WalletDomainState) : WalletDomainState {
    // Forward-compatible migration entrypoint
    // Currently performs identity transformation
    // Future migrations can add transformation logic here
    {
      wallets = state.wallets;
      walletTransactions = state.walletTransactions;
      walletEvents = state.walletEvents;
    };
  };
};
