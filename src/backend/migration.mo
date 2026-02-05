import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type Organization = {
    id : Text;
    name : Text;
    description : ?Text;
    createdBy : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    memberCount : Nat;
    adminCount : Nat;
  };

  type Actor = {
    organizations : Map.Map<Text, Organization>;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
