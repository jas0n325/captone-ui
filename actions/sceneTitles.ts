import { defineRequestType, RequestType, StandardAction } from "./actions";


export const SCENE_TITLE: RequestType = defineRequestType("SCENE_TITLE");

export const sceneTitle = {
  request: (sceneKey: string, desiredTitle: string): StandardAction => {
    return {
      type: SCENE_TITLE.REQUEST,
      payload: {
        error: undefined as Error,
        sceneKey,
        desiredTitle
      }
    };
  },
  success: (): StandardAction => {
    return {
      type: SCENE_TITLE.SUCCESS,
      payload: {
        error: undefined as Error,
        sceneKey: undefined as string,
        desiredTitle: undefined as string
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: SCENE_TITLE.FAILURE,
      payload: {
        error,
        sceneKey: undefined as string,
        desiredTitle: undefined as string
      }
    };
  }
};
