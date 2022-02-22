import { IDepartment } from "@aptos-scp/scp-component-store-selling-features";

import { GET_DEPARTMENTS_ACTION } from "../actions";
import { RequestState } from "./reducers";


export interface DepartmentsState extends RequestState {
  departments: Array<IDepartment>;
}

const INITIAL_STATE: DepartmentsState = {
  departments: []
};

export default (state: DepartmentsState = INITIAL_STATE, action: any): DepartmentsState => {
  switch (action.type) {
    case GET_DEPARTMENTS_ACTION.REQUEST:
      return Object.assign({}, state, {inProgress: true});
    case GET_DEPARTMENTS_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined});
    case GET_DEPARTMENTS_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, {inProgress: false});
    default:
      return state;
  }
};
