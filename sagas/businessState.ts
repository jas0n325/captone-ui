import { Container } from "inversify";
import { SagaIterator } from "redux-saga";
import { delay, put, select, takeEvery } from "redux-saga/effects";

import { ILocalizableMessage } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DI_TYPES as CORE_DI_TYPES,
  IPosEventProcessorService,
  isQualificationResult,
  PosBusinessError,
  ProcessingResult,
  QualificationError,
  UiBusinessEvent
} from "@aptos-scp/scp-component-store-selling-core";
import {
  IDisplayInfo,
  IN_FISCAL_CONTROL_TRANSACTION,
  IN_MERCHANDISE_TRANSACTION,
  IN_MERCHANDISE_TRANSACTION_READY_TO_CLOSE,
  IN_MERCHANDISE_TRANSACTION_WAITING,
  IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE,
  IN_TENDER_CONTROL_TRANSACTION_WAITING,
  IN_TENDER_CONTROL_TRANSACTION_WAITING_TO_CLOSE,
  NOT_IN_TRANSACTION
} from "@aptos-scp/scp-component-store-selling-features";

import { UI_ERROR_CODE } from "../../config/ErrorCodes";
import {
  businessOperation,
  BUSINESS_OPERATION,
  clearReceipt,
  updateTransactionNumberSettingsAction,
  userNotification
} from "../actions";
import {
  deviceService,
  DeviceServiceType,
  updateUiMode,
  updateUiState
} from "../actions";
import {
  SettingsState,
  UiState,
  UI_MODE_BALANCE_INQUIRY,
  UI_MODE_FATAL_ERROR,
  UI_MODE_GIFTCARD_ISSUE,
  UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION,
  UI_MODE_VOID_TRANSACTION,
  UI_MODE_WAITING_FOR_INPUT,
  UI_MODE_WAITING_TO_CLEAR_TRANSACTION,
  UI_MODE_WAITING_TO_CLOSE
} from "../reducers";
import { getAppSettingsState, getUiState } from "../selectors";


// Note: This delay should probably be configurable, somewhere.
const DELAY_BEFORE_RECEIPT_CLEAR: number = 3000; // 3 seconds

const logger: ILogger = LogManager.getLogger("ui.sagas.businessState");

//FIXME: Break this down to reduce complexity.
// tslint:disable-next-line:cyclomatic-complexity
export function* performBusinessOperation(action: any): IterableIterator<{}> {
  const { deviceIdentity, eventType, inputs} = action.payload;

  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;

  const peps: IPosEventProcessorService =
      diContainer.get<IPosEventProcessorService>(CORE_DI_TYPES.IPosEventProcessorService);

  const uiBusinessEvent: UiBusinessEvent = new UiBusinessEvent(deviceIdentity, eventType, inputs);

  try {
    yield put(deviceService.request(DeviceServiceType.ScannerUpdate, { enabled : false }));
    yield put(userNotification.success());
    //tslint:disable-next-line:max-line-length
    logger.trace(() => `In performBusinessOperation: calling peps.handleUiBusinessEvent with ${JSON.stringify(uiBusinessEvent)}`);
    const result: ProcessingResult = yield peps.handleUiBusinessEvent(uiBusinessEvent);
    //tslint:disable-next-line:max-line-length
    logger.debug(() => `In performBusinessOperation: result from peps.handleUiBusinessEvent: ${JSON.stringify(result)}`);

    const hadTransaction: boolean = result.stateValues.has("transaction.open");
    const transactionWaitingToClose: boolean =
        (result.stateValues.has("transaction.waitingToClose") && result.stateValues.get("transaction.waitingToClose"));
    const transactionClosed: boolean =
        (result.stateValues.has("transaction.closed") && result.stateValues.get("transaction.closed"));

    yield put(businessOperation.success(result.stateValues, result.receiptLines,
        result.displayInfo as IDisplayInfo, result.nonContextualData, inputs, result.lastTransactionInfo,
        result.lastPrintableTransactionInfo, eventType));

    // While the transaction number is kept in the settings state, we need to keep it up to date, so that it doesn't get
    // set backwards, because someone updates a setting.
    const transactionNumber: number = result.stateValues.get("transaction.number");
    if (transactionNumber) {
      yield put(updateTransactionNumberSettingsAction(transactionNumber));
    }

    // Transition UI state, if the mode is not "sticky".
    //FIXME: We should have a better model for UI modes that can be asked whether it is "sticky" instead of hard-coding.
    const currentUiState: UiState = yield select(getUiState);
    if (hadTransaction && transactionClosed && currentUiState.mode !== UI_MODE_BALANCE_INQUIRY) {
      // Transaction has been closed, so clear the receipt display after a delay, so the operator can see the results.
      const transactionNumberToClear: number = result.stateValues.get("transaction.number");
      yield put(updateUiMode.request(UI_MODE_WAITING_TO_CLEAR_TRANSACTION));
      // On the phone: delay will show the voided line items.  Not needed when user is clicking `Done` button in
      // receipt screen
      if (currentUiState.mode === UI_MODE_VOID_TRANSACTION) {
        yield delay(DELAY_BEFORE_RECEIPT_CLEAR);
      }
      yield put(updateUiState.request(result.logicalState, result.events, undefined));
      if (currentUiState.logicalState !== IN_FISCAL_CONTROL_TRANSACTION) {
        yield put(clearReceipt.request(transactionNumberToClear));
      }
    } else if (transactionWaitingToClose && currentUiState.mode !== UI_MODE_BALANCE_INQUIRY &&
          currentUiState.mode !== UI_MODE_WAITING_TO_CLOSE) {
      yield put(updateUiState.request(result.logicalState, result.events, UI_MODE_WAITING_TO_CLOSE));
    } else {
      // Preserve the UI mode, unless the logical state has changed.
      const preserveUIMode: boolean = checkToPreserveUiMode(currentUiState, result);
      const newMode: string = (preserveUIMode) ? currentUiState.mode : undefined;
      yield put(updateUiState.request(result.logicalState, result.events, newMode));
    }
  } catch (err) {
    logger.catching(err, "performBusinessOperation");
    let message: string;
    let errorMessage: ILocalizableMessage;
    let loggerType: string = "debug";
    let loggerOptions: object;
    let loggerErr: Error;
    // Most of the time, reason will be a QualificationResult, but I believe that it could also be an Error
    if (isQualificationResult(err)) {
      message = "";
      errorMessage = err.rejectionReason;
    } else if (err instanceof PosBusinessError || err instanceof QualificationError) {
      message = err.message;
      errorMessage = err.localizableMessage;
    } else if (err.message) {
      message = err.message;
      loggerType = "warn";
      loggerOptions = {};
      loggerErr = err;
    } else {
      message = err.toString();
      loggerType = "warn";
      loggerOptions = {};
      loggerErr = err;
    }

    yield put(businessOperation.failure(sanitizeErrorMessage(message, errorMessage, err), inputs, eventType));

    // If the app logicalState is not set to anything due to error during try {},
    // then the app will get stuck on spinner
    const currentUiState: UiState = yield select(getUiState);
    if (typeof currentUiState.logicalState === "undefined") {
      loggerType = "fatal";

      yield put(updateUiMode.failure(UI_MODE_FATAL_ERROR, { name: "businessStateError", message }));
    }

    const loggerMessage: string = createLoggerMessage(loggerType, message, errorMessage);
    // loggerMessage will be undefined if is(Debug|Warn|Fatal)Enabled() return false.
    if (loggerMessage) {
      logger[loggerType](loggerMessage, loggerOptions, loggerErr);
    }
  }
}

// tslint:disable-next-line: cyclomatic-complexity
function checkToPreserveUiMode(currentUiState: UiState, processResult: ProcessingResult): boolean {
  return (currentUiState.logicalState === processResult.logicalState) ||
         (currentUiState.logicalState === NOT_IN_TRANSACTION &&
          processResult.logicalState === IN_TENDER_CONTROL_TRANSACTION_WAITING) ||
         (currentUiState.logicalState === IN_TENDER_CONTROL_TRANSACTION_WAITING &&
          processResult.logicalState === IN_TENDER_CONTROL_TRANSACTION_WAITING_TO_CLOSE) ||
         (currentUiState.logicalState === IN_MERCHANDISE_TRANSACTION &&
          processResult.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING) ||
         (currentUiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING &&
          processResult.logicalState === IN_MERCHANDISE_TRANSACTION) ||
         (currentUiState.mode === UI_MODE_GIFTCARD_ISSUE &&
          currentUiState.logicalState === NOT_IN_TRANSACTION &&
          processResult.logicalState === IN_MERCHANDISE_TRANSACTION) ||
          // Waiting for customer assignment at end of transaction
          (currentUiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE &&
            processResult.logicalState === IN_MERCHANDISE_TRANSACTION_READY_TO_CLOSE) ||
          (currentUiState.logicalState === IN_MERCHANDISE_TRANSACTION_READY_TO_CLOSE &&
            processResult.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE) ||
          (currentUiState.mode === UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION) ||
          (currentUiState.mode === UI_MODE_WAITING_FOR_INPUT);
}

// TODO: Find a better way to distingush the reject reason (https://jira.aptos.com/browse/ZSPFLD-1829
// FIXME: This is a HACK to clean-up and only show localized messages to the user.
// This needs to be replaced with a better approach.
// How should we decide which messages to show?  Should there be a (configured) white list of error codes that can
// be shown to a user or is there a better way?
function sanitizeErrorMessage(message: string, localizableMessage: ILocalizableMessage, error: Error): Error {
  // If there is no i18n code defined then the error is not shown to the user
  // as there is nothing to displayed
  if (!localizableMessage) {
    return new Error(message);
  }

  // The information contained in QualificationError as required inputs might be necessary in the UI to decide how
  // to handle it
  if (error instanceof PosBusinessError) {
    return error;
  }

  return new PosBusinessError(localizableMessage, message, UI_ERROR_CODE);
}

function createLoggerMessage(type: string, message: string, errorMessage?: ILocalizableMessage): string {
  let loggerMessage: string;
  const typeWithUpperFirstCase = type.charAt(0).toUpperCase() + type.slice(1);
  if (logger[`is${typeWithUpperFirstCase}Enabled`]) {
    if (errorMessage) {
      loggerMessage = `Rejected: "${message}", localizable message: "${JSON.stringify(errorMessage)}"`;
    } else {
      loggerMessage = `Error message: "${message}"`;
    }
   }
  return loggerMessage;
}

export function* watchBusinessOperation(): SagaIterator {
  yield takeEvery(BUSINESS_OPERATION.REQUEST, performBusinessOperation);
}
