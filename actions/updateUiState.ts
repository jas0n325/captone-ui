import {NativeScrollEvent, NativeSyntheticEvent} from "react-native";

import { IFeatureActionButtonProps } from "../components/common/utilities";
import { ActionCreator, defineRequestType, RequestType, StandardAction } from "./actions";

export const UPDATE_FEATURE_ACTION_BUTTONS = defineRequestType("UPDATE_FEATURE_ACTION_BUTTONS");

export const UPDATE_UI_STATE: RequestType = defineRequestType("UPDATE_UI_STATE");
export const UPDATE_UI_MODE: RequestType = defineRequestType("UPDATE_UI_MODE");

export const SCROLL_UPDATE = defineRequestType("SCROLL_UPDATE");
export const SCROLL_EVENT_THROTTLE = 160;

export interface ScrollableAwareComponent {
  scrollUpdate: ActionCreator;
}

export const onScrollListener = (component: ScrollableAwareComponent): {
  scrollEventThrottle: number, onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
} =>  {
  return {
    scrollEventThrottle: SCROLL_EVENT_THROTTLE,
    onScroll: component.scrollUpdate
  };
};

export const updateEnabledFeatureActionButtons = {
  request: (featureActionButtonProps: IFeatureActionButtonProps) => {
    return {
      type: UPDATE_FEATURE_ACTION_BUTTONS.REQUEST,
      payload: { featureActionButtonProps }
    };
  }
};

export const updateUiState = {
  request: (logicalState: string, events: ReadonlyArray<string>, mode: string):
    StandardAction => {

    return {
      type: UPDATE_UI_STATE.REQUEST,
      payload: {
        logicalState,
        events,
        mode
      }
    };
  },
  success: (logicalState: string, events: string[], mode: string):
    StandardAction => {

    return {
      type: UPDATE_UI_STATE.SUCCESS,
      payload: {
        logicalState,
        events,
        mode,
        error: undefined
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: UPDATE_UI_STATE.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const updateUiMode = {
  request: (mode: string):
    StandardAction => {

    return {
      type: UPDATE_UI_MODE.REQUEST,
      payload: {
        mode
      }
    };
  },
  success: (mode: string):
    StandardAction => {

    return {
      type: UPDATE_UI_MODE.SUCCESS,
      payload: {
        mode,
        error: undefined
      }
    };
  },
  failure: (mode: string, error: Error): StandardAction => {
    return {
      type: UPDATE_UI_MODE.FAILURE,
      payload: {
        mode,
        error
      }
    };
  }
};

export const scrollUpdate = {
  request: (scrollEvent: NativeSyntheticEvent<NativeScrollEvent>):
      StandardAction => {
    return {
      type: SCROLL_UPDATE.REQUEST,
      payload: {
        contentOffset: scrollEvent && scrollEvent.nativeEvent && scrollEvent.nativeEvent.contentOffset
      }
    };
  }
};
