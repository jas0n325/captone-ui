import { defineRequestType, RequestType, StandardAction } from "./actions";


export const DISPLAY_TOAST: RequestType = defineRequestType("DISPLAY_TOAST");

export const displayToast = {
  request: (toastMessage: string): StandardAction => {
    return {
      type: DISPLAY_TOAST.REQUEST,
      payload: {
        error: undefined as Error,
        toastMessage
      }
    };
  },
  success: (): StandardAction => {
    return {
      type: DISPLAY_TOAST.SUCCESS,
      payload: {
        error: undefined as Error,
        toastMessage: undefined as string
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: DISPLAY_TOAST.FAILURE,
      payload: {
        error,
        toastMessage: undefined as string
      }
    };
  }
};
