import { FeedbackNoteType } from "../reducers/feedbackNote";
import { defineRequestType, RequestType, StandardAction } from "./actions";


export const ERROR_HEADING: RequestType = defineRequestType("ERROR_HEADING");

export const feedbackNoteAction = {
  request: (message: string, i18nCode: string, messageId?: string, messageType?: FeedbackNoteType): StandardAction => {
    return {
      type: ERROR_HEADING.REQUEST,
      payload: {
        message,
        i18nCode,
        messageId,
        messageType
      }
    };
  },
  success: (messageId?: string): StandardAction => {
    return {
      type: ERROR_HEADING.SUCCESS,
      payload: {
        messageId
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: ERROR_HEADING.FAILURE,
      payload: {
        error
      }
    };
  }
};
