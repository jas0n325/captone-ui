import { ERROR_HEADING } from "../actions";
import { RequestState } from "./reducers";


export interface FeedbackNoteState extends RequestState {
  message?: string;
  i18nCode?: string;
  messageId?: string;
  messageType?: FeedbackNoteType;
  feedBackNotes?: Map<string, any>;
}

export enum FeedbackNoteType {
  Error = "Error",
  Info = "Info",
  Warning = "Warning",
  Notification = "Notification"
}

const INITIAL_STATE: FeedbackNoteState = {
  message: undefined,
  messageId: undefined,
  feedBackNotes: new Map<string, any>()
};

const DEFAULT_MESSAGE_ID = "DefaultMessageId";

export default (state: FeedbackNoteState = INITIAL_STATE, action: any): FeedbackNoteState => {
  const messageId = action.payload?.messageId || DEFAULT_MESSAGE_ID;
  const currState: FeedbackNoteState = state;
  switch (action.type) {
    case ERROR_HEADING.REQUEST:
      currState.feedBackNotes.set(messageId, action.payload);
      return Object.assign({}, currState, action.payload);
    case ERROR_HEADING.SUCCESS:
      if (!action.payload?.mesageId) {
        currState.feedBackNotes.clear();
      } else {
        currState.feedBackNotes.delete(messageId);
      }
      return Object.assign({}, currState.feedBackNotes.size > 0 ? currState : INITIAL_STATE, action.payload);
    case ERROR_HEADING.FAILURE:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
