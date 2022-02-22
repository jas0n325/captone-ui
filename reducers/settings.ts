import {
  APP_SETTING_CHANGE_ACTIONS,
  APP_SETTING_GET_LAST_SEQUENCE_NUMBER_ACTION,
  APP_SETTING_GET_LAST_TRANSACTION_NUMBER_ACTION,
  AppStatus,
  Settings
} from "../actions";
import { RequestState } from "./reducers";


export interface SettingsState extends Settings, RequestState { }

const INITIAL_STATE: SettingsState = {
  appStatus: AppStatus.Uninitialized
};

export default (state: SettingsState = INITIAL_STATE, action: any): SettingsState => {
  switch (action.type) {
    case APP_SETTING_CHANGE_ACTIONS.REQUEST:
    case APP_SETTING_GET_LAST_TRANSACTION_NUMBER_ACTION.REQUEST:
      return Object.assign({}, state, { inProgress: true });
    case APP_SETTING_CHANGE_ACTIONS.SUCCESS:
    case APP_SETTING_GET_LAST_TRANSACTION_NUMBER_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false, error: undefined });
    case APP_SETTING_CHANGE_ACTIONS.FAILURE:
    case APP_SETTING_GET_LAST_TRANSACTION_NUMBER_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    case APP_SETTING_GET_LAST_SEQUENCE_NUMBER_ACTION.REQUEST:
      return Object.assign({}, state, { inProgress: true });
    case APP_SETTING_GET_LAST_SEQUENCE_NUMBER_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
