import { ActionCreator } from "../../../actions";

export interface TenderChangeComponentProps {
  isFallback?: boolean;
  onExit?: () => void;
  updatePendingPayment: ActionCreator;
}
