import {
  CONFIRM_CASH_DRAWER_CLOSED_EVENT,
  NO_SALE_EVENT,
  OPEN_CASH_DRAWER_EVENT,
  PAID_IN_EVENT,
  PAID_OUT_EVENT,
  RECORD_CASH_DRAWER_STATUS_EVENT,
  RESET_CASH_DRAWER_EVENT,
  SAFE_TO_TILL_EVENT,
  START_NO_SALE_EVENT,
  START_OPEN_CASH_DRAWER_EVENT,
  START_PAID_IN_EVENT,
  START_PAID_IN_LINE_TYPE,
  START_PAID_OUT_EVENT,
  START_PAID_OUT_LINE_TYPE,
  START_SAFE_TO_TILL_EVENT,
  START_SAFE_TO_TILL_LINE_TYPE,
  START_TILL_AUDIT_EVENT,
  START_TILL_AUDIT_LINE_TYPE,
  START_TILL_COUNT_EVENT,
  START_TILL_COUNT_LINE_TYPE,
  START_TILL_IN_EVENT,
  START_TILL_IN_LINE_TYPE,
  START_TILL_OUT_EVENT,
  START_TILL_OUT_LINE_TYPE,
  START_TILL_RECONCILIATION_EVENT,
  START_TILL_RECONCILIATION_LINE_TYPE,
  START_TILL_TO_BANK_EVENT,
  START_TILL_TO_BANK_LINE_TYPE,
  START_TILL_TO_SAFE_EVENT,
  START_TILL_TO_SAFE_LINE_TYPE,
  TENDER_EXCHANGE_EVENT,
  TILL_AUDIT_EVENT,
  TILL_COUNT_EVENT,
  TILL_IN_EVENT,
  TILL_OUT_EVENT,
  TILL_RECONCILIATION_EVENT,
  TILL_TO_BANK_EVENT,
  TILL_TO_SAFE_EVENT,
  USER_CONTINUE_CASH_DRAWER_OPEN_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

interface TillManagementI18nCodes {
  title?: string;
  voidTitle?: string;
  voidMessage?: string;
  placeholder?: string;
  confirmDrawerClosed?: string;
  successful?: string;
  anotherTill?: string;
  cannotOpenDrawer?: string;
}

const eventTypeToI18nCodes: Map<string, TillManagementI18nCodes> =
    new Map<string, TillManagementI18nCodes>([
      [OPEN_CASH_DRAWER_EVENT, {
        title: "cashDrawer",
        cannotOpenDrawer: "failureToOpenMessage"
      }],
      [TILL_IN_EVENT, {
        title: "tillIn",
        voidTitle: "voidTillIn",
        voidMessage: "voidTillInMessage",
        placeholder: "countedAmount",
        confirmDrawerClosed: "closeDrawerTillIn",
        successful: "tillInSuccessfull",
        anotherTill: "openAnotherTill",
        cannotOpenDrawer: "cantOpenDrawerTill"
      }],
      [TILL_OUT_EVENT, {
        title: "tillOut",
        voidTitle: "voidTillOut",
        voidMessage: "voidTillOutMessage",
        placeholder: "countedAmount",
        confirmDrawerClosed: "closeDrawerTillOut",
        successful: "tillOutSuccessfull",
        anotherTill: "closeAnotherTill",
        cannotOpenDrawer: "cantOpenDrawerTill"
      }],
      [TILL_AUDIT_EVENT, {
        title: "tillAudit",
        voidTitle: "voidTillAudit",
        voidMessage: "voidTillAuditMessage",
        placeholder: "tillAuditAmount",
        confirmDrawerClosed: "closeDrawerTillAudit",
        successful: "tillAuditSuccessful",
        anotherTill: "auditAnotherTill",
        cannotOpenDrawer: "cantOpenDrawerTill"
      }],
      [TILL_COUNT_EVENT, {
        title: "tillCount",
        voidTitle: "voidTillCount",
        voidMessage: "voidTillCountMessage",
        placeholder: "tillCountAmount",
        confirmDrawerClosed: "closeDrawerTillCount",
        successful: "tillCountSuccessful",
        anotherTill: "countAnotherTill",
        cannotOpenDrawer: "cantOpenDrawerTill"
      }],
      [PAID_IN_EVENT, {
        title: "paidIn",
        voidTitle: "voidPaidIn",
        voidMessage: "voidPainInMessage",
        cannotOpenDrawer: "cantOpenDrawerPaid"
      }],
      [PAID_OUT_EVENT, {
        title: "paidOut",
        voidTitle: "voidPaidOut",
        voidMessage: "voidPaidOutMessage",
        cannotOpenDrawer: "cantOpenDrawerPaid"
      }],
      [NO_SALE_EVENT, {
        title: "noSale",
        voidTitle: "voidNoSale",
        cannotOpenDrawer: "cantOpenDrawerNoSale"
      }],
      [TILL_TO_BANK_EVENT, {
        title: "tillToBank",
        voidTitle: "voidTillToBank",
        voidMessage: "voidTillToBankMessage",
        placeholder: "tillToBankAmount",
        confirmDrawerClosed: "closeDrawerTillToBank",
        successful: "tillToBankSuccessful",
        anotherTill: "goToStoreOperations",
        cannotOpenDrawer: "cantOpenDrawerTill"
      }],
      [TILL_RECONCILIATION_EVENT, {
        title: "tillReconciliation",
        voidTitle: "voidTillReconciliation",
        voidMessage: "voidTillReconciliationMessage",
        placeholder: "tillReconciliationAmount",
        confirmDrawerClosed: "closeDrawerTillReconciliation",
        successful: "tillReconciliation",
        anotherTill: "reconcileAnotherTill",
        cannotOpenDrawer: "cantOpenDrawerTill"
      }],
      [SAFE_TO_TILL_EVENT, {
        title: "safeToTill",
        voidTitle: "voidSafeToTill",
        voidMessage: "voidSafeToTillMessage",
        placeholder: "enterPaymentAmount",
        confirmDrawerClosed: "closeDrawerSafeToTill",
        successful: "safeToTillSuccess",
        cannotOpenDrawer: "cantOpenDrawerTill"
      }],
      [TILL_TO_SAFE_EVENT, {
        title: "tillToSafe",
        voidTitle: "voidTillToSafe",
        voidMessage: "voidTillToSafeMessage",
        placeholder: "enterPaymentAmount",
        confirmDrawerClosed: "closeDrawerTillToSafe",
        successful: "tillToSafeSuccess",
        cannotOpenDrawer: "cantOpenDrawerTill"
      }],
      [TENDER_EXCHANGE_EVENT, {
        title: "cashDrawer",
        cannotOpenDrawer: "cantOpenDrawerTenderExchange",
        voidTitle: "void"
      }]
    ]);

export function getTitle18nCode(eventType: string): string {
  const i18nCodes = eventTypeToI18nCodes.get(eventType);
  return i18nCodes && i18nCodes.title;
}

export function getVoidTitle18nCode(eventType: string): string {
  const i18nCodes = eventTypeToI18nCodes.get(eventType);
  return i18nCodes && i18nCodes.voidTitle;
}

export function getVoidMessage18nCode(eventType: string): string {
  const i18nCodes = eventTypeToI18nCodes.get(eventType);
  return i18nCodes && i18nCodes.voidMessage;
}

export function getPlaceholder18nCode(eventType: string): string {
  const i18nCodes = eventTypeToI18nCodes.get(eventType);
  return i18nCodes && i18nCodes.placeholder;
}

export function getConfirmDrawerClosed18nCode(eventType: string): string {
  const i18nCodes = eventTypeToI18nCodes.get(eventType);
  return i18nCodes && i18nCodes.confirmDrawerClosed;
}

export function getSuccessful18nCode(eventType: string): string {
  const i18nCodes = eventTypeToI18nCodes.get(eventType);
  return i18nCodes && i18nCodes.successful;
}

export function getAnotherTill18nCode(eventType: string): string {
  const i18nCodes = eventTypeToI18nCodes.get(eventType);
  return i18nCodes && i18nCodes.anotherTill;
}

export function getCannotOpenDrawerI18nCode(eventType: string): string {
  const i18nCodes = eventTypeToI18nCodes.get(eventType);
  return i18nCodes && i18nCodes.cannotOpenDrawer;
}

const tillStartLineToTillEvent: Map<string, string> =
    new Map<string, string>([
      [START_TILL_IN_LINE_TYPE, TILL_IN_EVENT],
      [START_TILL_OUT_LINE_TYPE, TILL_OUT_EVENT],
      [START_TILL_AUDIT_LINE_TYPE, TILL_AUDIT_EVENT],
      [START_TILL_COUNT_LINE_TYPE, TILL_COUNT_EVENT],
      [START_TILL_TO_BANK_LINE_TYPE, TILL_TO_BANK_EVENT],
      [START_TILL_RECONCILIATION_LINE_TYPE, TILL_RECONCILIATION_EVENT],
      [START_PAID_IN_LINE_TYPE, PAID_IN_EVENT],
      [START_PAID_OUT_LINE_TYPE, PAID_OUT_EVENT],
      [START_SAFE_TO_TILL_LINE_TYPE, SAFE_TO_TILL_EVENT],
      [START_TILL_TO_SAFE_LINE_TYPE, TILL_TO_SAFE_EVENT]
    ]);

export function getTillEventFromStartLine(lineType: string): string {
  return tillStartLineToTillEvent.get(lineType);
}

const tillEventToTillStartEvent: Map<string, string> =
    new Map<string, string>([
      [TILL_IN_EVENT, START_TILL_IN_EVENT],
      [TILL_OUT_EVENT, START_TILL_OUT_EVENT],
      [PAID_IN_EVENT, START_PAID_IN_EVENT],
      [PAID_OUT_EVENT, START_PAID_OUT_EVENT],
      [OPEN_CASH_DRAWER_EVENT, START_OPEN_CASH_DRAWER_EVENT],
      [TENDER_EXCHANGE_EVENT, START_OPEN_CASH_DRAWER_EVENT],
      [NO_SALE_EVENT, START_NO_SALE_EVENT],
      [TILL_AUDIT_EVENT, START_TILL_AUDIT_EVENT],
      [TILL_COUNT_EVENT, START_TILL_COUNT_EVENT],
      [TILL_TO_BANK_EVENT, START_TILL_TO_BANK_EVENT],
      [TILL_RECONCILIATION_EVENT, START_TILL_RECONCILIATION_EVENT],
      [SAFE_TO_TILL_EVENT, START_SAFE_TO_TILL_EVENT],
      [TILL_TO_SAFE_EVENT, START_TILL_TO_SAFE_EVENT]
    ]);

export function getStartEventFromTillEvent(eventType: string): string {
  return tillEventToTillStartEvent.get(eventType);
}

export function isCashDrawerAction(eventType: string): boolean {
  return eventType === CONFIRM_CASH_DRAWER_CLOSED_EVENT ||
    eventType === RECORD_CASH_DRAWER_STATUS_EVENT ||
    eventType === START_OPEN_CASH_DRAWER_EVENT ||
    eventType === USER_CONTINUE_CASH_DRAWER_OPEN_EVENT ||
    eventType === RESET_CASH_DRAWER_EVENT;
}
