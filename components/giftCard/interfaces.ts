import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { TenderAuthCategory } from "@aptos-scp/scp-component-store-selling-features";

import { ActionCreator } from "../../actions/actions";
import { RenderSelectOptions } from "../common/FieldValidation";
import { ITenderType } from "../payment/PaymentDevicesUtils";

export interface CardRedeemComponentProps {
  activeTenders: ITenderType[];
  paymentScreenIndex: string;
  remainingTenderAmount: string;
  stateValues: Map<string, any>;
  onCancel: () => void;
  tenderAuthCategory: TenderAuthCategory;
  primaryGiftDevices: RenderSelectOptions[];
  walletPaymentDevices: RenderSelectOptions[];
  useFirstDeviceOnly: boolean;
  configuration: IConfigurationManager;
  updatePendingPayment: ActionCreator;
  subType?: string;
}

export interface BalanceInquiryScreenProps {
  isGiftCardAvailable: boolean;
  isValueCertAvailable: boolean;
}

export interface IssueGiftCardComponentProps {
  isRefund?: boolean;
  isChange?: boolean;
  amount?: string;
  style?: any;
  onGCIssue: (cardNumber: string, amount: string, inputSource: string, useSwipe?: boolean,
      existingCard?: boolean) => void;
  onExit: () => void;
}
