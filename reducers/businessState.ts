import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { IDisplayInfo, ILastRetailTransactionInfo } from "@aptos-scp/scp-component-store-selling-features";

import { BUSINESS_OPERATION, CLEAR_RECEIPT } from "../actions";
import { RequestState } from "./reducers";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.reducers.businessState");

export interface BusinessState extends RequestState {
  logicalState?: string;
  stateValues?: Map<string, any>;
  lines?: string[];
  displayInfo?: IDisplayInfo;
  error?: Error;
  lastTransactionInfo?: ILastRetailTransactionInfo;
  lastPrintableTransactionInfo?: ILastRetailTransactionInfo;
  inProgressCount?: number;
  eventType?: string;
  nonContextualData?: Readonly<Map<string, any>>;
  inputs?: Array<UiInput>;
}

const INITIAL_STATE: BusinessState = { inProgress: false, inProgressCount: 0 };

export default (state: BusinessState = INITIAL_STATE, action: any): BusinessState => {
  switch (action.type) {
    case BUSINESS_OPERATION.REQUEST:
      return Object.assign({}, state, { ...updateInProgress(state, true) });
    case BUSINESS_OPERATION.SUCCESS:
      return Object.assign({}, state, action.payload, { ...updateInProgress(state, false) });
    case BUSINESS_OPERATION.FAILURE:
      // Note: Control of whether an error message is displayed should be handled by the saga, not here.
      return Object.assign({}, state, action.payload, { ...updateInProgress(state, false) });
    case CLEAR_RECEIPT.REQUEST:
      return Object.assign({}, state, determineChangesToClearReceipt(state, action));
    // Note: The CLEAR_RECEIPT.SUCCESS and CLEAR_RECEIPT.FAILURE actions are not used, so do not need to be reduced.

    default:
      return state;
  }
};

interface InProgressInfo { inProgress: boolean; inProgressCount: number; }
function updateInProgress(state: BusinessState, increment: boolean): InProgressInfo {
  let inProgressCount: number = (state && state.inProgressCount) || 0;
  if (increment) {
    inProgressCount++;
  } else if (inProgressCount > 0) {
    inProgressCount--;
  }
  return { inProgress: inProgressCount > 0, inProgressCount };
}

function determineChangesToClearReceipt(state: BusinessState, action: any): any {
  let stateChanges = { };

  const currentTransactionNumber: number =
    (state && state.stateValues) ? state.stateValues.get("transaction.number") : undefined;
  const transactionNumberToClear: number = action.payload.transactionNumberToClear;
  // tslint:disable-next-line:max-line-length
  logger.trace(() => `currentTransactionNumber: ${currentTransactionNumber}, transactionNumberToClear: ${transactionNumberToClear}`);
  // Only clear the transaction data, if the transaction in state is the one that we want to clear.
  if (currentTransactionNumber === transactionNumberToClear) {
    // Clear out the receipt and display lines.
    const lines: string[] = [];
    const displayInfo: IDisplayInfo = {
      itemDisplayLines: [],
      tenderDisplayLines: [],
      transactionDiscountDisplayLines: []
    };

    // In addition to the receipt and display lines, we also want to clear out the transaction state values, so that
    // we don't display an old subtotal, tax, total, etc.  But we want to preserve the transaction number, so that its
    // display is consistent.
    const currentStateValuesMapEntries: Array<[string, any]> = [...state.stateValues.entries()];
    logger.trace(() => `Current state values: ${JSON.stringify(currentStateValuesMapEntries)}`);
    //noinspection JSUnusedLocalSymbols
    const stateValuesMapEntries: Array<[string, any]> = currentStateValuesMapEntries.filter(
        (value: [string, any], index: number , array: Array<[string, any]>): boolean => {
          const key = value[0];
          return (! key.startsWith("transaction.")) || (key === "transaction.number");
        }
    );
    const stateValues: Map<string, any> = new Map<string, any>(stateValuesMapEntries);
    logger.debug(() => `Changing state values to ${JSON.stringify([...stateValues.entries()])}`);

    stateChanges = {
      stateValues,
      lines,
      displayInfo
    };
  } //else {
    // The current transaction is not the one we want to clear, so either it was cleared already, or we are in a new
    // transaction.  Either way, we do not want to update the state, so return an empty object, which will apply no
    // changes.
  //}

  return stateChanges;
}
