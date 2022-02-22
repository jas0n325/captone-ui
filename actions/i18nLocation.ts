import { defineRequestType, RequestType, StandardAction } from "./actions";
export const LOAD_I18NLOCATION: RequestType = defineRequestType("LOAD_I18NLOCATION");

export const loadI18nLocation = {
  request: (): StandardAction => {
    return {
      type: LOAD_I18NLOCATION.REQUEST,
      payload: {}
    };
  },
  success: (i18nLocation: string): StandardAction => {
    return {
      type: LOAD_I18NLOCATION.SUCCESS,
      payload: {
        i18nLocation
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: LOAD_I18NLOCATION.FAILURE,
      payload: {
        error
      }
    };
  }
};
