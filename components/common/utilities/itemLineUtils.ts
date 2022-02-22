import { Money, Quantity } from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  FAST_DISCOUNT_EVENT,
  IDiscountDisplay,
  IDisplayInfo,
  IItemDisplayLine,
  IPromotionDisplay,
  StoreItem
} from "@aptos-scp/scp-component-store-selling-features";
import {
  IManualDiscountLine,
  IMerchandiseTransaction,
  IPricingAdjustment,
  ManualDiscountType
} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../utilities";
import {getFeatureAccessConfig} from "./configurationUtils";


export const getLineAdjustmentText = (lineAdjustment: IPromotionDisplay | IDiscountDisplay,
                                      configurationManager?: IConfigurationManager): string => {
  let discountText: string;
  if ((lineAdjustment as any).promotionType === undefined) {
    const discount = lineAdjustment as IDiscountDisplay;
    if (discount.isEmployeeDiscount !== undefined && discount.isEmployeeDiscount) {
      discountText = I18n.t("employeeDiscountLine");
    } else if (configurationManager && discount.isFastDiscount !== undefined && discount.isFastDiscount) {
      const fastDiscountFeature = getFeatureAccessConfig(configurationManager,
          FAST_DISCOUNT_EVENT);

      discountText = fastDiscountFeature.discountNameDisplayText[I18n.currentLocale()] || I18n.t("fastDiscount");
    } else if (discount.couponCode) {
      discountText = I18n.t("couponDiscountLine");
    } else if (discount.discountType === ManualDiscountType.ReplacementUnitPrice) {
      if (discount.isCompetitiveDiscount !== undefined && discount.isCompetitiveDiscount) {
        discountText = I18n.t("priceMatchDiscountLine");
      } else {
        discountText = I18n.t("priceDiscountLine");
      }
    } else {
      discountText = I18n.t("discount");
    }

    if (discount.discountType === ManualDiscountType.PercentOff && discount.totalDiscount && !discount.isFastDiscount) {
      discountText = `${discountText} - ${discount.percent}%`;
    }
  } else {
    discountText = (lineAdjustment as IPromotionDisplay).annotationDescription;
  }

  return discountText;
};

export const printAmount = (amount?: Money): string => {
  return amount && (amount.isNegative() ? `(${amount.times(-1).toLocaleString(getStoreLocale()
    , getStoreLocaleCurrencyOptions())})` :
    amount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions()));
};

export const printAmountDue = (amount?: Money, showCurrencyCode?: boolean): string => {
  return amount && (amount.isNegative() ?
      `${getCurrencyCodeForRefund(amount, showCurrencyCode)}${amount.times(-1).toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}` :
      `${amount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}`);
};

export const getCurrencyCodeForRefund = (amount: Money, showCurrencyCode: boolean) => {
  return showCurrencyCode ? `${amount.currency} ` : "";
}

export const printAdjustmentAmount = (amount: Money): string => {
  return amount && (amount.isNegative() ? amount.times(-1).toLocaleString(getStoreLocale()
    , getStoreLocaleCurrencyOptions()) :
    `(${amount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())})`);
};

export const countOfAllItems = (displayInfo: IDisplayInfo, condition?: (line: IItemDisplayLine) => boolean): number => {
  let totalItems: number = 0;

  if (displayInfo && displayInfo.itemDisplayLines && displayInfo.itemDisplayLines.length) {
    displayInfo.itemDisplayLines.forEach((line: IItemDisplayLine) => {
      if (!condition || condition(line)) {
        totalItems += line.quantity;
      }
    });
  }

  return totalItems;
};

export const getPricingAdjustmentLabel = (
  pricingAdjustment: IPricingAdjustment,
  transaction: IMerchandiseTransaction
): string => {
  let discountMessage: string;

  const transactionLine: IManualDiscountLine = pricingAdjustment.transactionLineReference &&
      transaction.lines[pricingAdjustment.transactionLineReference.lineNumber - 1] as IManualDiscountLine;
  if (transactionLine) {
    if (transactionLine.isEmployeeDiscount) {
      discountMessage = `${I18n.t("employeeDiscountLine")}`;
    } else if (transactionLine.couponCode) {
      discountMessage = `${I18n.t("couponDiscountLine")}`;
    } else if (transactionLine.replacementUnitPrice) {
      discountMessage = `${I18n.t("priceDiscountLine")}`;
    } else {
      discountMessage = `${I18n.t("discount")}`;
    }

    if (transactionLine.discountType === ManualDiscountType.PercentOff) {
      discountMessage += ` - ${transactionLine.percent}%`;
    }
  } else {
    discountMessage = pricingAdjustment.discountName;
  }

  return discountMessage;
};

export const getItemQuantity = (line: IItemDisplayLine,
                                showReservedQuantity?: boolean): string => {
  let quantityText: string = line.quantity.toString();
  if (showReservedQuantity !== undefined
      && showReservedQuantity
      && line.reservedQuantity !== undefined) {
    quantityText = line.reservedQuantity.toString() + "/" + quantityText;
  }
  return quantityText;
}

export const displayLinesHasType = (displayInfo: IDisplayInfo, lineType: string): boolean => {
  return (
      displayInfo && displayInfo.itemDisplayLines &&
      displayInfo.itemDisplayLines.length > 0 &&
      !!(displayInfo.itemDisplayLines.find((line) =>
          line.lineType === lineType))
  );
};


export function getItemDisplayLine(storeItem: StoreItem, itemKey?: string, itemKeyType?: string,
                                   quantity?: Quantity): IItemDisplayLine {
  const storeItemDisplayLine: IItemDisplayLine = {
    annotationDescription: "",
    productAttributes: storeItem.productAttributes,
    discountLines: [],
    extendedAmount: storeItem.price.amount,
    extendedAmountExcludingTransactionDiscounts: storeItem.price.amount,
    giftReceipt: false,
    isEmployeeDiscountAllowed: true,
    isManualItemDiscountAllowed: true,
    itemAdditionalDescription: storeItem.additionalDescription,
    itemIdKey: itemKey || storeItem.itemLookupKeys?.[0]?.value,
    itemIdKeyType: itemKeyType || storeItem.itemLookupKeys?.[0]?.type,
    itemImageUrl: storeItem.imageUrl,
    itemSeason: "",
    itemShortDescription: storeItem.shortDescription,
    itemType: storeItem.itemType,
    lineAdjustments: [],
    lineNumber: 0,
    originalExtendedAmount: storeItem.price.amount,
    originalUnitPrice: storeItem.price,
    quantity: quantity ? quantity.amount : 1,
    salesperson: undefined,
    unitPrice: storeItem.price,
    unitPriceExcludingTransactionDiscounts: storeItem.price,
    fulfillmentGroupId: undefined
  };
  return storeItemDisplayLine;
}

export function itemDisplayLineCreated(prevDisplayInfo: IDisplayInfo, currentDisplayInfo: IDisplayInfo): boolean {
  const itemDisplayLinesUsedToBeEmpty: boolean = !prevDisplayInfo || !prevDisplayInfo.itemDisplayLines ||
      !prevDisplayInfo.itemDisplayLines.length;

  const itemDisplayLinesAreNowPresent: boolean = currentDisplayInfo && currentDisplayInfo.itemDisplayLines &&
      currentDisplayInfo.itemDisplayLines.length > 0;

  return itemDisplayLinesUsedToBeEmpty && itemDisplayLinesAreNowPresent;
}

export function itemDisplayLineAdded(prevDisplayInfo: IDisplayInfo, currentDisplayInfo: IDisplayInfo): boolean {
  return prevDisplayInfo?.itemDisplayLines && currentDisplayInfo?.itemDisplayLines &&
      prevDisplayInfo.itemDisplayLines.length < currentDisplayInfo.itemDisplayLines.length;
}
