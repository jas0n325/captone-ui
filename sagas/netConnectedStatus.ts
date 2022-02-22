import { eventChannel } from "redux-saga";
import NetInfo from "@react-native-community/netinfo";
import { put, take, takeEvery } from "redux-saga/effects";
import { setNetworkConnected, TERMINAL_SETTINGS_INITIALIZED_ACTION } from "../actions";


function* watchOnNetConnectionNotifications(): IterableIterator<{}> {
    const channel = eventChannel(listener => {
        return NetInfo.addEventListener(networkState => {
            listener(networkState.isConnected);
        });
    });
    while (true) {
        const connectionInfo = yield take(channel);
        yield put(setNetworkConnected.request(connectionInfo));
    }
}

export function* startWatchOnNetConnectionStatusNotifications(): IterableIterator<{}> {
  // We need the diContainer to have been initialized in initComponents, before we can register the listener.
  // This coordinates that sequencing.
  yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchOnNetConnectionNotifications);
}
