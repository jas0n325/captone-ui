import { DATA_EVENT, DataEventType, IDataEventData } from "../actions";
import { RequestState } from "./reducers";


export interface DataEventState extends RequestState {
  eventType: DataEventType;
  data?: IDataEventData;
  error?: Error;
}

const INITIAL_STATE: DataEventState = {
  eventType: undefined,
  error: undefined
};

export default (state: DataEventState = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case DATA_EVENT.REQUEST:
      return Object.assign({}, state,
          { eventType : action.payload.eventType, data: action.payload.data, error: undefined});
    case DATA_EVENT.SUCCESS:
      return { eventType: state.eventType, error: undefined };
    case DATA_EVENT.FAILURE:
      return { eventType: state.eventType, error: action.payload.error };
    default:
      return state;
  }
};
