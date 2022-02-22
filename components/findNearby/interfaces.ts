import {
  CountryAddressFormat,
  PhoneCountryCode,
  StoreItem
} from "@aptos-scp/scp-component-store-selling-features";
import { IAddress } from "@aptos-scp/scp-types-commerce-transaction";

export interface StoreOperationDetailsScreenProps extends FindNearbyScreenProps {
  retailLocationAddress: IAddress;
  name: string;
  phoneNumbers: any;
  addressFormat: CountryAddressFormat;
  phoneFormat: PhoneCountryCode;
  hoursOfOperationKey: string;
  isVisiblePickup: boolean;
  selectedInventory?: number;
  selectedRetailLocationId?: string;
  currentRetailLocationId?: string;
}

export interface FindNearbyScreenProps {
  item: StoreItem;
}
