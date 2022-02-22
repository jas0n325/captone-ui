import { Money } from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";

import I18n from "../../../../config/I18n";


export function getUnitAmount(configurationManager: IConfigurationManager, currencyFromProps: string): Money {
  const bagFeesConfig = getBagFeesConfig(configurationManager);
  const unitAmount = bagFeesConfig ? bagFeesConfig.unitAmount : undefined;
  const unitAmountValue = unitAmount ? unitAmount.amount : undefined;
  const currency = unitAmount ? unitAmount.currency : currencyFromProps;
  return unitAmountValue && currency ? new Money(unitAmountValue, currency) : undefined;
}

export function getAcceptanceText(configurationManager: IConfigurationManager): Money {
  const bagFeesConfig = getBagFeesConfig(configurationManager);
  const acceptanceTextTranslations = bagFeesConfig && bagFeesConfig.acceptanceText;
  const acceptanceText =  acceptanceTextTranslations ? acceptanceTextTranslations[I18n.currentLocale()] : undefined;
  return acceptanceText;
}

export function getBagFeesConfig(configurationManager: IConfigurationManager): any {
  const feesConfig = configurationManager.getFeesValues();
  const bagFeesConfig = feesConfig && feesConfig.feeDefinitionTypes ? feesConfig.feeDefinitionTypes.Bag : undefined;
  return bagFeesConfig;
}

