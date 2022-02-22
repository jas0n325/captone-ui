import { defineRequestType, RequestType, StandardAction } from "./actions";


export const EMAIL_VERIFICATION_WARNING: RequestType = defineRequestType("EMAIL_VERIFICATION_WARNING");

export const emailVerificationWarningAction = {
  request: (message: string): StandardAction => {
    return {
      type: EMAIL_VERIFICATION_WARNING.REQUEST,
      payload: {
        message
      }
    };
  },
  success: (message: string): StandardAction => {
    return {
      type: EMAIL_VERIFICATION_WARNING.SUCCESS,
      payload: {
        message
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: EMAIL_VERIFICATION_WARNING.FAILURE,
      payload: {
        error
      }
    };
  }
};
