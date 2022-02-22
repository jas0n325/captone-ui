import { ILogger } from "@aptos-scp/scp-component-logging";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { PhoneCountryCode, PhoneFormatConfig } from "@aptos-scp/scp-component-store-selling-features";
import { ICustomer, IPerson } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";
import { getAdvanceEmailVerification, getCountryFormatUsingCountryCode, loadEmailVerification } from "../../customer/CustomerUtilities";


export async function asyncValidateEmailAddress(values: any, dispatch: any, props: any, logger: ILogger): Promise<any> {
  const {configurationManager, diContainer} = props.settings;
  if (values.emailAddress && getAdvanceEmailVerification(configurationManager)) {
    let response;
    try {
      response = await loadEmailVerification(diContainer, configurationManager, values.emailAddress);
    } catch (error) {
      logger.warn("Error during email verification, bypassing to allow email submission.", error);
    }
    const updatedMessage = configurationManager.getFunctionalBehaviorValues()
        .advancedVerificationBehaviors.advancedEmailVerification;
    if (response === (updatedMessage.invalidWithByPassEmailMessage &&
        updatedMessage.invalidWithByPassEmailMessage[I18n.currentLocale()]
        || I18n.t("invalidWithBypassEmailMessage"))) {
      props.emailVerificationWarningMessage(response);
    } else if (response === (updatedMessage.invalidEmailMessage &&
        updatedMessage.invalidEmailMessage[I18n.currentLocale()] ||
        I18n.t("invalidEmailMessage"))) {
      props.emailVerificationWarningMessage("");
      throw {emailAddress: response};
    } else {
      props.emailVerificationWarningMessage("");
    }
  }
}

export function getCurrentPhoneCountryCode(currentCustomer: ICustomer | IPerson,
  configurationManager: IConfigurationManager,
  i18nLocation: string): PhoneCountryCode {

  const phoneCountryCodesFormats = configurationManager
    .getI18nPhoneFormats() as { [x: string]: PhoneCountryCode };
  const countryCode = (currentCustomer && currentCustomer.phoneCountryCode) ?
    currentCustomer.phoneCountryCode :
    i18nLocation;

  return getCountryFormatUsingCountryCode(phoneCountryCodesFormats,countryCode);
}

interface PhoneErrors {
  phoneNumber: string;
  countryCode: string;
}

export function validatePhoneNumberForAddress(
    phoneFormats: PhoneFormatConfig,
    phoneNumber: string,
    phoneCountryCode: string
): PhoneErrors {
  const errors: PhoneErrors = { phoneNumber: undefined, countryCode: undefined };

  let countryPhoneFormat: PhoneCountryCode;

  for (const countryKey in phoneFormats) {
    if (countryKey === phoneCountryCode ||
        (phoneFormats[countryKey] && phoneFormats[countryKey].countryCode === phoneCountryCode)) {
      countryPhoneFormat = phoneFormats[countryKey];
      let regExp;
      if (countryPhoneFormat.minLength || countryPhoneFormat.maxLength) {
        regExp =
            new RegExp(`^[0-9]{${countryPhoneFormat.minLength || 0},${countryPhoneFormat.maxLength || ""}}$`);
      } else {
        regExp = new RegExp(`^[0-9]*$`);
      }
      if (phoneNumber && !phoneNumber.match(regExp)) {
        const errMessage = "customerCannotBeCreatedPhoneInvalidLength";
        if (countryPhoneFormat.minLength && countryPhoneFormat.maxLength) {
          errors.phoneNumber = I18n.t(errMessage,
              { length: countryPhoneFormat.minLength + "-" + countryPhoneFormat.maxLength });
        } else if (countryPhoneFormat.minLength) {
          errors.phoneNumber = I18n.t(errMessage, { length: countryPhoneFormat.minLength });
        } else if (countryPhoneFormat.maxLength) {
          errors.phoneNumber = I18n.t(errMessage, { length: countryPhoneFormat.maxLength });
        } else {
          errors.phoneNumber = I18n.t("customerCannotBeCreatedPhoneInvalidFormat");
        }
      }
      break;
    }
  }

  return errors;
}
