import { SagaIterator } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  Customer,
  CUSTOMER,
  CUSTOMER_CREATION_RESULT,
  CUSTOMER_LIST,
  CUSTOMER_UPDATE_RESULT,
  FIND_CUSTOMERS_EVENT,
  ICustomerCreationResult,
  ICustomerResult,
  ICustomerSearch,
  LOOKUP_CUSTOMER_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import {
  BUSINESS_OPERATION,
  businessOperation,
  LOOKUP_CUSTOMER,
  lookupCustomer,
  SEARCH_CUSTOMER,
  searchCustomer,
  updateCustomer,
  updateCustomerCreationResult,
  updateCustomerUpdateResult
} from "../actions";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.customer");

function buildSearchUiInput(params: ICustomerSearch): UiInput[] {
  const uiInputs: UiInput[] = [];

  const { phoneNumber, lastName, firstName, emailAddress, postalCode, customerKey, alternateKey1 } = params;

  if (customerKey) {
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, customerKey));
  }
  if (firstName) {
    uiInputs.push(new UiInput("firstName", firstName));
  }
  if (lastName) {
    uiInputs.push(new UiInput("lastName", lastName));
  }
  if (phoneNumber) {
    uiInputs.push(new UiInput("phoneNumber", phoneNumber));
  }
  if (emailAddress) {
    uiInputs.push(new UiInput("emailAddress", emailAddress));
  }
  if (postalCode) {
    uiInputs.push(new UiInput("postalCode", postalCode));
  }
  if (alternateKey1) {
    uiInputs.push(new UiInput(UiInputKey.ALTERNATE_KEY, alternateKey1));
  }
  return uiInputs;
}

export function* searchCustomerRequest(action: any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("searchCustomerRequest");

  const { deviceIdentity, params } = action.payload;
  const uiInputs: UiInput[] = buildSearchUiInput(params);

  logger.debug(() => `In searchCustomerRequest: Calling performBusinessOperation with ${FIND_CUSTOMERS_EVENT} `
      + `and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, FIND_CUSTOMERS_EVENT, uiInputs));
  logger.traceExit(entryMessage);
}

export function* lookupCustomerRequest(action: any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("lookupCustomerRequest");
  const { deviceIdentity, params } = action.payload;
  const uiInputs: UiInput[] = [];
  const { customerNumber, assignCustomer, customer } = params;
  if (customerNumber) {
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, customerNumber));
  }
  if (assignCustomer) {
    uiInputs.push(new UiInput(UiInputKey.ASSIGN_CUSTOMER, assignCustomer));
  }
  if (customer) {
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER, customer));
  }
  logger.debug(() => `In lookupCustomerRequest: Calling performBusinessOperation with ${LOOKUP_CUSTOMER_EVENT} `
      + `and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, LOOKUP_CUSTOMER_EVENT, uiInputs));
  logger.traceExit(entryMessage);
}

export function* businessOperationSuccess(action: any): IterableIterator<{}> {
  if (action.payload.nonContextualData && (action.payload.nonContextualData.has(CUSTOMER_LIST)) )  {
    const customers: Customer[] = action.payload.nonContextualData.get(CUSTOMER_LIST);
    customers.sort((a, b) => {
      return (a.firstName > b.firstName) ? 1 : ((b.firstName > a.firstName) ? -1 : 0);
    });

    yield put(searchCustomer.success(customers));
  } else if (action.payload.nonContextualData && action.payload.nonContextualData.has(CUSTOMER)) {
    const customer: Customer = action.payload.nonContextualData.get(CUSTOMER);
    yield put(lookupCustomer.success(customer));
  } else if (action.payload.nonContextualData && action.payload.nonContextualData.has(CUSTOMER_CREATION_RESULT)) {
    const customerCreationResult: ICustomerCreationResult =
        action.payload.nonContextualData.get(CUSTOMER_CREATION_RESULT);
    yield put(updateCustomer.request(customerCreationResult.customer));
    yield put(updateCustomerCreationResult.request(customerCreationResult));
  } else if (action.payload.nonContextualData && action.payload.nonContextualData.has(CUSTOMER_UPDATE_RESULT)) {
    const customerUpdateResult: ICustomerResult =
        action.payload.nonContextualData.get(CUSTOMER_UPDATE_RESULT);
    yield put(updateCustomer.request(customerUpdateResult.customer));
    yield put(updateCustomerUpdateResult.request(customerUpdateResult));
  }
}

export function* watchCustomerSearch(): SagaIterator {
  yield takeEvery(SEARCH_CUSTOMER.REQUEST, searchCustomerRequest);
  yield takeEvery(LOOKUP_CUSTOMER.REQUEST, lookupCustomerRequest);
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
}
