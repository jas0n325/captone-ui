import { Money, RoundingRule } from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  getRoundedBalanceDueByTender,
  TenderDenominationRoundings
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { printAmount } from "./itemLineUtils";

export interface ValidationChanges {
  isTenderInput: boolean;
  invalidAmountMessage: string;
}

export function getDenominationRoundings(configuration: IConfigurationManager,
                                         balanceDue: Money): TenderDenominationRoundings[] {
  try {
    return getRoundedBalanceDueByTender(configuration, balanceDue);
  } catch (error) {
    return undefined;
  }
}

export function getValidatedRoundedPrice(configurationManager: IConfigurationManager,
                                       tenderId: string,
                                       tenderAmounts: string,
                                       currency: string,
                                       roundedAmount?: Money,
                                       foreignTenderAmount?: Money): ValidationChanges {
  const tenderValuesDefinitions = configurationManager
    && configurationManager.getTendersValues().tenderDefinitions;
  const tenderData = tenderValuesDefinitions
    && tenderValuesDefinitions.find((tender: any) => tender.tenderId === tenderId);
  let isTenderInput: boolean;
  let invalidAmountMessage: string;
  if (roundedAmount) {
    isTenderInput = false;
  } else if (tenderData && tenderData.minimumDenomination && !Number.isNaN(tenderData.minimumDenomination.value)
  && Number(tenderData.minimumDenomination.value)) {
    const tenderAmount = tenderData?.isForeignTender && foreignTenderAmount ?
        foreignTenderAmount : new Money(tenderAmounts, currency);
    if (tenderAmount.mod(tenderData.minimumDenomination.value).isZero()) {
      isTenderInput = false;
    } else {
      isTenderInput = true;
      invalidAmountMessage = `${I18n.t("invalidBalanceDue")}: ${printAmount(tenderAmount.roundToDenomination
          (Number(tenderData.minimumDenomination.value), tenderData.minimumDenomination.roundingRule))}`;
    }
  } else {
    isTenderInput = false;
  }
  return { isTenderInput, invalidAmountMessage };
}

export interface MinimumDenomination {
  minimumValue: number;
  roundingRule: RoundingRule;
}

export function getCurrencyMinimumDenomination(configurationManager: IConfigurationManager, currency: string,
  i18nLocation: string)
    : MinimumDenomination {
  const minimumValue = configurationManager &&
      configurationManager.getI18nCurrencyDenomination()[currency].minimumValue;
  if (minimumValue) {
    const i18nCountryConfigValues = configurationManager.getI18nCountryConfigValues(i18nLocation);
    const roundingRule = i18nCountryConfigValues && i18nCountryConfigValues.roundingRules &&
        i18nCountryConfigValues.roundingRules.itemLines;
    return { minimumValue, roundingRule };
  }

  return undefined;
}

export function isValidCurrencyMinimumValue(amount: string, currency: string, minimumValue: number): boolean {
  if (minimumValue && !Number.isNaN(minimumValue) && !Number.isNaN(Number(amount))) {
    const currencyAmount = new Money(amount, currency);
    if (!currencyAmount.mod(minimumValue).isZero()) {
      return false;
    }
  }

  return true;
}

export function getRoundedAmount(amount: string, currency: string, minimumValue: number,
                                 roundingRule?: RoundingRule): string {
  return printAmount(new Money(amount, currency).roundToDenomination(minimumValue, roundingRule));
}
