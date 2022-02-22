import { IDisplayInfo } from "@aptos-scp/scp-component-store-selling-features";

export interface UnavailableQuantitiesDetailScreenProps {
  displayInfo: IDisplayInfo;
  error?: string;
  onAccepted: () => void;
}
