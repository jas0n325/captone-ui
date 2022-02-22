import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

export interface ItemSubscriptionProps {
  lines: Array<IItemDisplayLine>;
  onExit: () => void;
  onContinue?: () => void;
  isCheckout?: boolean;
}

export interface SubscriptionsAuthorizationScreenProps {
  onBack?: () => void;
  onCompleted?: () => void;
}
