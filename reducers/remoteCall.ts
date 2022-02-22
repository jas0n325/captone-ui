import { IRemoteCallPayload, REMOTE_CALL } from "../actions";
import { RequestState } from "./reducers";


export interface RemoteCallState extends RequestState {
  name: string;
  isProcessing: boolean;
  lastSequenceNumber: number;
  error?: Error;
}

const INITIAL_STATE: RemoteCallState = {
  name: "",
  isProcessing: false,
  lastSequenceNumber: -1
};

export default (state: RemoteCallState = INITIAL_STATE, action: any): RemoteCallState => {
  const payload: IRemoteCallPayload = action.payload;
  // The sequence number is always updated so the latest is saved but isProcessing is set to true only when it
  // receives a more recent event avoiding the issue of blocking the UI due to out of sequence events.
  if (payload && payload.sequenceNumber >= state.lastSequenceNumber && (
      (payload.sequenceNumber > state.lastSequenceNumber && payload.isProcessing && !state.isProcessing) ||
      !payload.isProcessing)) {
    switch (action.type) {
      case REMOTE_CALL.REQUEST:
      case REMOTE_CALL.SUCCESS:
      case REMOTE_CALL.FAILURE:
        return Object.assign({}, state, {
          name: payload.name,
          isProcessing: payload.isProcessing,
          lastSequenceNumber: payload.sequenceNumber
        });
      default:
        return state;
      }
  } else {
    // Ignore actions for remote calls that are different to the last one that was processed.
    return state;
  }
};
