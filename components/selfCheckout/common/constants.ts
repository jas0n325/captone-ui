import {
  SSF_CUSTOMER_API_ERROR_I18N_CODE,
  SSF_ITEM_API_ERROR_I18N_CODE,
  SSF_ITEM_HARD_STOP_I18N_CODE,
  SSF_ITEM_NOT_FOUND_I18N_CODE,
  SSF_ITEM_SOFT_STOP_I18N_CODE,
  SSF_ITEM_ZERO_PRICED_I18N_CODE,
  SSF_MEMBER_NOT_ALLOWED_I18N_CODE,
  SSF_SECURITY_ROLE_MISSING_I18N_CODE,
  SSF_SUPERVISOR_INVALID_CREDENTIAL_I18N_CODE,
  SSF_SUPERVISOR_QUALIFICATION_ERROR_I18N_CODE
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { ISCOUserMessage } from "./interfaces";


export enum SCOScreenKeys {
  BagFee = "BagFee",
  Member = "Member",
  Payment = "Payment",
  PaymentSummary = "PaymentSummary",
  ShoppingBag = "ShoppingBag",
  Start = "Start",
  ThankYou = "ThankYou"
}

export interface SCOScreenProps {
  navigateToNextScreen: (newScoScreen: SCOScreenKeys) => void;
}

export interface CustomMessagesConfig {
  [i18nCode: string]: {
    [locale: string]: string
  };
}

// Qualification errors not caught by the init screen
export function getExpectedUncaughtErrorsMap(customMessages: CustomMessagesConfig): Map<string, ISCOUserMessage> {
  const currentLocale: string = I18n.currentLocale();

  return new Map<string, ISCOUserMessage>([
    [SSF_ITEM_API_ERROR_I18N_CODE,
        {
          title: I18n.t("itemApiError"),
          text: [ I18n.t("tryAgain") ],
          isDismissible: true
        }],
    [SSF_ITEM_NOT_FOUND_I18N_CODE,
        {
          title: customMessages.itemNotFoundTitleSCO && customMessages.itemNotFoundTitleSCO[currentLocale] ||
              I18n.t("itemNotFoundTitleSCO"),
          text: [
            customMessages.itemNotFoundSubtitleSCO && customMessages.itemNotFoundSubtitleSCO[currentLocale] ||
                I18n.t("itemNotFoundSubtitleSCO"),
            customMessages.itemNotFoundHelpLineSCO && customMessages.itemNotFoundHelpLineSCO[currentLocale] ||
                I18n.t("itemNotFoundHelpLineSCO")
          ],
          isDismissible: true
        }],
    [SSF_ITEM_ZERO_PRICED_I18N_CODE,
        {
          title: I18n.t("helpIsOnTheWay"),
          text: [  I18n.t("aStaffMemberWillBeWithYouShortly") ],
          isDismissible: false
        }],
    [SSF_CUSTOMER_API_ERROR_I18N_CODE,
        {
          title: I18n.t("customerApiError"),
          text: [ I18n.t("tryAgain") ],
          isDismissible: true
        }],
    [SSF_SECURITY_ROLE_MISSING_I18N_CODE,
        {
          title: I18n.t("securityRoleMissing"),
          text: [ I18n.t("tryAgain") ],
          isDismissible: true
        }],
    [SSF_SUPERVISOR_INVALID_CREDENTIAL_I18N_CODE,
        {
          title: I18n.t("invalidCredentials"),
          text: [ I18n.t("tryAgain") ],
          isDismissible: true
        }],
    [SSF_SUPERVISOR_QUALIFICATION_ERROR_I18N_CODE,
        {
          title: I18n.t("placeholderError"),
          text: [ I18n.t("supervisorQualification") ],
          isDismissible: true
        }],
    [SSF_ITEM_HARD_STOP_I18N_CODE,
        {
          title: I18n.t("helpIsOnTheWay"),
          text: [  I18n.t("aStaffMemberWillBeWithYouShortly") ],
          isDismissible: false
        }],
    [SSF_ITEM_SOFT_STOP_I18N_CODE,
        {
          title: I18n.t("helpIsOnTheWay"),
          text: [ I18n.t("aStaffMemberWillBeWithYouShortly") ],
          isDismissible: false
        }],
    [SSF_MEMBER_NOT_ALLOWED_I18N_CODE,
        {
          title: I18n.t("membershipNotRegistered"),
          text: [ I18n.t("notInMembershipStep") ],
          isDismissible: true
        }]
  ]);
}

export const inTransaction = (stateValues: Map<string, any>): boolean => {
  return stateValues && stateValues.get("transaction.id") && !stateValues.get("transaction.closed");
};
