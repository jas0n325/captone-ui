import {IConfigurationManager} from "@aptos-scp/scp-component-store-selling-core";

export interface I18nDisplayText {
  i18nCode: string, default: string
}

export const enum ScreenAction {
  main = "main",
  resumeSuspendedTransactions = "resumeSuspendedTransactions",
  customer = "customer",
  productInquiry = "productInquiry",
  orderInquiry = "orderInquiry",
  salesHistory = "salesHistory",
  balanceInquiry = "balanceInquiry",
  storeOperations = "storeOperations"
}
export interface ILandingPageMainButton {
  displayText: I18nDisplayText;
}

export interface ILandingPageMainButtonWithEnabled extends ILandingPageMainButton {
  enabled: boolean
}

export interface ILandingPageButton extends ILandingPageMainButton {
  screenAction: string;
  imageName?: string;
}

export interface ILandingPageMainButtons {
  startBasket: ILandingPageMainButton,
  resume: ILandingPageMainButtonWithEnabled
}

export interface ILandingPageBehaviors {
  enabled: boolean;
  landingPageMainButtons: ILandingPageMainButtons;
  landingPageButtonRows: ILandingPageButton[];
  message: I18nDisplayText;
}

export function getLandingDefinition(configManager: IConfigurationManager): ILandingPageBehaviors {
  const landingPageBehaviors = configManager.getFunctionalBehaviorValues().landingPageBehaviors;
  if (landingPageBehaviors && landingPageBehaviors.enabled) {
    return landingPageBehaviors;
  }
  return undefined;
}

export function isLandingVisible(configManager: IConfigurationManager): boolean {
  return !!getLandingDefinition(configManager);
}
