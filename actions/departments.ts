import { IDepartment } from "@aptos-scp/scp-component-store-selling-features";

import { defineRequestType, RequestType, StandardAction } from "./actions";


export const GET_DEPARTMENTS_ACTION: RequestType = defineRequestType("GET_DEPARTMENTS");

export const getDepartments = {
  request: (): StandardAction => {
    return {
      type: GET_DEPARTMENTS_ACTION.REQUEST,
      payload: {}
    };
  },
  success: (departments: Array<IDepartment>): StandardAction => {
    return {
      type: GET_DEPARTMENTS_ACTION.SUCCESS,
      payload: {
        departments
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_DEPARTMENTS_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};
