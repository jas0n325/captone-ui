import { CAMERA_SCANNER, DISPLAY_ERROR_SCANNER, HIDE_SCANNER, StandardAction } from "../actions";
import { RequestState } from "./reducers";

export interface CameraScannerState extends RequestState {
  consecutiveScanningEnabled?: boolean;
  delay?: number;
  header?: JSX.Element;
  goodIcon?: JSX.Element;
  badIcon?: JSX.Element;
  inProgress: boolean;
  errorMessage: string;
  handleHideCamera: () => void;
  translator: (key: string) => string;
}

const INITIAL_STATE: CameraScannerState = {
  consecutiveScanningEnabled: false,
  delay: 2000,
  inProgress: false,
  errorMessage: undefined,
  header: undefined,
  goodIcon: undefined,
  badIcon: undefined,
  handleHideCamera: undefined,
  translator: undefined
};

export default (state: CameraScannerState = INITIAL_STATE, action: StandardAction): CameraScannerState => {
  switch (action.type) {
    case CAMERA_SCANNER.REQUEST:
      return Object.assign({}, state, action.payload, {inProgress: true});
    case HIDE_SCANNER.REQUEST:
      return Object.assign({}, state, action.payload, {inProgress: false});
    case DISPLAY_ERROR_SCANNER.REQUEST:
      return Object.assign({}, state, action.payload);
    case DISPLAY_ERROR_SCANNER.SUCCESS:
      return Object.assign({}, state, action.payload, {errorMessage: undefined});
    default:
      return state;
  }
};
