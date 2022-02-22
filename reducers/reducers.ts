import { RequestType, StandardAction } from "../actions";

/**
 * Tracks the status of an asynchronous request.
 */
export interface RequestState {
  /**
   * The request is in progress.
   */
  inProgress?: boolean;

  /**
   * The request has completed successfully.
   */
  succeeded?: boolean;

  /**
   * The last error.
   */
  error?: Error;
}

/**
 * This is an experimental approach to a generic reducer for a request-response pattern of actions that
 * results in some entity being set in state or a failure.
 * @param requestType
 * @param initialState
 * @returns {(state:T, action:Action)=>T}
 */
export function createRequestReducer<T>(requestType: RequestType, initialState: T): any {
  return (state: T = initialState, action: StandardAction): T => {
    switch (action.type) {
      case requestType.REQUEST:
        return Object.assign({}, state, { inProgress: true, succeeded: false, error: undefined });
      case requestType.SUCCESS:
        return Object.assign({}, state, action.payload, { inProgress: false, succeeded: true });
      case requestType.FAILURE:
        return Object.assign({}, state, action.payload, { inProgress: false, succeeded: false });
      default:
        return state;
    }
  };
}
