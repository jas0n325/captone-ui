import { Money } from "@aptos-scp/scp-component-business-core";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { IValueCertificateResult } from "@aptos-scp/scp-component-store-selling-features";

export interface ValueCertificateProps {
  appLogo?: any; // Provided via this class's <Scene /> in RootContainer.tsx
  partialRedeemEnabled: boolean;
  subType?: string;
  onApply: (valueCertificate: IValueCertificateResult, tenderAmount: string) => void;
  onExit: () => void;
}

export interface IssueGiftCertificateComponentProps {
  isRefund?: boolean;
  amount?: Money;
  style?: any;
  isChange?: boolean;
  initialInputs?: UiInput[];
  onIssue: (certificateNumber: string, amount: string, inputSource: string, inputs?: UiInput[]) => void;
  onExit: () => void;
}
