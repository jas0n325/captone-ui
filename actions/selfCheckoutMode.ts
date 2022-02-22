import { SCOScreenKeys } from "../components/selfCheckout/common/constants";
import { defineRequestType, RequestType, StandardAction } from "./actions";


export const AUTO_MOVE_SCO_SCENE: RequestType = defineRequestType("AUTO_MOVE_SCO_SCENE");
export const RECORD_SCO_BLOCKING_BUSINESS_ERROR: RequestType = defineRequestType("RECORD_SCO_BLOCKING_BUSINESS_ERROR");
export const SET_LAST_SCO_SCENE_KEY: RequestType = defineRequestType("SET_LAST_SCO_SCENE_KEY");

export const recordSCOBlockingBusinessError = {
  request: (scoBlockingBusinessError: Error): StandardAction => {
    return {
      type: RECORD_SCO_BLOCKING_BUSINESS_ERROR.REQUEST,
      payload: { scoBlockingBusinessError }
    };
  },
  success: (): StandardAction => {
    return {
      type: RECORD_SCO_BLOCKING_BUSINESS_ERROR.SUCCESS,
      payload: { scoBlockingBusinessError: undefined }
    };
  }
};

export const setLastSCOSceneKey = {
  request: (lastSceneKey: SCOScreenKeys): StandardAction => {
    return {
      type: SET_LAST_SCO_SCENE_KEY.REQUEST,
      payload: { lastSceneKey }
    };
  }
};
