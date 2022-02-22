import {
  TILL_COUNT_EVENT,
  TILL_OUT_EVENT,
  TILL_RECONCILIATION_EVENT,
  TILL_TO_BANK_EVENT,
  TILL_TO_SAFE_EVENT,
  TILL_AUDIT_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

//List of event types enabled for multi currency display.  Update on completion of a new addition.
const multiCurrencyEventTypes = [
  TILL_COUNT_EVENT,
  TILL_OUT_EVENT,
  TILL_RECONCILIATION_EVENT,
  TILL_TO_BANK_EVENT,
  TILL_TO_SAFE_EVENT,
  TILL_AUDIT_EVENT
];

export const isMultiCurrency = (eventType: string): boolean => {
  return multiCurrencyEventTypes.includes(eventType);
}
