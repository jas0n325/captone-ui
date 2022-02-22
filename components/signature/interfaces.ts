import { ITenderDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

export interface SignatureCaptureScreenProps {
  tenderLine: ITenderDisplayLine;
  isReturnSignature?: boolean;
  isItemPickupSignature?: boolean;
}
