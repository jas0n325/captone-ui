import { Money } from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager, UIINPUT_SOURCE_BARCODE, UIINPUT_SOURCE_KEYBOARD } from "@aptos-scp/scp-component-store-selling-core";
import { ReceiptState, TenderAuthCategory, TenderAuthorizationState, Usage } from "@aptos-scp/scp-component-store-selling-features";

import { BusinessState, UiState, UI_MODE_WAITING_TO_CLOSE } from "../../reducers";
import { ITenderType } from "../payment/PaymentDevicesUtils";


interface Props {
  businessState: BusinessState;
  uiState: UiState;
}

export function shouldCallReceiptSummary(currentProps: Props, nextProps: Props): boolean {
  const giftCardIssueInProgress = currentProps.businessState.stateValues.get("TenderAuthorizationSession.state") ===
          TenderAuthorizationState.GiftCardIssueInProgress;
  if (giftCardIssueInProgress || currentProps.uiState.mode === UI_MODE_WAITING_TO_CLOSE) {
    return nextProps.businessState.stateValues.get("ReceiptSession.state") === ReceiptState.WaitingForOptions;
  }
  return true;

}

export function getMinimumIssueAmount(configurationManager: IConfigurationManager): Money {
  const giftCardIssuingPolicies = getGiftCardIssuingPolicies(configurationManager);
  const minimumIssueAmount = giftCardIssuingPolicies && giftCardIssuingPolicies.minimumIssueAmount;
  const minimumIssueAmountValue = minimumIssueAmount ? minimumIssueAmount.amount : undefined;
  const currency = minimumIssueAmount ? minimumIssueAmount.currency : undefined;
  return minimumIssueAmountValue && currency ? new Money(minimumIssueAmountValue, currency) : undefined;
 }

export function getMaximumIssueAmount(configurationManager: IConfigurationManager): Money {
  const giftCardIssuingPolicies = getGiftCardIssuingPolicies(configurationManager);
  const maximumIssueAmount = giftCardIssuingPolicies && giftCardIssuingPolicies.maximumIssueAmount;
  const maximumIssueAmountValue = maximumIssueAmount ? maximumIssueAmount.amount : undefined;
  const currency = maximumIssueAmount ? maximumIssueAmount.currency : undefined;
  return maximumIssueAmountValue && currency ? new Money(maximumIssueAmountValue, currency) : undefined;
}

export function getQuickChoiceAmounts(configurationManager: IConfigurationManager): Money[] {
  const giftCardIssuingPolicies = getGiftCardIssuingPolicies(configurationManager);
  const quickChoiceAmounts = (giftCardIssuingPolicies && giftCardIssuingPolicies.quickChoiceAmounts);
  return quickChoiceAmounts;
}

export function getCurrency(configurationManager: IConfigurationManager): string {
  const giftCardIssuingPolicies = getGiftCardIssuingPolicies(configurationManager);
  const minimumIssueAmountCurrency = giftCardIssuingPolicies && giftCardIssuingPolicies.minimumIssueAmount ?
      giftCardIssuingPolicies.minimumIssueAmount.currency : undefined;
  const maximumIssueAmountCurrency = giftCardIssuingPolicies &&  giftCardIssuingPolicies.maximumIssueAmount ?
      giftCardIssuingPolicies.maximumIssueAmount.currency : undefined;
  return minimumIssueAmountCurrency || maximumIssueAmountCurrency;
}

export function giftCardIssueIdAvailable(configurationManager: IConfigurationManager): boolean {
  const giftCardIssuingPolicies = getGiftCardIssuingPolicies(configurationManager);
  return !!(giftCardIssuingPolicies && giftCardIssuingPolicies.itemId);
}

function getGiftCardIssuingPolicies(configurationManager: IConfigurationManager): any {
  const functionalBehavior = configurationManager && configurationManager.getFunctionalBehaviorValues();
  return functionalBehavior && functionalBehavior.giftCardIssuingPolicies ?
      functionalBehavior.giftCardIssuingPolicies : undefined ;
}

export function getPinUsage(props: any): string {
  const inputSource: string = props && props.uiInputSource;
  let pinUsage: string = props.pinRules ? Usage.NotUsed : Usage.Optional;
  const redeemRules = props && props.pinRules && props.pinRules["redeem"];
  if (redeemRules) {
    if (inputSource) {
      pinUsage = redeemRules[inputSource] && redeemRules[inputSource].usage ? redeemRules[inputSource].usage : pinUsage;
    } else {
      if (redeemRules[UIINPUT_SOURCE_KEYBOARD] && (redeemRules[UIINPUT_SOURCE_KEYBOARD].usage === Usage.Optional ||
          redeemRules[UIINPUT_SOURCE_KEYBOARD].usage === Usage.Required)) {
        pinUsage = redeemRules[UIINPUT_SOURCE_KEYBOARD].usage;
      } else if (redeemRules[UIINPUT_SOURCE_BARCODE] && (redeemRules[UIINPUT_SOURCE_BARCODE].usage === Usage.Optional ||
          redeemRules[UIINPUT_SOURCE_BARCODE].usage === Usage.Required)) {
        pinUsage = redeemRules[UIINPUT_SOURCE_BARCODE].usage;
      }
    }
  }
  return pinUsage;
}

export function getActiveGiftTender(activeTenders: ITenderType[]): ITenderType {
  //get first gift tender with pin rules, if no pin rules are configured, get first gift tender
  return activeTenders.find((aTender) => {
    return isGiftCategory(aTender.tenderAuthCategory) && aTender.pinRules !== undefined;
  }) || activeTenders.find((aTender) => isGiftCategory(aTender.tenderAuthCategory));
}


export function isGiftCategory(tenderAuthCategory: TenderAuthCategory): boolean {
  return tenderAuthCategory === TenderAuthCategory.GiftDevice ||
      tenderAuthCategory === TenderAuthCategory.StoredValueCardService;
}
