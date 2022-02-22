import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";
import { DeliveryFrequency } from "@aptos-scp/scp-types-store-items";

const SUBSCRIPTION_FIELD_PREFIX: string = "subscribedTo_";
const QUANTITY_FIELD_PREFIX: string = "quantity_";
const FREQUENCY_FIELD_PREFIX: string = "frequency_";

export const getSubscribedFieldName = (lineNumber: number): string => `${SUBSCRIPTION_FIELD_PREFIX}${lineNumber}`;

export const getQuantityFieldName = (lineNumber: number): string => `${QUANTITY_FIELD_PREFIX}${lineNumber}`;

export const getFrequencyFieldName = (lineNumber: number): string => `${FREQUENCY_FIELD_PREFIX}${lineNumber}`;

export const hasFrequencyCodesFromLine = (line: IItemDisplayLine, dataFrequencies: DeliveryFrequency[]): boolean => {
  const hasLineCodes: boolean = dataFrequencies?.some(
      (dataFrequency) => line?.subscriptionFrequencyCodes?.some((code) => code === dataFrequency.code));
  return hasLineCodes;
}
