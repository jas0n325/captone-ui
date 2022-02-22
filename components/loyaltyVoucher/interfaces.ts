import { ILoyaltyVoucher } from "@aptos-scp/scp-component-store-selling-features";

export interface LoyaltyVoucherScreenProps {
  tenderName: string;
  pluralTenderName: string;
  onApply: (loyaltyVoucher: ILoyaltyVoucher) => void;
  onExit: () => void;
}
