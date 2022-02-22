import { BLOCK_MODAL, DESTROY_MODAL, HIDE_MODAL, SHOW_MODAL, UNBLOCK_MODAL } from "../actions";
import { MODAL_RESOLUTION } from "../components/common/constants";

export interface ModalState {
  blocked: boolean;
  [modal: string]: any;
}

const INITIAL_STATE: ModalState = {
  blocked: false
};

export default (state: ModalState = INITIAL_STATE, action: any): ModalState => {
  const payload: {modal: string; props?: any; resolution?: MODAL_RESOLUTION;} = action.payload;
  switch (action.type) {
    case SHOW_MODAL:
    case HIDE_MODAL:
    case DESTROY_MODAL:
      const object = {};
      object[payload.modal] = {
        show: action.type === SHOW_MODAL,
        props: payload.props,
        resolution: payload.resolution
      };
      return Object.assign({}, state, object);
    case BLOCK_MODAL:
      return Object.assign({}, state, { blocked: true });
    case UNBLOCK_MODAL:
      return Object.assign({}, state, { blocked: false });
    default:
      return state;
  }
};
