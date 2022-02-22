import { Container } from "inversify";
import { TextStyle, ViewStyle } from "react-native";

import {
  Customer,
  ICustomerAttributeOptions,
  IServiceCustomerAttribute,
  PhoneCountryCode
} from "@aptos-scp/scp-component-store-selling-features";
import {
  AttributeGroupDefinition,
  AttributeGroupDefinitionList
} from "@aptos-scp/scp-types-customer";

import { BusinessState } from "../../reducers/businessState";
import { ICustomerValidation } from "../common/utilities/utils";

export interface CustomerSearchScreenProps {
  assignCustomer?: boolean;
  backNavigationTitle?: string;
  hideCreateCustomer?: boolean;
  isTransactionStarting?: boolean;
  showReturnPopup?: boolean;
  returnMode?: boolean;
  searchOccurred?: boolean;
  continueWithCustomerSearch?: boolean;
  onExit: () => void;
  onCancel: () => void;
}

export interface CustomerResultsProps {
  assignCustomer?: boolean;
  hideCreateCustomer?: boolean;
  chosenCustomer?: Customer;
  noSearchOccurred?: boolean;
  returnMode?: boolean;
  onCustomerSelected: (customer: Customer) => void;
  onExit: () => void;
}

export interface CustomerCreateScreenProps {
  assignCustomer?: boolean;
  scannedCustomerEmail?: string;
  continueWithNewCustomer?: boolean;
  onExit: () => void;
}

export interface CustomerNipScreenProps {
  onContinue: () => void;
  onCancel: () => void;
}

export interface CustomerTaxInvoiceScreenProps {
  assignCustomer?: boolean;
  onExit: () => void;
  taxInvoiceButtonText: string;
  saveCustomerTaxInformation: (
    customer: Customer,
    taxIdentifier: string,
    taxIdentifierName: string,
    taxCode: string,
    taxCodeName: string,
    pecAddress: string,
    pecAddressName: string,
    addressCode: string,
    addressCodeName: string,
    idNumber: string,
    idNumberName: string,
    ruc: string,
    rucName: string
  ) => void;
  vatNumberRequired?: boolean;
  isRucRequired?: boolean;
  customerValidationDetails?: ICustomerValidation;
}

export interface CustomerUpdateScreenProps {
  assignCustomer?: boolean;
  continueWithCustomerEdit?: boolean;
  onExit: () => void;
}

export interface CustomerDisplayProps {
  customer?: Customer; // From customer search selection -- indicates action assign
  assignCustomer?: boolean;
  previewMode?: boolean;
  addCustomer?: boolean;
  returnMode?: boolean;
  onClearChosenCustomer?: () => void;
  onExit: () => void;
}

export interface PhoneCountryCodeScreenProps {
  onCancel: () => void;
  onSelection: (phoneCountryCode: PhoneCountryCode) => void;
  selectedValue: PhoneCountryCode;
}

export interface AttributeGroupCodeScreenProps {
  onCancel: () => void;
  onSelection: (attributeGroupDef: AttributeGroupDefinition) => void;
  selectedValue?: AttributeGroupDefinition;
  customerAttributes: IServiceCustomerAttribute[];
  attributeGroupDefs: AttributeGroupDefinitionList;
  preferredLanguage: string;
}

export interface CustomerAttributeEditorScreenProps {
  onCancel: () => void;
  onAdd: (customerAttribute: IServiceCustomerAttribute) => void;
  styles?: any;
  custAttribute: IServiceCustomerAttribute;
  attributeDefs: AttributeGroupDefinitionList;
  businessState?: BusinessState;
  isUpdate: boolean;
}

export interface AddressSearchScreenProps {
  country: ICustomerAttributeOptions;
  onSelectAddressDropdown: (item: string) => void;
  placeholder: string;
  actionInputBoxStyle: TextStyle;
  address1Change: (address: string, updatedAddress: string) => void;
  preventAddressPage: (preventAddressPage: boolean) => void;
  diContainer: Container;
  subtitleArea: ViewStyle;
  subtitleText: ViewStyle;
  isTaxInfo: boolean;
  onCancel: () => void;
  debounce: (
    fn: (text: string) => void,
    delay: number
  ) => (text: string) => void;
  isUpdate: boolean;
}
