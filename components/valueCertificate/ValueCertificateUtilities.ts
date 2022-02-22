import { IConfigurationManager, IConfigurationValues } from "@aptos-scp/scp-component-store-selling-core";


export function giftCertificateIssueIdAvailable(configurationManager: IConfigurationManager): boolean {
  const giftCertificateIssuingPolicies = getGiftCertificateIssuingPolicies(configurationManager);
  return !!(giftCertificateIssuingPolicies?.itemId);
}

export function getMinimumIssueAmount(configurationManager: IConfigurationManager): string {
  const giftCertificateIssuingPolicies = getGiftCertificateIssuingPolicies(configurationManager);
  return giftCertificateIssuingPolicies?.minimumIssueAmount;
}

export function getMaximumIssueAmount(configurationManager: IConfigurationManager): string {
  const giftCertificateIssuingPolicies = getGiftCertificateIssuingPolicies(configurationManager);
  return giftCertificateIssuingPolicies?.maximumIssueAmount;
}

export function getQuickChoiceAmounts(configurationManager: IConfigurationManager): string[] {
  const giftCertificateIssuingPolicies = getGiftCertificateIssuingPolicies(configurationManager);
  return giftCertificateIssuingPolicies?.quickChoiceAmounts;
}

export function getCashDrawerEnabled(configurationManager: IConfigurationManager): boolean {
  const giftCertificateIssuingPolicies = getGiftCertificateIssuingPolicies(configurationManager);
  return giftCertificateIssuingPolicies?.cashDrawerEnabled;
}

export function isRedeemConfirmationPromptEnabled(configurationManager: IConfigurationManager): boolean {
  const functionalBehaviors: IConfigurationValues = configurationManager?.getFunctionalBehaviorValues();
  return functionalBehaviors?.valueCertificateServiceBehaviors?.certificateInquiry?.enableRedeemConfirmationPrompt;
}

function getGiftCertificateIssuingPolicies(configurationManager: IConfigurationManager): any {
  const functionalBehavior = configurationManager && configurationManager.getFunctionalBehaviorValues();
  return functionalBehavior?.giftCertificateIssuingPolicies;
}

