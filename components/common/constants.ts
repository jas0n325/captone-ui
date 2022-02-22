import { TextStyle, ViewStyle } from "react-native";

export type StyleGroup = ViewStyle & TextStyle;

export type StyleGroupProp = StyleGroup & StyleGroup[];

// Replaces the properties of interface OriginalType and replaces them with properties from Modifier
export type Modify<OriginalType, Modifier> = Omit<OriginalType, keyof Modifier> & Modifier;

export const LOADING_MODAL = "Loading";
export const MANAGER_APPROVAL_MODAL = "ManagerApproval";
export const RETRY_VOID_AS_REFUND_MODAL = "RetryVoidAsRefundModal";
export const ERROR_MESSAGE_MODAL = "ErrorMessage";
export const SUSPEND_TRANSACTION_MODAL = "SuspendTransaction";

export enum MODAL_RESOLUTION {
  CANCELLED = "CANCELLED"
}

export interface IconType {
  position?: "left" | "right";
  color?: string;
  size?: number;
  icon: string;
  style?: ViewStyle;
}
