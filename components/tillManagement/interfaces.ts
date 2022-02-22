import { Money } from "@aptos-scp/scp-component-business-core";
import { IExpectedTender } from "@aptos-scp/scp-types-commerce-transaction";

import { Denomination } from "../common/CurrencyCalculator";
import { RenderSelectOptions } from "../common/FieldValidation";

export interface ScanDrawerScreenProps {
  eventType: string;
  startup?: boolean;
  continueWithPreviousDrawer?: boolean;
  expectedAmount?: IExpectedTender[];
  previousCashDrawerKey?: string;
  previousAlternateKey?: string;
  inputSource?: string;
  isGiftCertIssue?: boolean;
  onContinue?: () => void;
  onExit?: () => void;
}

export interface TillDetailScreenProps {
  eventType: string;
  cashDrawerKey: string;
  inputSource: string;
  startup?: boolean;
  alternateKey?: string;
}

export interface CurrencyCalculatorScreenProps {
  eventType: string;
  currency: string;
  amount: CurrencyDenominator;
  onExit: (amount: CurrencyDenominator) => void;
  notes: Denomination[];
  coins: Denomination[];
}

export interface CurrencyDenominator {
  notes: Denomination[];
  coins: Denomination[];
  total: Money;
}

export interface TillSuccessScreenProps {
  eventType: string;
  startup?: boolean;
  actualAmount?: IExpectedTender[];
  cashDrawerKey?: string;
  inputSource?: string;
  alternateKey?: string;
}

export interface TillVarianceReasonScreenProps {
  eventType: string;
  reasons: RenderSelectOptions[];
  hideBackButton?: boolean;
  onSave: (comment: string, varianceReason: RenderSelectOptions) => void;
}

export interface PaidDetailScreenProps {
  eventType: string;
  cashDrawerKey: string;
  inputSource: string;
  startup?: boolean;
  alternateKey?: string;
}

export interface VarianceAmount {
  tenderName: string;
  amount: Money;
  overUnder: "over" | "under";
}

export interface TillVarianceScreenProps {
  eventType: string;
  noExpectedAmountInTillAudit: boolean;
  onTillAuditContinue: () => void;
  onProceed: () => void;
  onUpdateBalance: () => void;
  onExit: () => void;
  varianceAmounts?: Array<VarianceAmount>;
}
