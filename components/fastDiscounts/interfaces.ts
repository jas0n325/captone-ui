import {
  IFastDiscountButton,
  IFeatureAccessConfig,
  StoreItem
} from "@aptos-scp/scp-component-store-selling-features";

import { MinimumDenomination } from "../common/utilities/denominationRoundingUtils";

export interface FastDiscountProps {
  onExit: () => void;
  onFixedPriceVisibilityChanged?: (visible: boolean) => void;
}

export interface FastDiscountDetailsScreenProps {
  maxAllowedLength: number;
  storeItem: StoreItem;
  onCancel: () => void;
  onFastDiscount: (fastDiscountButton: IFastDiscountButton,
                   priceOverrideAmount?: string,
                   fixedPriceAmount?: string) => void;
  fastDiscountFeature: IFeatureAccessConfig;
  fixedPriceButton: IFastDiscountButton;
  minimumDenomination: MinimumDenomination;
  onFixedPriceVisibilityChanged?: (visible: boolean) => void;
}
