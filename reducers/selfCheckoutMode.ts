import {
  AUTO_MOVE_SCO_SCENE,
  RECORD_SCO_BLOCKING_BUSINESS_ERROR,
  SET_LAST_SCO_SCENE_KEY
} from "../actions/selfCheckoutMode";
import { SCOScreenKeys } from "../components/selfCheckout/common/constants";
import { RequestState } from "./reducers";


export interface SelfCheckoutState extends RequestState {
  scoBlockingBusinessError: Error;
  lastSceneKey: SCOScreenKeys;
}

const INITIAL_STATE: SelfCheckoutState = {
  scoBlockingBusinessError: undefined,
  lastSceneKey: undefined
};

export default (state: SelfCheckoutState = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case RECORD_SCO_BLOCKING_BUSINESS_ERROR.REQUEST:
    case RECORD_SCO_BLOCKING_BUSINESS_ERROR.SUCCESS:
    case SET_LAST_SCO_SCENE_KEY.REQUEST:
      return Object.assign({}, state, action.payload );
    case AUTO_MOVE_SCO_SCENE.REQUEST:
    default:
      return state;
  }
};
