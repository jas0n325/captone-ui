import { OfflineReturnReference } from "@aptos-scp/scp-component-store-selling-features";

export interface ReturnWithTransactionScreenProps {
  offlineReturnReference?: OfflineReturnReference;
}

export interface ReturnWithTransactionSearchResultScreenProps {
  returning?: boolean;
  inputSource: string;
}

export interface ReturnDetailsScreenProps {
  autoMove?: boolean;
}
