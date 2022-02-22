import { IHoursOfOperation } from "@aptos-scp/scp-component-store-selling-features";

import { GET_HOURS_OF_OPERATION_ACTION } from "../actions";
import { RequestState } from "./reducers";


export interface HoursOfOperationState extends RequestState {
  hoursOfOperation: IHoursOfOperation;
}

const INITIAL_STATE: HoursOfOperationState = {
  hoursOfOperation: undefined
};

export default (state: HoursOfOperationState = INITIAL_STATE, action: any): HoursOfOperationState => {
  switch (action.type) {
    case GET_HOURS_OF_OPERATION_ACTION.REQUEST:
      return Object.assign({}, state, { inProgress: true, error: undefined });
    case GET_HOURS_OF_OPERATION_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false, error: undefined });
    case GET_HOURS_OF_OPERATION_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
