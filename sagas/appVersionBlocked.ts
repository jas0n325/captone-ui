import VersionNumber from "react-native-version-number";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { DI_TYPES, ITerminalSettingsManager } from "@aptos-scp/scp-component-store-selling-core";
import { Container } from "inversify";
import { SagaIterator } from "redux-saga";
import { put, select, takeEvery } from "redux-saga/effects";
import { APP_VERSION_BLOCKED_ACTION, StandardAction, checkIfAppVersionIsBlocked} from "../actions";
import { isSSAAppVersionBlocked } from "../components/common/utilities/terminalSettingsUtils";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.appVersionBlocked");

function* appVersionBlockedRequest(action: StandardAction): IterableIterator<{}> {
  try {
    const settings: SettingsState = yield select(getAppSettingsState);
    const diContainer: Container = settings.diContainer;
    const terminalSettingsManager = diContainer.get<ITerminalSettingsManager>(DI_TYPES.ITerminalSettingsManager);

    let isAppVersionBlocked: boolean;

    // There's an issue when this is called during auto log out that causes the spinner modal to never be removed
    // after the remote call and block the login page. I believe this is caused by a race condition (possibly from the
    // login page itself being loaded at the same time as this being executed?), as the issue doesn't occur when I
    // debug, or even have the debugger open, which tends to slow down the simulator a small amount.
    // By using setTimeout, the function is delayed and called last in the actions currently being processed,
    // allowing whatever was blocking this from completing correctly to be processed first.
    yield new Promise<void>(resolve =>
      setTimeout(async () => {
        isAppVersionBlocked = await isSSAAppVersionBlocked(VersionNumber.appVersion, terminalSettingsManager);
        resolve();
      })
    );

    if (isAppVersionBlocked) {
      yield put(checkIfAppVersionIsBlocked.success(isAppVersionBlocked));
    }
  } catch (error) {
    logger.catching(error, "appVersionBlockedRequest");
  }
}

export function* watchAppVersionBlockedRequest(): SagaIterator {
  yield takeEvery(APP_VERSION_BLOCKED_ACTION.REQUEST, appVersionBlockedRequest);
}
