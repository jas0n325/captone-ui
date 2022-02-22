import { LocalizableMessage } from "@aptos-scp/scp-component-business-core";

export interface VoidableErrorScreenProps {
  voidableReasonInfo: IVoidableReasonInfo;
  errorMessage?: LocalizableMessage;
  errorMessageTitle?: LocalizableMessage;
  errorMessageString?: string;
  isWarning?: boolean;
  headerTitle?: string;
  isReturnMode?: boolean;
  onOK?: () => void;
}

export interface IVoidableReasonInfo {
  reasonCode: string;
  reasonDescription: string;
}
