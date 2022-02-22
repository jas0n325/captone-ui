import {defineRequestType, RequestType, StandardAction} from "./actions";

export const LOAD_APP_RESOURCE: RequestType = defineRequestType("LOAD_APP_RESOURCE");

export const loadAppResource = {
  request: (resourceName: string, isTablet?: boolean): StandardAction => {
    return {
      type: LOAD_APP_RESOURCE.REQUEST,
      payload: {
        resourceName,
        isTablet
      }
    };
  },
  success: (resourceName: string, resource: string): StandardAction => {
    return {
      type: LOAD_APP_RESOURCE.SUCCESS,
      payload: {
        resourceName,
        resource
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: LOAD_APP_RESOURCE.FAILURE,
      payload: {
        error
      }
    };
  }
};
