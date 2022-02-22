import { hide, ModalAction } from "redux-modal";

import { DESTROY_MODAL, HIDE_MODAL, SHOW_MODAL } from "../actions";

const buffer: ModalAction[] = [];

export const modalMiddleware = (store: any) => (next: any) => (action: any) => {
  if (!(action.type === SHOW_MODAL || action.type === HIDE_MODAL || action.type === DESTROY_MODAL)) {
    return next(action);
  }

  const modalAction: ModalAction = action as ModalAction;

  const modalView = store.getState().modal[modalAction.payload.modal];

  if (modalAction.type === SHOW_MODAL) {
    // if the view is already displayed then no action is required
    if (modalView && modalView["show"]) {
      return;
    }

    buffer.push(action);

    // if there is another modal been displayed and it is cancellable, it is hidden to show the new one
    if (buffer.length > 1) {
      const { modal, props } = buffer[0].payload;

      if (!(props && props.cancellable === false)) {
        store.dispatch(hide(modal));

        return;
      }
    }

  } else if (modalAction.type === HIDE_MODAL || modalAction.type === DESTROY_MODAL) {

    if (!modalView) {
      return;
    }

    const index: number = buffer.map((e: ModalAction) => e.payload.modal).indexOf(modalAction.payload.modal);
    if (action.type === HIDE_MODAL) {
      if (!modalView["show"]) {
        return;
      }

      buffer.splice(index, 1);

      if (buffer.length && buffer.length > index) {
        const previousRequest: ModalAction = buffer[index];
        const previousModalView = store.getState().modal[previousRequest.payload.modal];

        buffer.splice(index, 1);

        if (!(previousModalView && previousModalView["show"])) {
          store.dispatch(previousRequest);
        }
      }
    } else if (index > -1) {
      // The dialog has to be hidden before it is destroyed
      return;
    }
  }

  return next(action);
};
