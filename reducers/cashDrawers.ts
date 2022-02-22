import { ICashDrawerDetail } from "@aptos-scp/scp-component-store-selling-features";
import { GET_CASH_DRAWERS, StandardAction, VALIDATE_CASH_DRAWER } from "../actions";
import { RequestState } from "./reducers";

export interface CashDrawerState extends RequestState {
  cashDrawer: ICashDrawerDetail;
  inputSource: string;
  eventType: string;
}

const INITIAL_STATE: CashDrawerState = {
  cashDrawer: undefined,
  inputSource: undefined,
  eventType: undefined
};

export default (state: CashDrawerState = INITIAL_STATE, action: StandardAction): CashDrawerState => {
  switch (action.type) {
    case VALIDATE_CASH_DRAWER.REQUEST:
    case GET_CASH_DRAWERS.REQUEST:
      return Object.assign({}, state, {inProgress: true});
    case VALIDATE_CASH_DRAWER.SUCCESS:
    case GET_CASH_DRAWERS.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined});
    case VALIDATE_CASH_DRAWER.FAILURE:
      return Object.assign({}, state, action.payload, {inProgress: false});
    default:
      return state;
  }
};
