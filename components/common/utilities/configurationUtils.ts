import * as _ from "lodash";

import { IConfigurationManager, IConfigurationValues } from "@aptos-scp/scp-component-store-selling-core";
import {
  AllowedDiscountTypes, IDiscountDefinition, IFeatureAccessConfig, ILabel
} from "@aptos-scp/scp-component-store-selling-features";
import {
  FieldConfiguration, TransactionProperty
} from "@aptos-scp/scp-component-store-selling-features/lib/domain/service/ConfiguredStringFormatter";
import { PrinterType } from "@aptos-scp/scp-types-commerce-devices";

import { ReceiptPrinter } from "../../../actions";
import { IFiscalPrinterTypeAndDataCheck } from "../../fiscalPrinter/interface";
import { compareRenderSelectOptions, RenderSelectOptions } from "../FieldValidation";


export function getFeatureAccessConfig(configurationManager: IConfigurationManager,
                                       eventType: string): IFeatureAccessConfig {
  const configuredFeatures: Array<IFeatureAccessConfig> = configurationManager &&
      configurationManager.getFeaturesValues() as Array<IFeatureAccessConfig>;
  return configuredFeatures.find((item: IFeatureAccessConfig) => item.uiBusinessEventType === eventType);
}

export function getReasonListType(configurationManager: IConfigurationManager, eventType: string): string {
  const featureAccessConfig: IFeatureAccessConfig = getFeatureAccessConfig(configurationManager,
      eventType);
  return featureAccessConfig && featureAccessConfig.reasonCodeListType;
}

export function getReasonOptions(configurationManager: IConfigurationManager,
                                 reasonListType: string): RenderSelectOptions[] {
  const reasonCodeListsForType = configurationManager.getReasonCodesValues()
      .reasonCodeLists[reasonListType];
  const reasonCodes = reasonCodeListsForType && reasonCodeListsForType.reasonCodeDefinitions;
  return reasonCodes && Object.keys(reasonCodes)
      .map((aReasonCode: string): RenderSelectOptions => {
        return {
          code: aReasonCode,
          description: reasonCodes[aReasonCode].name
        };
      })
      .sort((reason1, reason2): number => {
        return compareRenderSelectOptions(reason1, reason2);
      });
}

export function isItemSearchBehaviorsIsNumeric(configurationManager: IConfigurationManager): boolean {
  const functionalBehaviorsConfig = configurationManager &&
      configurationManager.getFunctionalBehaviorValues();
  return functionalBehaviorsConfig && functionalBehaviorsConfig.itemSearchBehaviors &&
      functionalBehaviorsConfig.itemSearchBehaviors.isNumeric;
}

export function isCustomerRequiredForReturns(configurationManager: IConfigurationManager): boolean {
  const customerFunctionChoices = configurationManager && configurationManager.getFunctionalBehaviorValues() &&
      configurationManager.getFunctionalBehaviorValues().customerFunctionChoices;
  const customerRequiredForReturns: boolean = customerFunctionChoices &&
      customerFunctionChoices.customerRequiredForReturns;
  return customerRequiredForReturns;
}

export function getMaximumAllowedFieldLength(configurationManager: IConfigurationManager): number {
  const functionalBehaviorsConfig = configurationManager && configurationManager.getFunctionalBehaviorValues();
  return functionalBehaviorsConfig.manualPriceEntryBehaviors &&
      functionalBehaviorsConfig.manualPriceEntryBehaviors.maximumAllowedFieldLength || 6;
}

/**
 * Gets the returnsBehaviors from the functionalBehaviorValues of the configuration manager
 * @param {IConfigurationManager} configurationManager
 * @returns {any}  The returnsBehaviors, or an empty object if that configuration is not present
 */
export function getReturnsBehaviors(configurationManager: IConfigurationManager): any {
  const functionalBehaviorValues = configurationManager && configurationManager.getFunctionalBehaviorValues();
  return (functionalBehaviorValues && functionalBehaviorValues.returnsBehaviors) || {};
}

export function getItemAttributeDisplayOrderConfig(configurationManager: IConfigurationManager): Set<string> {
  const displayBehaviorsConfig =
      configurationManager.getFunctionalBehaviorValues().productDetailDisplayBehaviors;
  const displayItemAttributes = (displayBehaviorsConfig && displayBehaviorsConfig.itemAttributes)
      ? displayBehaviorsConfig.itemAttributes : undefined;
  const defaultDisplayOrder = ["Color", "Size", "Season"];
  return (displayItemAttributes && displayItemAttributes.displayOrder &&
    displayItemAttributes.displayOrder.length > 0
    ? new Set([...displayItemAttributes.displayOrder, ...defaultDisplayOrder])
    : new Set(defaultDisplayOrder)
  );
}

export function isTransactionReferenceNumber(value: string, configurationManager: IConfigurationManager): boolean {
  let isReferenceNumber = true;
  let length = 0;
  const {
    prefix = "", suffix = "", fieldList = []
  } = configurationManager.getFunctionalBehaviorValues().transactionReferenceNumberFormat;
  length += (prefix.length + suffix.length);

  if (!(value.startsWith(prefix) && value.endsWith(suffix))) {
    isReferenceNumber = false;
  } else if (fieldList.length) {
    fieldList.forEach((fieldConfig: FieldConfiguration) => {
      switch (fieldConfig.transactionProperty) {
        case TransactionProperty.businessDayDate:
        case TransactionProperty.nowDateTime:
        case TransactionProperty.startDateTime:
          length += fieldConfig.dateFormat.length;
          break;
        default:
          if (fieldConfig.fieldLength) {
            length += fieldConfig.fieldLength;
          }
          break;
      }
    });
  }
  if (value.length < length) {
    isReferenceNumber = false;
  }
  return isReferenceNumber;
}

export function getReceiptDestinationChoices(configurationManager: IConfigurationManager): any {
  return configurationManager.getFunctionalBehaviorValues().receipt.destinationChoices;
}

export function getPrinterData(configurationManager: IConfigurationManager): IFiscalPrinterTypeAndDataCheck {
  let printerType: string = undefined;
  let id: string = undefined;
  const printerDefinitions = configurationManager.getPeripheralsValues().printerType.deviceDefinitions;
  if (printerDefinitions && printerDefinitions.length) {
     printerDefinitions.forEach((element: any) => {
      if (this.isFiscalPinter(element)) {
        printerType = element.printerType ? element.printerType : undefined ;
        id = element.id ? element.id : undefined ;
      }
     });
  }
  if (_.isEmpty(id) || _.isNil(id)) {
    id = undefined;
  }
  const printerData: IFiscalPrinterTypeAndDataCheck = {printerType, id};
  return printerData;
}

export function isFiscalPinter(element: any): boolean {
  let isFiscalPrinter = false;
  if (element && element.printerType === PrinterType.Fiscal) {
    isFiscalPrinter = true;
  }
  return isFiscalPrinter;
}

export function displayTenderRoundingAdjustment(configurationManager: IConfigurationManager): boolean {
  const receiptFormattingValues = configurationManager && configurationManager.getReceiptFormattingValues();
  return receiptFormattingValues && receiptFormattingValues.displayTenderRoundingAdjustment;
}

export function displayReturnValue(configurationManager: IConfigurationManager): boolean {
  const itemDisplayBehaviors = configurationManager && configurationManager.getFunctionalBehaviorValues() &&
      configurationManager.getFunctionalBehaviorValues().itemDisplayBehaviors;
  return itemDisplayBehaviors && itemDisplayBehaviors.displayReturnValue;
}

export function getFiscalPrinterList(configuredPrinters: ReceiptPrinter[]): ReceiptPrinter[] {
  return configuredPrinters.filter((printer: ReceiptPrinter) => printer.printerType === PrinterType.Fiscal);
}

export enum ReturnWithTransactionQuantityChangeMode {
  ManualEntry = "ManualEntry",
  SelectLine = "SelectLine"
}

export function getReturnWithTransactionQuantityChangeMode(
  configManager: IConfigurationManager
): ReturnWithTransactionQuantityChangeMode {
  const functionalBehaviorValues = configManager.getFunctionalBehaviorValues();
  const returnsBehaviors = functionalBehaviorValues && functionalBehaviorValues.returnsBehaviors;
  const returnWithTransactionBehaviors = returnsBehaviors && returnsBehaviors.returnWithTransactionBehaviors;
  const quantityChangeMode = returnWithTransactionBehaviors && returnWithTransactionBehaviors.quantityChangeMode;

  // Default to ManualEntry, to match how the feature was originally written.
  return quantityChangeMode || ReturnWithTransactionQuantityChangeMode.ManualEntry;
}

export function promptForCustomerAfterTransactionReceipts(configurationManager: IConfigurationManager): boolean {
  return configurationManager.getFunctionalBehaviorValues()?.customerFunctionChoices?.
      promptForCustomerAfterTransactionReceipts;
}

export function getConfiguredEmployeeDiscountDisplayText(featureConfig: IFeatureAccessConfig, discountsConfig: IConfigurationValues): ILabel {
  const discountDefinition: IDiscountDefinition = this.getDiscountDefinition(featureConfig, discountsConfig);
  const displayText = discountDefinition && discountDefinition.displayText;
  return displayText;
}

export function getDiscountDefinition(featureConfig: IFeatureAccessConfig, discountsConfig: IConfigurationValues): IDiscountDefinition {
  if (featureConfig && featureConfig.discountDefinitionKey){
    const discountDefinitionKey = featureConfig.discountDefinitionKey[AllowedDiscountTypes.employee];
    if (!_.isEmpty(discountDefinitionKey)) {
      const discountDefinitions: IDiscountDefinition = discountsConfig && discountsConfig.discountDefinitions &&
          discountsConfig.discountDefinitions[discountDefinitionKey];
      return discountDefinitions;
    }
  }
}
