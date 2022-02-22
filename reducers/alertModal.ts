import { AlertModalProps, DISMISS_ALERT_MODAL, SHOW_ALERT_MODAL } from "../actions";


export interface AlertModalState {
  alertModalProps: AlertModalProps;
}

const INITIAL_STATE: AlertModalState = {
  alertModalProps: undefined
};

export default (state: AlertModalState = INITIAL_STATE, action: any): AlertModalState => {
  switch (action.type) {
    case SHOW_ALERT_MODAL.REQUEST:
      return Object.assign({}, state, { alertModalProps: action.payload });
    case SHOW_ALERT_MODAL.SUCCESS:
      return Object.assign({}, state, { alertModalProps: undefined });
    case DISMISS_ALERT_MODAL.REQUEST:
    default:
      return state;
  }
};
