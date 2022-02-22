import {
  IDiscountDisplayLine,
  IItemDisplayLine
} from "@aptos-scp/scp-component-store-selling-features";

import { IDiscountGroupInformation } from "../common/utilities/discountUtilities";
import { DiscountLevel, DiscountType } from "./constants";

export interface DiscountTypeSelectionProps {
  discountLevel: DiscountLevel;
  itemLines?: IItemDisplayLine[];
  transactionDiscountDisplayLines?: IDiscountDisplayLine[];
  isLoyaltyDiscountEnable?: boolean;
  onDiscount: (
    discountLevel: DiscountLevel,
    discountType: DiscountType,
    discountDisplayLine?: IDiscountDisplayLine
  ) => void;
  onExit: () => void;
}

export interface DiscountComponentProps {
  discountLevel: DiscountLevel;
  discountType: DiscountType;
  itemLines?: IItemDisplayLine[];
  discountDisplayLine?: IDiscountDisplayLine;
  showLine: boolean;
  onCancel: () => void;
}

export interface PreConfiguredDiscountsScreenProps {
  transactionDiscountGroup: IDiscountGroupInformation;
  onDiscount: (
    discountLevel: DiscountLevel,
    discountType: DiscountType,
    discountDisplayLine?: IDiscountDisplayLine
  ) => void;
  onExit: () => void;
}
