import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  AllowedDiscountTypes,
  APPLY_COUPON_EVENT,
  APPLY_DISCOUNT_EVENT,
  APPLY_ITEM_SUBSCRIPTION_EVENT,
  APPLY_SINGLE_USE_COUPON_EVENT,
  CAPTURE_LOTTERY_CODE_EVENT,
  COMMENT_ITEM_EVENT,
  ENTER_RETURN_MODE_EVENT,
  EXIT_RETURN_MODE_EVENT,
  FAST_DISCOUNT_EVENT,
  GIFT_RECEIPT_ITEM_EVENT,
  GIFT_RECEIPT_TRANSACTION_EVENT,
  IFeatureAccessConfig,
  ISSUE_GIFT_CARD_EVENT,
  ISSUE_GIFT_CERTIFICATE_EVENT,
  isUserInputTaxLotteryEnabled,
  ITEM_TAX_EXEMPT_EVENT,
  ITEM_TAX_OVERRIDE_EVENT,
  MANUAL_ITEM_DISCOUNT_EVENT,
  MANUAL_TRANSACTION_DISCOUNT_EVENT,
  MODIFY_RETURN_ITEM_REASON_CODE_EVENT,
  PRICE_CHANGE_EVENT,
  QUANTITY_CHANGE_EVENT,
  SALESPERSON_ASSOCIATION_EVENT,
  SALESPERSON_ITEM_ASSOCIATION_EVENT,
  SALESPERSON_TRANSACTION_ASSOCIATION_EVENT,
  SEARCH_NON_MERCH_ITEMS_EVENT,
  SELL_ITEM_EVENT,
  SUSPEND_TRANSACTION_EVENT,
  TRANSACTION_RESUME_EVENT,
  TRANSACTION_TAX_EXEMPT_EVENT,
  TRANSACTION_TAX_OVERRIDE_EVENT,
  VOID_ITEM_LINE_EVENT,
  VOID_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import { getFeatureAccessConfig, getReturnsBehaviors } from "./configurationUtils";


export type IFeatureActionButtonProps = IFeatureActionButtonItemProps & IFeatureActionButtonTransactionProps;

export type IFeatureActionButtonTransactionProps =
    IFeatureActionButtonInTransactionProps & IFeatureActionButtonNotInTransactionProps;

export interface IFeatureActionButtonItemProps extends IItemDiscountFeatureActionsProps {
  isVoidItemVisible: boolean;
  isVoidItemEnabled: boolean;
  isQuantityChangeVisible: boolean;
  isQuantityChangeEnabled: boolean;
  isQuantityChangeOnReturnEnabled: boolean;
  isPriceChangeVisible: boolean;
  isPriceChangeEnabled: boolean;
  isAssignSalespersonItemVisible: boolean;
  isAssignSalespersonItemEnabled: boolean;
  isMarkGiftReceiptItemVisible: boolean;
  isMarkGiftReceiptItemEnabled: boolean;
  isMarkCommentItemVisible?: boolean;
  isMarkItemTaxOverrideVisible?: boolean;
  isCommentItemEnabled?: boolean;
  isItemTaxOverrideEnabled?: boolean;
  isItemTaxExemptVisible: boolean;
  isItemTaxExemptEnabled: boolean;
  isReturnReasonChangeVisible: boolean;
  isReturnReasonChangeEnabled: boolean;
  isItemSubscriptionVisible: boolean;
  isItemSubscriptionEnabled: boolean;
}

export interface IFeatureActionButtonInTransactionProps extends IVoidTransactionFeatureActionsProps,
    ITransactionDiscountFeatureActionsProps {
  isSuspendTransactionVisible: boolean;
  isSuspendTransactionEnabled: boolean;
  isAssignSalespersonTransactionVisible: boolean;
  isAssignSalespersonTransactionEnabled: boolean;
  isCouponEnabled: boolean;
  isMarkGiftReceiptTransactionVisible: boolean;
  isMarkGiftReceiptTransactionEnabled: boolean;
  isGiftCardIssueVisible: boolean;
  isGiftCardIssueEnabled: boolean;
  isGiftCertificateIssueVisible: boolean;
  isGiftCertificateIssueEnabled: boolean;
  isTransactionTaxExemptEnabled: boolean;
  isTransactionTaxExemptVisible: boolean;
  isTransactionTaxOverrideEnabled: boolean;
  isTransactionTaxOverrideVisible: boolean;
  isExitReturnVisible: boolean;
  isExitReturnEnabled: boolean;
  isFastDiscountVisible: boolean;
  isFastDiscountEnabled: boolean;
  isNonMerchVisible: boolean;
  isNonMerchEnabled: boolean;
  isLotteryVisible: boolean;
  isLotteryEnabled: boolean;
  isPreConfiguredDiscountsVisible: boolean;
  isPreConfiguredDiscountsEnabled: boolean;
}

export interface IFeatureActionButtonNotInTransactionProps {
  isResumeSaleVisible: boolean;
  isResumeSaleEnabled: boolean;
  isGiftCardIssueVisible: boolean;
  isGiftCardIssueEnabled: boolean;
  isGiftCertificateIssueVisible: boolean;
  isGiftCertificateIssueEnabled: boolean;
  isReturnVisible: boolean;
  isReturnEnabled: boolean;
  isFastDiscountVisible: boolean;
  isFastDiscountEnabled: boolean;
}

export interface IVoidTransactionFeatureActionsProps {
  isVoidTransactionVisible: boolean;
  isVoidTransactionEnabled: boolean;
  voidTransactionReasonListType: string;
}

export interface IItemDiscountFeatureActionsProps {
  isItemDiscountVisible: boolean;
  isItemDiscountEnabled: boolean;
  isItemReasonCodeDiscountEnable: boolean;
  isItemCouponDiscountEnable: boolean;
  isItemEmployeeDiscountEnable: boolean;
  isItemNewPriceDiscountEnable: boolean;
  isCompetitivePriceDiscountEnabled: boolean;
}

export interface ITransactionDiscountFeatureActionsProps {
  isTransactionDiscountVisible: boolean;
  isTransactionDiscountEnabled: boolean;
  isTransactionReasonCodeDiscountEnable: boolean;
  isTransactionCouponDiscountEnable: boolean;
  isTransactionEmployeeDiscountEnable: boolean;
  isTransactionNewPriceDiscountEnable: boolean;
}

export const getFeatureActionButtonProps = (configManager: IConfigurationManager,
                                            isAllowed: (eventType: string) => boolean,
                                            returnMode: boolean,
                                            i18nLocation: string): IFeatureActionButtonProps => {
  return {
    isSuspendTransactionVisible: isSuspendTransactionVisible(configManager, returnMode),
    isSuspendTransactionEnabled: isSuspendTransactionEnabled(isAllowed),
    isAssignSalespersonItemVisible: isAssignSalespersonItemVisible(configManager),
    isAssignSalespersonItemEnabled: isAssignSalespersonItemEnabled(isAllowed),
    isAssignSalespersonTransactionVisible: isAssignSalespersonTransactionVisible(configManager, returnMode),
    isAssignSalespersonTransactionEnabled: isAssignSalespersonTransactionEnabled(isAllowed),
    ...getTransactionDiscountFeatures(configManager, isAllowed, returnMode),
    isCouponEnabled: isCouponEnabled(isAllowed),
    ...getTransactionDiscountFeatures(configManager, isAllowed, returnMode),
    isMarkGiftReceiptItemVisible: isMarkGiftReceiptItemVisible(configManager),
    isMarkCommentItemVisible: isMarkCommentItemVisible(configManager),
    isMarkItemTaxOverrideVisible: isMarkItemTaxOverrideVisible(configManager),
    isCommentItemEnabled: isCommentItemEnabled(isAllowed),
    isItemTaxOverrideEnabled: isItemTaxOverrideEnabled(isAllowed),
    isMarkGiftReceiptItemEnabled: isMarkGiftReceiptItemEnabled(isAllowed),
    isMarkGiftReceiptTransactionVisible: isMarkGiftReceiptTransactionVisible(configManager, returnMode),
    isMarkGiftReceiptTransactionEnabled: isMarkGiftReceiptTransactionEnabled(isAllowed),
    isGiftCardIssueVisible: isGiftCardIssueVisible(configManager, returnMode),
    isGiftCardIssueEnabled: isGiftCardIssueEnabled(isAllowed, configManager),
    isGiftCertificateIssueVisible: isGiftCertificateIssueVisible(configManager, returnMode),
    isGiftCertificateIssueEnabled: isGiftCertificateIssueEnabled(isAllowed, configManager),
    ...getVoidTransactionFeatures(configManager, isAllowed, returnMode),
    isResumeSaleVisible: isResumeSaleVisible(configManager, returnMode),
    isResumeSaleEnabled: isResumeSaleEnabled(isAllowed),
    isReturnVisible: isReturnVisible(configManager, returnMode),
    isReturnEnabled: isReturnEnabled(isAllowed),
    isExitReturnVisible: isExitReturnVisible(isAllowed, configManager, returnMode),
    isExitReturnEnabled: isExitReturnEnabled(isAllowed),
    ...getItemDiscountFeatures(configManager, isAllowed),
    isVoidItemVisible: isVoidItemVisible(configManager),
    isVoidItemEnabled: isVoidItemEnabled(isAllowed),
    isQuantityChangeVisible: isQuantityChangeVisible(configManager),
    isQuantityChangeEnabled: isQuantityChangeEnabled(isAllowed),
    isQuantityChangeOnReturnEnabled: isQuantityChangeOnReturnEnabled(configManager),
    isPriceChangeVisible: isPriceChangeVisible(configManager),
    isPriceChangeEnabled: isPriceChangeEnabled(isAllowed),
    isTransactionTaxExemptEnabled: isTransactionTaxExemptEnabled(isAllowed),
    isTransactionTaxExemptVisible: isTransactionTaxExemptVisible(configManager, returnMode),
    isTransactionTaxOverrideEnabled: isTransactionTaxOverrideEnabled(isAllowed),
    isTransactionTaxOverrideVisible: isTransactionTaxOverrideVisible(configManager),
    isFastDiscountVisible: isFastDiscountVisible(configManager, returnMode),
    isFastDiscountEnabled: isFastDiscountEnabled(isAllowed),
    isItemTaxExemptVisible: isItemTaxExemptVisible(configManager),
    isItemTaxExemptEnabled: isItemTaxExemptEnabled(isAllowed),
    isReturnReasonChangeVisible: isReturnReasonChangeVisible(configManager),
    isReturnReasonChangeEnabled: isReturnReasonChangeEnabled(isAllowed),
    isNonMerchVisible: isNonMerchVisible(configManager),
    isNonMerchEnabled: isNonMerchEnabled(isAllowed),
    isLotteryVisible: isLotteryVisible(configManager, returnMode, i18nLocation),
    isLotteryEnabled: isLotteryEnabled(isAllowed),
    isItemSubscriptionVisible: isItemSubscriptionVisible(configManager),
    isItemSubscriptionEnabled: isItemSubscriptionEnabled(isAllowed),
    isPreConfiguredDiscountsVisible: isPreConfiguredDiscountsVisible(configManager),
    isPreConfiguredDiscountsEnabled: isPreConfiguredDiscountsEnabled(isAllowed)
  };
};

const isFeatureEnabled = (configManager: IConfigurationManager, eventType: string): boolean => {
  const configuredFeature: IFeatureAccessConfig = getFeatureAccessConfig(configManager, eventType);
  return !configuredFeature || configuredFeature.enabled;
};

const isFeatureConfigPresentAndEnabled = (configManager: IConfigurationManager, eventType: string): boolean => {
  const configuredFeature: IFeatureAccessConfig = getFeatureAccessConfig(configManager, eventType);
  return configuredFeature && configuredFeature.enabled;
};

const isSuspendTransactionVisible = (configManager: IConfigurationManager, returnMode: boolean): boolean => {
  const mixedBasketAllowed = getReturnsBehaviors(configManager).mixedBasketAllowed;
  return isFeatureEnabled(configManager, SUSPEND_TRANSACTION_EVENT) && (!returnMode || !mixedBasketAllowed);
};

const isSuspendTransactionEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(SUSPEND_TRANSACTION_EVENT);
};

const isAssignSalespersonTransactionVisible = (configManager: IConfigurationManager, returnMode: boolean): boolean => {
  return isFeatureEnabled(configManager, SALESPERSON_ASSOCIATION_EVENT) &&
         isFeatureEnabled(configManager, SALESPERSON_TRANSACTION_ASSOCIATION_EVENT) &&
         !returnMode;
};

const isAssignSalespersonTransactionEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(SALESPERSON_ASSOCIATION_EVENT) &&
      isAllowed(SALESPERSON_TRANSACTION_ASSOCIATION_EVENT);
};

const isAssignSalespersonItemVisible = (configManager: IConfigurationManager): boolean => {
  return isFeatureEnabled(configManager, SALESPERSON_ASSOCIATION_EVENT) &&
         isFeatureEnabled(configManager, SALESPERSON_ITEM_ASSOCIATION_EVENT);
};

const isAssignSalespersonItemEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(SALESPERSON_ASSOCIATION_EVENT) && isAllowed(SALESPERSON_ITEM_ASSOCIATION_EVENT);
};

const isCouponEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(APPLY_SINGLE_USE_COUPON_EVENT) || isAllowed(APPLY_COUPON_EVENT);
};

const isGiftCardIssueVisible = (configManager: IConfigurationManager, returnMode: boolean): boolean => {
  //FIXME: need to handle this in a better way as there is no way to disable GC issue through config in
  //FeatureEnabledContextQualifier since GC issue flow doesn't currently use ISSUE_GIFT_CARD_EVENT
  return isFeatureEnabled(configManager, SELL_ITEM_EVENT) &&
      isFeatureEnabled(configManager, ISSUE_GIFT_CARD_EVENT) &&
      !returnMode;
};

const isGiftCardIssueEnabled = (isAllowed: (eventType: string) => boolean,
                                configManager: IConfigurationManager): boolean => {
  //FIXME: need to handle this in a better way as there is no way to disable GC issue through config in
  //FeatureEnabledContextQualifier since GC issue flow doesn't currently use ISSUE_GIFT_CARD_EVENT
  return isAllowed(SELL_ITEM_EVENT) && isFeatureEnabled(configManager, ISSUE_GIFT_CARD_EVENT);
};

const isGiftCertificateIssueVisible = (configManager: IConfigurationManager, returnMode: boolean): boolean => {
  return isFeatureEnabled(configManager, SELL_ITEM_EVENT) &&
      isFeatureEnabled(configManager, ISSUE_GIFT_CERTIFICATE_EVENT) &&
      !returnMode;
};

const isGiftCertificateIssueEnabled = (isAllowed: (eventType: string) => boolean,
                                       configManager: IConfigurationManager): boolean => {
  return isAllowed(SELL_ITEM_EVENT) && isFeatureEnabled(configManager, ISSUE_GIFT_CERTIFICATE_EVENT);
};

const isTransactionDiscountEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(MANUAL_TRANSACTION_DISCOUNT_EVENT);
};

const isMarkGiftReceiptItemVisible = (configManager: IConfigurationManager): boolean => {
  return isFeatureEnabled(configManager, GIFT_RECEIPT_ITEM_EVENT);
};

const isMarkCommentItemVisible = (configManager: IConfigurationManager): boolean => {
  const featureAccessConfig: IFeatureAccessConfig = getFeatureAccessConfig(configManager, COMMENT_ITEM_EVENT);
  return featureAccessConfig && isFeatureEnabled(configManager, COMMENT_ITEM_EVENT);
};

const isMarkItemTaxOverrideVisible = (configManager: IConfigurationManager): boolean => {
  const featureAccessConfig: IFeatureAccessConfig = getFeatureAccessConfig(configManager, ITEM_TAX_OVERRIDE_EVENT);
  return featureAccessConfig && isFeatureEnabled(configManager, ITEM_TAX_OVERRIDE_EVENT);
};

const isMarkGiftReceiptItemEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(GIFT_RECEIPT_ITEM_EVENT);
};

const isCommentItemEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(COMMENT_ITEM_EVENT);
};

const isItemTaxOverrideEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(ITEM_TAX_OVERRIDE_EVENT);
};

const isMarkGiftReceiptTransactionVisible = (configManager: IConfigurationManager, returnMode: boolean): boolean => {
  return isFeatureEnabled(configManager, GIFT_RECEIPT_TRANSACTION_EVENT) && !returnMode;
};

const isMarkGiftReceiptTransactionEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(GIFT_RECEIPT_TRANSACTION_EVENT);
};

const isVoidTransactionEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(VOID_TRANSACTION_EVENT);
};

const getVoidTransactionFeatures = (configManager: IConfigurationManager, isAllowed: (eventType: string) => boolean,
                                    returnMode: boolean): IVoidTransactionFeatureActionsProps => {
  const featureAccessConfig: IFeatureAccessConfig = getFeatureAccessConfig(configManager, VOID_TRANSACTION_EVENT);
  return {
    isVoidTransactionVisible: !featureAccessConfig || featureAccessConfig.enabled,
    voidTransactionReasonListType: featureAccessConfig && featureAccessConfig.reasonCodeListType,
    isVoidTransactionEnabled: isVoidTransactionEnabled(isAllowed)
  };
};

const getItemDiscountFeatures = (configManager: IConfigurationManager, isAllowed: (eventType: string) => boolean
                                ): IItemDiscountFeatureActionsProps => {
  const manualItemDiscountFeatureConfig: IFeatureAccessConfig =
      getFeatureAccessConfig(configManager, MANUAL_ITEM_DISCOUNT_EVENT);
  return {
    isItemDiscountVisible: !manualItemDiscountFeatureConfig || manualItemDiscountFeatureConfig.enabled,
    isItemDiscountEnabled: isItemDiscountEnabled(isAllowed),
    isItemCouponDiscountEnable: isAllowedDiscountType(manualItemDiscountFeatureConfig,
        AllowedDiscountTypes.coupon),
    isItemReasonCodeDiscountEnable: isAllowedDiscountType(manualItemDiscountFeatureConfig,
        AllowedDiscountTypes.reasonCode),
    isItemEmployeeDiscountEnable: isAllowedDiscountType(manualItemDiscountFeatureConfig,
        AllowedDiscountTypes.employee),
    isItemNewPriceDiscountEnable: isAllowedDiscountType(manualItemDiscountFeatureConfig,
        AllowedDiscountTypes.newPrice),
    isCompetitivePriceDiscountEnabled: isAllowedDiscountType(manualItemDiscountFeatureConfig,
        AllowedDiscountTypes.competitivePrice)
  };
};

const getTransactionDiscountFeatures = (configManager: IConfigurationManager, isAllowed: (eventType: string) => boolean,
                                        returnMode: boolean): ITransactionDiscountFeatureActionsProps => {
    const manualTransactionDiscountFeatureConfig: IFeatureAccessConfig = getFeatureAccessConfig(configManager,
        MANUAL_TRANSACTION_DISCOUNT_EVENT);
    return {
      isTransactionDiscountEnabled: isTransactionDiscountEnabled(isAllowed),
      isTransactionDiscountVisible: !manualTransactionDiscountFeatureConfig ||
          manualTransactionDiscountFeatureConfig.enabled && !returnMode,
      isTransactionCouponDiscountEnable: isAllowedDiscountType(manualTransactionDiscountFeatureConfig,
          AllowedDiscountTypes.coupon),
      isTransactionReasonCodeDiscountEnable: isAllowedDiscountType(manualTransactionDiscountFeatureConfig,
          AllowedDiscountTypes.reasonCode),
      isTransactionEmployeeDiscountEnable: isAllowedDiscountType(manualTransactionDiscountFeatureConfig,
          AllowedDiscountTypes.employee),
      isTransactionNewPriceDiscountEnable: false
    };
  };

const isAllowedDiscountType = (featureAccessConfig: IFeatureAccessConfig,
                               discountType: AllowedDiscountTypes): boolean => {
  return !featureAccessConfig || (featureAccessConfig.allowedDiscountTypes &&
      featureAccessConfig.allowedDiscountTypes.findIndex((item) => item ===  discountType) >= 0);
};

const isResumeSaleVisible = (configManager: IConfigurationManager, returnMode: boolean): boolean => {
  return isFeatureEnabled(configManager, TRANSACTION_RESUME_EVENT);
};

const isResumeSaleEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(TRANSACTION_RESUME_EVENT);
};

const isReturnVisible = (configManager: IConfigurationManager, returnMode: boolean): boolean => {
  return isFeatureEnabled(configManager, ENTER_RETURN_MODE_EVENT) && !returnMode;
};

const isReturnEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(ENTER_RETURN_MODE_EVENT);
};

const isExitReturnVisible = (isAllowed: (eventType: string) => boolean,
                             configManager: IConfigurationManager, returnMode: boolean): boolean => {
  return isFeatureEnabled(configManager, EXIT_RETURN_MODE_EVENT) && returnMode;
};

const isExitReturnEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(EXIT_RETURN_MODE_EVENT);
};

const isItemDiscountEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(MANUAL_ITEM_DISCOUNT_EVENT);
};

const isTransactionTaxExemptVisible = (configManager: IConfigurationManager, returnMode: boolean): boolean => {
  return isFeatureEnabled(configManager, TRANSACTION_TAX_EXEMPT_EVENT) && !returnMode;
};

const isTransactionTaxExemptEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(TRANSACTION_TAX_EXEMPT_EVENT);
};

const isTransactionTaxOverrideVisible = (configManager: IConfigurationManager): boolean => {
  return isFeatureConfigPresentAndEnabled(configManager, TRANSACTION_TAX_OVERRIDE_EVENT);
};

const isTransactionTaxOverrideEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(TRANSACTION_TAX_OVERRIDE_EVENT);
};

const isVoidItemVisible = (configManager: IConfigurationManager): boolean => {
  return isFeatureEnabled(configManager, VOID_ITEM_LINE_EVENT);
};

const isVoidItemEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(VOID_ITEM_LINE_EVENT);
};

const isQuantityChangeVisible = (configManager: IConfigurationManager): boolean => {
  return isFeatureEnabled(configManager, QUANTITY_CHANGE_EVENT);
};

const isQuantityChangeEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(QUANTITY_CHANGE_EVENT);
};

const isQuantityChangeOnReturnEnabled = (configManager: IConfigurationManager): boolean => {
  const configuredFeature: IFeatureAccessConfig = getFeatureAccessConfig(configManager, QUANTITY_CHANGE_EVENT);
  return configuredFeature && configuredFeature.enabled && configuredFeature.allowedOnReturn;
};

const isPriceChangeVisible = (configManager: IConfigurationManager): boolean => {
  return isFeatureEnabled(configManager, PRICE_CHANGE_EVENT);
};

const isPriceChangeEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(PRICE_CHANGE_EVENT);
};

const isFastDiscountVisible = (configManager: IConfigurationManager, returnMode: boolean): boolean => {
  return isFeatureConfigPresentAndEnabled(configManager, FAST_DISCOUNT_EVENT) && !returnMode;
};

const isFastDiscountEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(FAST_DISCOUNT_EVENT);
};

const isItemTaxExemptVisible = (configManager: IConfigurationManager): boolean => {
  return isFeatureConfigPresentAndEnabled(configManager, ITEM_TAX_EXEMPT_EVENT);
};

const isItemTaxExemptEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(ITEM_TAX_EXEMPT_EVENT);
};

const isReturnReasonChangeVisible = (configManager: IConfigurationManager): boolean => {
  return isFeatureConfigPresentAndEnabled(configManager, MODIFY_RETURN_ITEM_REASON_CODE_EVENT);
};

const isReturnReasonChangeEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(MODIFY_RETURN_ITEM_REASON_CODE_EVENT);
};

const isNonMerchVisible = (configManager: IConfigurationManager): boolean => {
  return isFeatureConfigPresentAndEnabled(configManager, SEARCH_NON_MERCH_ITEMS_EVENT);
};

const isNonMerchEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(SEARCH_NON_MERCH_ITEMS_EVENT);
};

const isLotteryVisible = (configManager: IConfigurationManager, returnMode: boolean, i18nLocation: string): boolean => {
  return isFeatureConfigPresentAndEnabled(configManager, CAPTURE_LOTTERY_CODE_EVENT) &&
      isUserInputTaxLotteryEnabled(configManager, i18nLocation) && !returnMode;
};

const isLotteryEnabled = (isAllowed: (eventType: string) => boolean): boolean => {
  return isAllowed(CAPTURE_LOTTERY_CODE_EVENT);
};

const isItemSubscriptionVisible = (configManager: IConfigurationManager): boolean => {
  return isFeatureConfigPresentAndEnabled(configManager, APPLY_ITEM_SUBSCRIPTION_EVENT);
};

const isItemSubscriptionEnabled = (isAllowed: (eventType: string) => boolean) => {
  return isAllowed(APPLY_ITEM_SUBSCRIPTION_EVENT);
};

const isPreConfiguredDiscountsVisible = (configManager: IConfigurationManager): boolean => {
  return isFeatureConfigPresentAndEnabled(configManager, APPLY_DISCOUNT_EVENT);
};

const isPreConfiguredDiscountsEnabled = (isAllowed: (eventType: string) => boolean) => {
  return isAllowed(APPLY_DISCOUNT_EVENT);
};

