import * as _ from "lodash";
import * as React from "react";
import { InteractionManager, Keyboard } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { IDisplayInfo, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  CollectedDataKey,
  Customer,
  I18nLocationValues,
  IItemDisplayLine,
  isTaxCustomerLine,
  ITaxCustomerLine,
  TaxCustomer,
  TaxCustomerLine,
  UiInputKey,
  VALIDATE_VAT_NUMBER_EVENT } from "@aptos-scp/scp-component-store-selling-features";
import { TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";

import {
  ActionCreator,
  businessOperation,
  clearCustomer,
  clearCustomerCreationResult,
  setIsInvoice,
  setReceiptType,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  CustomerState,
  FeedbackNoteState,
  RetailLocationsState,
  SettingsState
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationScreenProps } from "../StackNavigatorParams";
import CustomerAddUpdate, { BirthDateBehavior } from "./CustomerAddUpdate";
import { extractTaxCustomerDetailsFromTaxCustomerLine } from "./CustomerUtilities";
import { CustomerTaxInvoiceScreenProps } from "./interfaces";
import { baseViewFill } from "./styles";
import { LineType } from "@aptos-scp/scp-types-commerce-transaction";
import Orientation from "react-native-orientation-locker";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";

interface StateProps {
  displayInfo: IDisplayInfo;
  businessState: BusinessState;
  customerState: CustomerState;
  feedbackNoteState: FeedbackNoteState;
  settings: SettingsState;
  taxCustomerDetails: TaxCustomer;
  isReprintLastReceipt: boolean;
  retailLocations: RetailLocationsState;
  nonContextualData: Readonly<Map<string, any>>;
  currentScreenName: string;
  i18nLocation: string;
}

interface DispatchProps {
  clearCustomer: ActionCreator;
  clearCustomerCreationResult: ActionCreator;
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  setReceiptType: ActionCreator;
  setIsInvoice: ActionCreator;
}

interface Props extends CustomerTaxInvoiceScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"customerTaxInvoice"> {}

export interface State {
  displayInfo: IDisplayInfo;
  customerCreatedSuccessfully: boolean;
  feedbackNote: FeedbackNoteState;
  customerResult: Customer;
  taxIdentifier: string;
  taxIdentifierName: string;
  taxCode: string;
  taxCodeName: string;
  pecAddress: string;
  pecAddressName: string;
  finalAddressCode: string;
  addressCodeName: string;
  idNumber: string;
  idNumberName: string;
  ruc: string;
  rucName: string;
  returnSignatureCollected: boolean;
  isPickingUpItems: boolean;
}

class CustomerTaxInvoiceScreen extends React.Component<Props, State> {
  private customer: Customer;
  private optIns: any;
  private styles: any;
  private birthDateBehavior: BirthDateBehavior;
  private taxCustomerDetails: TaxCustomer;
  private customerDetailsConfig: any;
  private requiresOneFromEachGroup: any;

  public constructor(props: Props) {
    super(props);
    this.moveToSignatureScreen = this.moveToSignatureScreen.bind(this);
    this.customer = this.props.businessState.stateValues.get("transaction.customer") as Customer;
    if (this.props.taxCustomerDetails) {
      this.taxCustomerDetails = this.props.taxCustomerDetails;
    } else if (!this.customer && this.props.isReprintLastReceipt) {
      this.customer = this.props.businessState.lastTransactionInfo.customer as Customer;
    }
    const transactionInformationForReturn = this.props.businessState.stateValues
      .get("ItemHandlingSession.transactionInformationForReturn") && this.props.businessState.stateValues
        .get("ItemHandlingSession.transactionInformationForReturn").transaction;
    const i18nLocationValue = this.props.i18nLocation;
    if (i18nLocationValue === I18nLocationValues.Portugal) {
      if (transactionInformationForReturn && !this.customer) {
        if (transactionInformationForReturn.customer) {
          this.customer = transactionInformationForReturn.customer;
        }
        const taxCustomerLine: TaxCustomerLine = transactionInformationForReturn.lines.find(isTaxCustomerLine);
        if (taxCustomerLine) {
          this.taxCustomerDetails = extractTaxCustomerDetailsFromTaxCustomerLine(taxCustomerLine);
        }
      }
    }
    if (transactionInformationForReturn && !this.customer) {
      this.setValueOfCustomer();
    }
    this.state = {
      displayInfo: props.businessState.displayInfo,
      customerCreatedSuccessfully: false,
      feedbackNote: undefined,
      customerResult: undefined,
      taxIdentifier: undefined,
      taxIdentifierName: undefined,
      taxCode: undefined,
      taxCodeName: undefined,
      pecAddress: undefined,
      pecAddressName: undefined,
      finalAddressCode: undefined,
      addressCodeName: undefined,
      idNumber: undefined,
      idNumberName: undefined,
      ruc: undefined,
      rucName: undefined,
      returnSignatureCollected: props.businessState.stateValues.get("transaction.returnSignatureCollected"),
      isPickingUpItems: props.businessState.stateValues.has("transaction.isPickingUpItems") &&
          props.businessState.stateValues.get("transaction.isPickingUpItems")
    };

    const i18nLocation = this.props.i18nLocation;
    const countrySpecificTaxInfo = this.props.settings.configurationManager.getI18nCountryConfigValues(i18nLocation);
    const invoicingConfig = countrySpecificTaxInfo && countrySpecificTaxInfo.invoicing;

    this.requiresOneFromEachGroup = invoicingConfig && invoicingConfig.requiresOneFromEachGroup;
    this.customerDetailsConfig = invoicingConfig && invoicingConfig.customerDetails;
    const functionalBehaviorValues = this.props.settings.configurationManager.getFunctionalBehaviorValues();

    this.styles = Theme.getStyles(baseViewFill());

    const { birthDay, defaultYear } = functionalBehaviorValues.customerFunctionChoices.dateFormat;
    this.birthDateBehavior = {
      editable: true,
      dateFormat: birthDay,
      defaultYear
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress && !this.props.businessState.error) {
      if (this.props.businessState.eventType === VALIDATE_VAT_NUMBER_EVENT) {
        const isVatNumberRequired = this.props.nonContextualData.get(CollectedDataKey.VatNumberIsRequired);
        if (isVatNumberRequired) {
          this.props.saveCustomerTaxInformation(this.state.customerResult, this.state.taxIdentifier,
            this.state.taxIdentifierName, this.state.taxCode, this.state.taxCodeName, this.state.pecAddress,
            this.state.pecAddressName, this.state.finalAddressCode, this.state.addressCodeName,
            this.state.idNumber, this.state.idNumberName, this.state.ruc, this.state.rucName);
        }
      }
    }
    if (this.props.customerState.creationResult && !prevProps.customerState.creationResult) {
      if (this.props.customerState.creationResult.createdSuccessfully) {
        this.setState({ customerCreatedSuccessfully: true });
      } else {
        this.props.clearCustomerCreationResult();
      }
    }
    if (prevProps.feedbackNoteState !== this.props.feedbackNoteState && !this.props.feedbackNoteState.message) {
      // clear error heading on validation success
      this.setState({feedbackNote: undefined});
    }
  }

  public componentWillUnmount(): void {
    this.props.clearCustomer();
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <CustomerAddUpdate
            displayEmailOptIn={this.optIns && this.optIns.email || false}
            displayTextOptIn={this.optIns && this.optIns.text || false}
            displayPhoneOptIn={this.optIns && this.optIns.phone || false}
            displayMailOptIn={this.optIns && this.optIns.mail || false}
            birthDateBehavior={this.birthDateBehavior}
            editableCustomer={this.customer}
            isUpdate={false}
            createdCustomer={this.state.customerCreatedSuccessfully}
            onSave={this.onCreate.bind(this)}
            onCancel={this.onCancel.bind(this)}
            onFailedWithErrors={this.onFailed.bind(this)}
            feedbackNote={this.state.feedbackNote}
            onExit={this.props.onExit}
            displayTaxInformation={true}
            taxInvoiceButtonText={this.props.taxInvoiceButtonText}
            taxCustomerDetails={this.taxCustomerDetails}
            customerUiConfig={this.customerDetailsConfig}
            requiresOneFromEachGroup={this.requiresOneFromEachGroup}
            vatNumberRequired={this.props.vatNumberRequired}
            isRucRequired={this.props.isRucRequired}
            customerValidationDetails={this.props.customerValidationDetails}
            navigation={this.props.navigation}
        />
      </BaseView>
    );
  }

  public componentDidMount(): void {
    if (this.returnItemsRequireSignature() && !this.state.returnSignatureCollected) {
      this.handleSignature();
    }
  }

  private handleSignature(): void {
    if (!Theme.isTablet) {
      Orientation.lockToLandscapeRight();
      this.moveToSignatureScreen();
    } else if (this.props.currentScreenName === "customerTaxInvoice") {
      this.moveToSignatureScreen();
    }
  }

  private moveToSignatureScreen(): void {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.push("signatureCapture", {
        tenderLine: undefined,
        isReturnSignature: !this.state.isPickingUpItems,
        isItemPickupSignature: this.state.isPickingUpItems
      });
    });
  }

  private returnItemsRequireSignature = (): boolean => {

    const configurationManager = this.props.settings.configurationManager;
    const returnBehaviors = configurationManager.getFunctionalBehaviorValues().returnsBehaviors;
    const configReturnSignature: boolean = returnBehaviors && returnBehaviors.customerSignatureRequired;

    const result = configReturnSignature &&
    !!(this.props.displayInfo.itemDisplayLines.find((line: IItemDisplayLine) =>
        line.extendedAmountExcludingTransactionDiscounts &&
        line.lineType !== LineType.ItemCancel &&
        line.extendedAmountExcludingTransactionDiscounts.isNegative()));

    return result;
  }

  private validateVatNumberEvent = (customerType: string, vatNumber: string): void => {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_TYPE, customerType));
    uiInputs.push(new UiInput(UiInputKey.VAT_NUMBER, vatNumber));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity,
        VALIDATE_VAT_NUMBER_EVENT, uiInputs);
  }

  private onCreate(customer: Customer, taxIdentifier?: string, taxIdentifierName?: string,
                   taxCode?: string, taxCodeName?: string, pecAddress?: string, pecAddressName?: string,
                   addressCode?: string, addressCodeName?: string, idNumber?: string, idNumberName?: string,
                   ruc?: string, rucName?: string): void {
    const finalAddressCode = !addressCode ?
        (customer.countryCode && customer.countryCode === "ITA" ? "0000000" : "XXXXXXX") :
        addressCode;
    this.validateVatNumberEvent(customer.customerType, taxIdentifier);
    this.props.setIsInvoice(true);
    this.setState({
      customerResult: customer, taxIdentifier, taxIdentifierName, taxCode, taxCodeName, pecAddress,
      pecAddressName, finalAddressCode, addressCodeName, idNumber, idNumberName, ruc, rucName
    });

    Keyboard.dismiss();
  }

  private onCancel(): void {
    Keyboard.dismiss();
    const franceI18nLocation = I18nLocationValues.France;
    const i18nLocationValue = this.props.i18nLocation;
    if (i18nLocationValue === franceI18nLocation) {
      this.props.setReceiptType(undefined);
    }
    this.props.navigation.pop();
  }

  private onFailed(): void {
    if (this.props.feedbackNoteState && this.props.feedbackNoteState.message) {
      this.setState({feedbackNote: {
        message: this.props.feedbackNoteState.message,
        messageId: this.props.feedbackNoteState.messageId
      }});
    }
  }

  private setValueOfCustomer(): void {
    const transactionInformations: TransactionWithAdditionalData[] = this.props.businessState.stateValues
        .get("ItemHandlingSession.transactions");
    if (transactionInformations) {
      let matchCustomerLine: TaxCustomerLine;
      for (const transactionInformation of transactionInformations) {
        if (transactionInformation.transaction) {
          let taxCustomerLine: TaxCustomerLine = transactionInformation.transaction.lines.find(isTaxCustomerLine);
          if (!taxCustomerLine) {
            taxCustomerLine = transactionInformation.transaction.lines.find(
                (line: TaxCustomerLine) => line.lineType === LineType.CreateCustomer);
          }
          if (taxCustomerLine) {
            if (this.matchCustomer(matchCustomerLine, taxCustomerLine)) {
              matchCustomerLine = taxCustomerLine;
            } else {
              this.taxCustomerDetails = this.props.taxCustomerDetails;
              break;
            }
          }
        }
      }
      if (matchCustomerLine) {
        this.taxCustomerDetails = extractTaxCustomerDetailsFromTaxCustomerLine(matchCustomerLine);
      }
    }
  }

  private matchCustomer(firstCustomer: ITaxCustomerLine,
                        secondCustomer: ITaxCustomerLine): boolean {
    if (!firstCustomer){
      return true;
    } else {
      return firstCustomer.lastName === secondCustomer.lastName &&
          firstCustomer.firstName === secondCustomer.firstName &&
          firstCustomer.companyName === secondCustomer.companyName &&
          _.isEqual(firstCustomer.governmentTaxIdentifier,
               secondCustomer.governmentTaxIdentifier) &&
          _.isEqual(firstCustomer.ruc, secondCustomer.ruc) &&
          _.isEqual(firstCustomer.taxIdentifierCollection,
               secondCustomer.taxIdentifierCollection) &&
          _.isEqual(firstCustomer.taxCode, secondCustomer.taxCode) &&
          _.isEqual(firstCustomer.idNumber, secondCustomer.idNumber) &&
          _.isEqual(firstCustomer.pecAddress, secondCustomer.pecAddress) &&
          _.isEqual(firstCustomer.addressCode, secondCustomer.addressCode);
    }
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    displayInfo: state.businessState.displayInfo,
    businessState: state.businessState,
    customerState: state.customer,
    feedbackNoteState: state.feedbackNote,
    settings : state.settings,
    taxCustomerDetails: state.receipt && state.receipt.taxCustomer,
    isReprintLastReceipt: state.receipt && state.receipt.isReprintLastReceipt,
    nonContextualData: state.businessState.nonContextualData,
    retailLocations: state.retailLocations,
    currentScreenName: getCurrentRouteNameWithNavigationRef(),
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}
export default connect(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  clearCustomer: clearCustomer.request,
  setIsInvoice: setIsInvoice.request,
  clearCustomerCreationResult: clearCustomerCreationResult.request,
  updateUiMode: updateUiMode.request,
  setReceiptType: setReceiptType.request
})(withMappedNavigationParams<typeof CustomerTaxInvoiceScreen>()(CustomerTaxInvoiceScreen));
