import { ModalAction as ReduxModalAction } from "redux-modal";

import { MODAL_RESOLUTION } from "../components/common/constants";

export const SHOW_MODAL = "@redux-modal/SHOW";
export const HIDE_MODAL = "@redux-modal/HIDE";
export const DESTROY_MODAL = "@redux-modal/DESTROY";

export const BLOCK_MODAL = "@redux-modal/BLOCK";
export const UNBLOCK_MODAL = "@redux-modal/UNBLOCK";

type Action = ReduxModalAction & {
  payload?: {
    resolution?: MODAL_RESOLUTION
  }
};
export type ModalAction = (modal: string, props?: any) => Action;

export type HideModalAction = (modal: string, resolution?: MODAL_RESOLUTION) => Action;

export const showModal = (modal: string, props?: any): Action =>  {
  return {
    type: SHOW_MODAL,
    payload: {
      modal,
      props
    }
  };
};

export const hideModal = (modal: string, resolution?: any): Action => {
  return {
    type: HIDE_MODAL,
    payload: {
      modal,
      resolution
    }
  };
};

export const destroyModal = (modal: string): Action => {
  return {
    type: DESTROY_MODAL,
    payload: {
      modal
    }
  };
};

export const blockModal = (): Action =>  {
  return {
    type: BLOCK_MODAL
  };
};

export const unblockModal = (): Action =>  {
  return {
    type: UNBLOCK_MODAL
  };
};
