import { defineRequestType, RequestType, StandardAction } from "./actions";

export const CAMERA_SCANNER: RequestType = defineRequestType("CAMERA_SCANNER");
export const HIDE_SCANNER: RequestType = defineRequestType("HIDE_SCANNER");
export const DISPLAY_ERROR_SCANNER: RequestType = defineRequestType("DISPLAY_ERROR_SCANNER");

export const showCameraScanner = {
  request: (consecutiveScanningEnabled: boolean,
            delay: number,
            header: JSX.Element,
            goodIcon: JSX.Element,
            badIcon: JSX.Element,
            handleHideCamera: () => void,
            translator: (key: string) => string): StandardAction => {
    return {
      type: CAMERA_SCANNER.REQUEST,
      payload: { consecutiveScanningEnabled, delay, header, goodIcon, badIcon, handleHideCamera, translator }
    };
  }
};

export const hideCameraScanner = {
  request: (): StandardAction => {
    return {
      type: HIDE_SCANNER.REQUEST,
      payload: undefined
    };
  }
};

export const displayErrorScanner = {
  request: (errorMessage: string): StandardAction => {
    return {
      type: DISPLAY_ERROR_SCANNER.REQUEST,
      payload: { errorMessage }
    };
  },
  success: (): StandardAction => {
    return {
      type: DISPLAY_ERROR_SCANNER.SUCCESS,
      payload: { }
    };
  }
};



