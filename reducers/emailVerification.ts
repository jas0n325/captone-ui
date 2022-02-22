import { EMAIL_VERIFICATION_WARNING } from "../actions";
import { RequestState } from "./reducers";


export interface IEmailVerificationState extends RequestState {
  message?: string;
}

const INITIAL_STATE: IEmailVerificationState = {
  message: undefined
};

export default (state: IEmailVerificationState = INITIAL_STATE, action: any): IEmailVerificationState => {
  switch (action.type) {
    case EMAIL_VERIFICATION_WARNING.REQUEST:
      return Object.assign({}, state, action.payload);
    case EMAIL_VERIFICATION_WARNING.SUCCESS:
      return Object.assign({}, state, action.payload);
    case EMAIL_VERIFICATION_WARNING.FAILURE:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
