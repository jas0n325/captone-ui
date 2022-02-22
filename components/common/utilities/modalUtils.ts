import { ModalState } from "../../../reducers";
import { MANAGER_APPROVAL_MODAL, MODAL_RESOLUTION } from "../constants";

export function isManagerApprovalModalCancelled(prevModalState: ModalState, currentModalState: ModalState): boolean {
  return prevModalState[MANAGER_APPROVAL_MODAL]?.show &&
      !currentModalState[MANAGER_APPROVAL_MODAL]?.show &&
      currentModalState[MANAGER_APPROVAL_MODAL].resolution === MODAL_RESOLUTION.CANCELLED;
}
