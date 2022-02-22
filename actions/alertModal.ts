import { AlertOptions } from "react-native";

import { AlertModalButton } from "../components/common/AlertModal";
import { ActionCreator, defineRequestType, RequestType, StandardAction } from "./actions";

export interface AlertModalOptions extends AlertOptions {
  /**
   * Optional flag to allow the modal to be closed in favor of another modal
   */
  cancellable?: boolean;

  /**
   * Optional flag to force the buttons to render 1 per row regardless of the number
   * of buttons
   */
  renderButtonsInRows?: boolean;

  /**
   * Optional index of the button to default to if the alert is dismissed.
   * If no buttons are provided or no index provided, nothing is fired upon dismissal.
   */
  defaultButtonIndex?: number;
}

export interface AlertModalProps {
  /**
   * Title text of the alert.
   */
  title: string;

  /**
   * Optional text that supplements the title.
   */
  message?: string;

  /**
   * Optional buttons for user choice. 3 BUTTON LIMIT.
   * If no buttons are provided, a single button containing the text "ok" is displayed.
   *
   * Button ordering follows the standard react-native Alert api and works as follows...
   *   Android: All buttons are rendered right justified.
   *            When up to 2 buttons are provided, they're rendered from right to left, i.e. index 0 is right-most.
   *            When up to 2 button are provided and button text is too large, the buttons will wrap around and render
   *            one per line.
   *            When 3 buttons are provided, they are rendered one button per line, still right justified, still with
   *            text that will wrap around if need be.
   *            The "style" property on the buttons has no affect on arrangement.
   *   iOS: If 2 buttons are provided, they are rendered side by side.
   *        Default-ok-button, 1-provided-button, or 3-provided-buttons are all rendered in the 1-button-per-row style.
   *        Buttons with the style "cancel", are rendered left most in 2-provided-button scenarios and bottom
   *        most otherwise; there's no limit to the number of buttons with the "cancel" style.
   *        Buttons without the "cancel" style render left-to-right/top-to-bottom starting at index 0.
   *        Buttons with "destructive" style do not affect layout at all, the text is modified to be red.
   */
  buttons?: AlertModalButton[];

  alertModalOptions?: AlertModalOptions;
}

export type AlertRequest = (title: string, message?: string, buttons?: AlertModalButton[],
                            alertModalOptions?: AlertModalOptions) => StandardAction;

export const DISMISS_ALERT_MODAL: RequestType = defineRequestType("DISMISS_ALERT_MODAL");
export const SHOW_ALERT_MODAL: RequestType = defineRequestType("SHOW_ALERT_MODAL");

export const alert: { request: AlertRequest; success: ActionCreator } = {
  request: (title: string, message?: string, buttons?: AlertModalButton[],
            alertModalOptions?: AlertModalOptions): StandardAction => {
    return {
      type: SHOW_ALERT_MODAL.REQUEST,
      payload: { title, message, buttons, alertModalOptions } as AlertModalProps
    };
  },
  success: (): StandardAction => ({ type: SHOW_ALERT_MODAL.SUCCESS })
};

export const dismissAlertModal = {
  request: (): StandardAction => ({ type: DISMISS_ALERT_MODAL.REQUEST })
};
