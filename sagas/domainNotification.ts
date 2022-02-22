import { EventEmitter, EventSubscription } from "fbemitter";
import { Container } from "inversify";
import { Channel, EventChannel, eventChannel } from "redux-saga";
import { call, put, select, take, takeEvery } from "redux-saga/effects";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DeviceIdentity,
  DI_TYPES as CORE_DI_TYPES,
  DOMAIN_NOTIFICATION_EVENT_TYPE,
  DOMAIN_STATE_CHANGED_DOMAIN_NOTIFICATION_TYPE,
  IDomainNotificationListener,
  IDomainToUINotification
} from "@aptos-scp/scp-component-store-selling-core";
import {
  DIGITAL_SIGNATURE_UNAVAILABLE_REASON_CODE,
  SSF_DISMISS_ALERTS_DOMAIN_NOTIFICATION_TYPE,
  SSF_TRANSACTION_VOID_REQUIRED_DOMAIN_NOTIFICATION_TYPE,
  SYNC_STATE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../config/I18n";
import { businessOperation, dismissAlertModal, TERMINAL_SETTINGS_INITIALIZED_ACTION } from "../actions";
import { replace } from "../components/common/utilities/navigationUtils";
import {
  dispatchWithNavigationRef,
  getCurrentRouteNameWithNavigationRef,
  navigate
} from "../components/RootNavigation";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


interface IDomainNotificationPayload {
  notification: IDomainToUINotification;
}

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.domainNotification");

function createDomainNotificationListener(diContainer: Container): EventChannel<IDomainNotificationPayload> {
  return eventChannel((emit: (input: IDomainNotificationPayload) => void): () => void => {

    const uiNotificationEmitter: EventEmitter =
      diContainer.get<EventEmitter>(CORE_DI_TYPES.UiNotificationEmitter);

    // Define the function that will be called, when a notification is sent.
    const domainNotificationListener: IDomainNotificationListener = (notification: IDomainToUINotification): void => {
      const payload: IDomainNotificationPayload = { notification };
      // This should emit an event on a redux-saga event channel, so that
      // it can be consumed and an appropriate action can be processed.
      emit(payload);
    };

    const eventSubscription: EventSubscription = uiNotificationEmitter
      .addListener(DOMAIN_NOTIFICATION_EVENT_TYPE, domainNotificationListener);

    return () => {
      eventSubscription.remove();
    };
  });
}


let channel: Channel<IDomainNotificationPayload>;

function* watchOnDomainNotification(): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;

  if (channel) {
    channel.close();
  }
  channel = yield call(createDomainNotificationListener, diContainer);

  //noinspection InfiniteLoopJS
  while (true) {
    const payload: IDomainNotificationPayload = yield take(channel);
    const notificationType: string = payload.notification.type;
    if (notificationType === DOMAIN_STATE_CHANGED_DOMAIN_NOTIFICATION_TYPE) {
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      yield put(businessOperation.request(deviceIdentity, SYNC_STATE_EVENT, []));
    } else if (notificationType === SSF_DISMISS_ALERTS_DOMAIN_NOTIFICATION_TYPE) {
      yield put(dismissAlertModal.request());
    } else if (notificationType === SSF_TRANSACTION_VOID_REQUIRED_DOMAIN_NOTIFICATION_TYPE) {
      const currentScene = getCurrentRouteNameWithNavigationRef();
      if (currentScene === "main") {
        navigate("voidableErrorScreen", {
          errorMessage: payload.notification.payload
        }, false);
      } else {
        dispatchWithNavigationRef(replace("voidableErrorScreen", {
          errorMessage: payload.notification.payload,
          voidableReasonInfo: {
            reasonCode: DIGITAL_SIGNATURE_UNAVAILABLE_REASON_CODE,
            reasonDescription: I18n.t("digitalSignatureUnavailable")
          }
        }));
      }
    } else {
      logger.error(() => `Cannot process domain notification with notification type: ${notificationType}`);
    }
  }
}

export function* startWatchOnDomainNotification(): IterableIterator<{}> {
  // We need the diContainer to have been initialized in initComponents, before we can register the listener.
  // This coordinates that sequencing.
  yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchOnDomainNotification);
}
