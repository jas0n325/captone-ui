import {LOAD_APP_RESOURCE} from "../actions";
import {RequestState} from "./reducers";

export interface IAppResourcesState extends RequestState {
  resources?: Map<string, string>;
}

const INITIAL_STATE: IAppResourcesState = {
  resources: new Map<string, string>(),
  inProgress: false,
  error: undefined
};

export const appResources = (state: IAppResourcesState = INITIAL_STATE, action: any): IAppResourcesState => {
  switch (action.type) {
    case LOAD_APP_RESOURCE.REQUEST:
      return Object.assign({}, state, { inProgress: true });
    case LOAD_APP_RESOURCE.SUCCESS:
      const resources = new Map<string, string>(state.resources);
      resources.set(action.payload.resourceName, action.payload.resource);

      return Object.assign({}, state,{ resources, inProgress: false, error: undefined });
    case LOAD_APP_RESOURCE.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
