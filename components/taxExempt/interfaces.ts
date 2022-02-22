import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

export interface TaxExemptComponentProps {
  onExit: () => void;
  itemLines?: IItemDisplayLine[];
  showLine?: boolean;
}

export enum MessageType {
  Info,
  Error,
  Warning
}
export interface TaxExemptMessage {
  type: MessageType;
  messages: string[];
  allowProceed: boolean;
}
