import { SagaIterator } from "redux-saga";
import { put, select, takeEvery } from "redux-saga/effects";


import { LocalizableMessage } from "@aptos-scp/scp-component-business-core";
import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";

import { PosBusinessError } from "@aptos-scp/scp-component-store-selling-core";
import {
  CALCULATE_LOYALTY_MEMBERSHIP_EVENT,
  CollectedDataKey,
  DI_TYPES as FEATURES_DI_TYPES,
  ENROLL_CUSTOMER_EVENT,
  IAppLocalFeaturesStorage,
  ILoyaltyMembershipResponse,
  REMOVE_CUSTOMER_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import {IServiceResult} from "@aptos-scp/scp-types-commerce-transaction";

import {UI_ERROR_CODE} from "../../config/ErrorCodes";
import {
  businessOperation,
  BUSINESS_OPERATION,
  calculateLoyaltyMembership,
  CALCULATE_LOYALTY_MEMBERSHIP,
  clearLoyaltyMembership,
  feedbackNoteAction,
  LOAD_REWARD_REASONS,
  loadRewardReasons
} from "../actions";
import { SettingsState } from "../reducers";
import {getAppSettingsState} from "../selectors";
import I18n from "../../config/I18n";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.loyaltyMembership");

export function* calculateLoyaltyMembershipRequest(action: any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("calculateLoyaltyMembershipRequest");

  const { deviceIdentity, uiInputs } = action.payload;

  logger.debug(() => `In calculateLoyaltyMembershipRequest: Calling performBusinessOperation with `
  + `${CALCULATE_LOYALTY_MEMBERSHIP_EVENT} and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, CALCULATE_LOYALTY_MEMBERSHIP_EVENT, uiInputs));
  logger.traceExit(entryMessage);
}

export function* businessOperationSuccess(action: any): IterableIterator<{}> {
  if (action.payload.eventType === REMOVE_CUSTOMER_EVENT) {
    yield put(clearLoyaltyMembership.request());
  } else if (action.payload.eventType === ENROLL_CUSTOMER_EVENT &&
      action.payload.nonContextualData && action.payload.nonContextualData.has(
      CollectedDataKey.LoyaltyEnrollmentFailureMessage)) {
    const message: LocalizableMessage =
        action.payload.nonContextualData.get(CollectedDataKey.LoyaltyEnrollmentFailureMessage);
    yield put(feedbackNoteAction.request(I18n.t(message.i18nCode), message.i18nCode));
  } else {
    if (action.payload.nonContextualData &&
        action.payload.nonContextualData.has(CollectedDataKey.LoyaltyMembershipResponse)) {
      const loyaltyMembershipResponse: ILoyaltyMembershipResponse = action.payload.nonContextualData.get(
          CollectedDataKey.LoyaltyMembershipResponse);
      const serviceResult: IServiceResult = action.payload.nonContextualData.get(CollectedDataKey.ServiceResult);
      if (serviceResult && !serviceResult.successful) {
        yield put(calculateLoyaltyMembership.failure(
            new PosBusinessError(new LocalizableMessage(serviceResult.failureMessage), "", UI_ERROR_CODE)));
      } else {
        yield put(calculateLoyaltyMembership.success(
            loyaltyMembershipResponse.loyaltyActivities, loyaltyMembershipResponse.loyaltyAvailableRedemptions));
      }
    }
  }
}

export function* businessOperationFailure(action: any): IterableIterator<{}> {
  if (action.payload.eventType ===  CALCULATE_LOYALTY_MEMBERSHIP_EVENT) {
    yield put(calculateLoyaltyMembership.failure(action.payload.error));
  }
}

export function* loadRewardReasonsRequest(): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer = settings.diContainer;
  const appLocalFeaturesStorage: IAppLocalFeaturesStorage = diContainer.get(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);

  const rewardReasons = yield appLocalFeaturesStorage.loadRewardReasons();
  yield put(loadRewardReasons.success(rewardReasons));
}

export function* watchCalculateLoyaltyMembership(): SagaIterator {
  yield takeEvery(CALCULATE_LOYALTY_MEMBERSHIP.REQUEST, calculateLoyaltyMembershipRequest);
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
  yield takeEvery(BUSINESS_OPERATION.FAILURE, businessOperationFailure);
}

export function* watchLoadRewardReasons(): SagaIterator {
  yield takeEvery(LOAD_REWARD_REASONS.REQUEST, loadRewardReasonsRequest);
}
