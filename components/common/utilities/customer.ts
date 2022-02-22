import _ from "lodash";
import moment from "moment";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  ASSIGN_CUSTOMER_EVENT,
  CREATE_CUSTOMER_EVENT,
  Customer,
  ICustomerConfig,
  UPDATE_CUSTOMER_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import { isRefund } from "../../payment/PaymentDevicesUtils";

const ALL_QUALIFYING_CUSTOMERS = "AllQualifyingCustomers";
const NONE = "None";
const IS_RETURNING = "ItemHandlingSession.isReturning";

export function isCustomerLoyaltyPromptNeeded(configurationManager: IConfigurationManager,
                                              eventType: string,
                                              stateValues: Map<string, any>,
                                              prevStateValues: Map<string, any>,
                                              customerCreateResults?: Customer): boolean {

  if (isCustomerEvent(eventType) && !stateValues.get(IS_RETURNING) && !isRefund(stateValues)) {
    const customer = stateValues.get("transaction.customer") || customerCreateResults;
    const isCustomerPreviouslyAssigned = !!prevStateValues.get("transaction.customer");
    return customer && customer.customerNumber && !customer.hasLoyaltyMemberships &&
        loyaltyPromptEnabled(configurationManager, eventType, customer, isCustomerPreviouslyAssigned);
  } else {
    return false;
  }
}

export function isCustomerEvent(eventType: string): boolean {
  return eventType === CREATE_CUSTOMER_EVENT || eventType === ASSIGN_CUSTOMER_EVENT
      || eventType === UPDATE_CUSTOMER_EVENT;
}

function loyaltyPromptEnabled(configurationManager: IConfigurationManager, eventType: string, cust: Customer, isCustomerPreviouslyAssigned: boolean): boolean {
  if (_.isEmpty(cust.availableLoyaltyPlans)) {
    //no plans to join
    return false;
  }
  const customerConfig = configurationManager.getCustomerValues() as ICustomerConfig;
  const functionalBehaviors = configurationManager && configurationManager.getFunctionalBehaviorValues();
  const loyaltyPromptEnabledDreprecated =  _.get(functionalBehaviors, "customerFunctionChoices.customerCreate.loyaltyPromptEnabled");
  const loyaltyPromptEnabledFor = _.get(customerConfig, "loyalty.enrollment.enrollmentPrompt.appliesTo");

  if (eventType === CREATE_CUSTOMER_EVENT && ((!loyaltyPromptEnabledFor && loyaltyPromptEnabledDreprecated) || (loyaltyPromptEnabledFor && loyaltyPromptEnabledFor !== NONE))) {
    //if customer create event then return true if the prompt config has enabled it or it is not set but the depreciated config exists and is set to true
    return true;
  } else if ((eventType === ASSIGN_CUSTOMER_EVENT || (eventType === UPDATE_CUSTOMER_EVENT && !isCustomerPreviouslyAssigned)) &&
      loyaltyPromptEnabledFor === ALL_QUALIFYING_CUSTOMERS &&
        (cust.allowPromptForLoyaltyEnrollment === undefined ||
          (cust.allowPromptForLoyaltyEnrollment &&
            (!cust.earliestNextLoyaltyEnrollmentPromptDate || isLoyaltyEnrollmentPromptDateExpired(new Date(cust.earliestNextLoyaltyEnrollmentPromptDate)))
          )
        )) {
    //if assigning customer and existing customer enrollments are allowed,
    //and if allowPromptForLoyaltyEnrollment not present or true and earliestNextLoyaltyEnrollmentPromptDate has expired
    return true;
  }

  return false;
}

function isLoyaltyEnrollmentPromptDateExpired(promptDate?: Date): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  //date is either not present or set to a date <= today
  return (promptDate === undefined || promptDate <= today);
}

export function getNextEnrollmentPromptDate(configurationManager: IConfigurationManager): string {
  const customerConfig = configurationManager.getCustomerValues() as ICustomerConfig;
  const deferralDays = _.get(customerConfig, "loyalty.enrollment.enrollmentPrompt.deferralButton.deferralDays", 90);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + deferralDays);
  return moment(futureDate).format("YYYY-MM-DD");
}
