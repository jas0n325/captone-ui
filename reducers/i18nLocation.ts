import { LOAD_I18NLOCATION } from "../actions/i18nLocation";

export interface I18nLocationState {
  i18nLocation?: string;
}

const INITIAL_STATE: I18nLocationState = {};

export default (state: I18nLocationState = INITIAL_STATE, action: any): I18nLocationState => {
  if (action.type === LOAD_I18NLOCATION.SUCCESS) {
    return Object.assign({}, state, action.payload);
  }
  return state;
}