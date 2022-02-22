import { SettingsState } from "../../reducers/settings";

export interface OrderInquiryScreenProps {
  orderReferenceId?: string;
  parentScene?: string;
  isCustomerHistory?: boolean;
}

export interface OrderInquiryDetailScreenProps {
  orderReferenceId: string;
  settings: SettingsState;
  isCustomerOrder: boolean;
  onExit: () => void;
  isCustomerHistory?: boolean;
}
