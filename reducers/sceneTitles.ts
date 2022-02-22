import { SCENE_TITLE } from "../actions";
import { RequestState } from "./reducers";


export interface SceneTitlesState extends RequestState {
  sceneTitles: Map<string, string>;
}

const INITIAL_STATE: SceneTitlesState = {
  sceneTitles: new Map<string, string>()
};

const alterSceneTitles = (previousTitles: Map<string, string>, sceneKey: string, title: string): SceneTitlesState => {
  return {
    sceneTitles: new Map<string, string>(previousTitles).set(sceneKey, title)
  };
};

export default (state: SceneTitlesState = INITIAL_STATE, action: any): SceneTitlesState => {
  switch (action.type) {
    case SCENE_TITLE.REQUEST:
      return Object.assign({}, state, alterSceneTitles(
        state.sceneTitles,
        action.payload.sceneKey,
        action.payload.desiredTitle
      ));
    case SCENE_TITLE.SUCCESS:
    case SCENE_TITLE.FAILURE:
      return state;
    default:
      return state;
  }
};
