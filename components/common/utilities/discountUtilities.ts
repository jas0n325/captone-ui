
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  ILabel,
  MANUAL_ITEM_DISCOUNT_EVENT,
  MANUAL_TRANSACTION_DISCOUNT_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import {
  getConfiguredEmployeeDiscountDisplayText,
  getFeatureAccessConfig
} from "../../common/utilities/configurationUtils";
import { DiscountLevel, DiscountType } from "../../discounts/constants";


export const getEmployeeDiscountDisplayText = (discountType: DiscountType, discountLevel: DiscountLevel,
    configurationManager: IConfigurationManager): ILabel => {
  if (discountType === DiscountType.Employee) {
    const featureType = discountLevel === DiscountLevel.Item ? MANUAL_ITEM_DISCOUNT_EVENT :
        MANUAL_TRANSACTION_DISCOUNT_EVENT;
    const featureConfig = getFeatureAccessConfig(configurationManager, featureType);
    const discountsConfig = configurationManager.getDiscountsValues();
    return getConfiguredEmployeeDiscountDisplayText(featureConfig, discountsConfig);
  }

  return undefined;
}

export interface IDiscountGroups {
  [key: string]: IDiscountGroupInformation;
}

export interface IDiscountGroupInformation {
  groupButtonText: ILabel;
  buttonLayout: IButtonLayout;
}

export interface IButtonLayout {
  [key: string]: IButtonLayoutInformation;
}

export interface IButtonLayoutInformation {
  discountDefinition: string;
  displayOrder: number;
}
