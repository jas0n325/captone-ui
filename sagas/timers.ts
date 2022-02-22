import { Container } from "inversify";
import { SagaIterator } from "redux-saga";
import { select, takeEvery } from "redux-saga/effects";

import { DI_TYPES, ITimerService } from "@aptos-scp/scp-component-store-selling-features";

import { StandardAction, TimerReduxAction, TimerServiceMethods } from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


function* onTimerReduxAction(action: StandardAction): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;
  const timerService: ITimerService = diContainer.get<ITimerService>(DI_TYPES.ITimerService);

  switch (action.payload.timerServiceMethod) {
    case TimerServiceMethods.Register:
      timerService.registerTimer(action.payload.key, action.payload.timer);
      break;
    case TimerServiceMethods.Unregister:
      timerService.unregisterTimer(action.payload.key);
      break;
    case TimerServiceMethods.Start:
      timerService.startTimer(action.payload.key);
      break;
    case TimerServiceMethods.Stop:
      timerService.stopTimer(action.payload.key);
      break;
    case TimerServiceMethods.Reset:
      timerService.resetTimer(action.payload.key);
      break;
    case TimerServiceMethods.Update:
      timerService.updateTimers(action.payload.updateType);
      break;
    default:
      break;
  }
}

export function* startWatchTimerReduxAction(): SagaIterator {
  yield takeEvery(TimerReduxAction, onTimerReduxAction);
}
