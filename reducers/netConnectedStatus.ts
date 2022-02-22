import {
    SET_NETWORK_CONNECTED,
    StandardAction
  } from "../actions";
  import { RequestState } from "./reducers";

  export interface NetConnectedState extends RequestState {
    isNetConnected: boolean;
  }

  const INITIAL_STATE: NetConnectedState = {
    isNetConnected: true
  };

  export default (state: NetConnectedState = INITIAL_STATE, action: StandardAction): NetConnectedState => {
    if (action.type === SET_NETWORK_CONNECTED.REQUEST) {
      return Object.assign({}, state, action.payload);
    }
    return state;
  };