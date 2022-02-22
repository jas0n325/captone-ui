import { IRetailLocation } from "@aptos-scp/scp-component-store-selling-features";

export interface TerminalConflictScreenProps {
  retailLocation: IRetailLocation;
  deviceId: string;
  onSave: () => void;
  onCancel: () => void;
}
