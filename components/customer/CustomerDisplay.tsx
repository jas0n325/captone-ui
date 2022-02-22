import _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";

import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  ASSIGN_CUSTOMER_EVENT,
  CollectedDataKey,
  Customer,
  ENROLL_CUSTOMER_EVENT,
  getAddressFormatorDefault,
  getDefaultPhoneFormat,
  I18nLocationValues,
  ICustomerLookup,
  REMOVE_CUSTOMER_EVENT,
  SEARCH_HISTORICAL_TRANSACTIONS_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { CustomerType, MerchandiseTransactionTradeType } from "@aptos-scp/scp-types-commerce-transaction";
import { AttributeGroupDefinitionList } from "@aptos-scp/scp-types-customer";

import {
  ActionCreator,
  businessOperation,
  clearCustomer,
  getHistoricalTransaction,
  getRetailLocationsAction,
  lookupCustomer,
  updateCustomer,
  updateUiMode
} from "../../actions";
import { AppState, BusinessState, CustomerState, RetailLocationsState, SettingsState, TransactionsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { promptToAssignCustomer } from "../common/utilities";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { NavigationProp } from "../StackNavigatorParams";
import { filterAttributeGroupDefinitions, loadAttributeDefinitions, loadLanguages} from "./CustomerUtilities";
import { CustomerDisplayProps } from "./interfaces";
import CustomerDisplayPhone from "./phone/CustomerDisplay";
import { customerDisplayScreenStyle } from "./styles";
import CustomerDisplayTablet from "./tablet/CustomerDisplay";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.customer.CustomerDisplayScreen");

interface StateProps {
  settings: SettingsState;
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
  transactionState: TransactionsState;
  retailLocationsState: RetailLocationsState;
  currentScreenName: string;
  customerState: CustomerState;
  i18nLocation: string
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateCustomer: ActionCreator;
  updateUiMode: ActionCreator;
  getRetailLocations: ActionCreator;
  getHistoricalTransaction: ActionCreator;
  clearCustomer: ActionCreator;
  lookupCustomer: ActionCreator;
}

interface Props extends CustomerDisplayProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  languages: any;
  attributeDefs: AttributeGroupDefinitionList;
  inProgress: boolean;
  displayEnrollmentButton: boolean;
}

class CustomerDisplay extends React.Component<Props, State> {
  private styles: any;
  private searchResponseIncludesFullTransaction: boolean;
  private disableCustomerButton: boolean;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(customerDisplayScreenStyle());
    this.disableCustomerButton = false;

    this.props.businessState.nonContextualData.set(CollectedDataKey.AssignCustomer, props.assignCustomer);

    const functionalBehaviors = this.props.settings.configurationManager.getFunctionalBehaviorValues();
    this.searchResponseIncludesFullTransaction = _.get(functionalBehaviors,
        "serviceBehaviors.transactionHistory.searchResponseIncludesFullTransaction", true);

    this.state = {
      attributeDefs: undefined,
      languages: undefined,
      inProgress: false,
      displayEnrollmentButton: true
    };
  }

  public async componentDidMount(): Promise<void> {
    if (this.props.customer && this.props.addCustomer) {
      this.onAssignRemove();
    } else {
      try {
        const languages = await loadLanguages(this.props.settings.diContainer);
        this.setState({ languages });
      } catch (error) {
        throw logger.throwing(error, "loadCustomerLanguages", LogLevel.WARN);
      }

      try {
        this.props.getRetailLocations();
      } catch (error) {
        throw logger.throwing(error, "getRetailLocations", LogLevel.WARN);
      }

      try {
        const hiddenAttributeGroupCodes: string[] =
            _.get(this.props.settings.configurationManager.getFunctionalBehaviorValues().
                customerFunctionChoices, "customerProfile.attributes.hiddenAttributeGroupCodes", []);

        const attributeDefs =  await loadAttributeDefinitions(this.props.settings.diContainer);
        if (attributeDefs?.data) {
          filterAttributeGroupDefinitions(attributeDefs, hiddenAttributeGroupCodes);
          this.setState({ attributeDefs });
        }
      } catch (error) {
        throw logger.throwing(error, "loadAttributeDefinitions", LogLevel.WARN);
      }
    }

    if (this.currentCustomer?.offline) {
      const params: ICustomerLookup = {
        customerNumber: this.currentCustomer.customerNumber
      };
      // The assigned customer was added while offline
      // perform an additional lookup to attempt to retrieve full customer details
      this.props.lookupCustomer(this.props.settings.deviceIdentity, params);
    }
  }

  public componentWillUnmount(): void {
    this.props.clearCustomer();
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (this.state.inProgress && !this.props.businessState.inProgress && prevProps.businessState.inProgress &&
        !this.props.businessState.error) {
      this.setState({ inProgress: false }, () => {
        this.props.businessState.nonContextualData.delete(CollectedDataKey.AssignCustomer);
        this.props.onExit();
      });
    }

    //Determine if enrollment button should be available
    const displayEnrollmentButton = this.currentCustomer && !_.isEmpty(this.currentCustomer.availableLoyaltyPlans);
    if (prevState.displayEnrollmentButton !== displayEnrollmentButton) {
      this.setState({displayEnrollmentButton});
    }
  }

  public render(): JSX.Element {
    const customer: Customer = this.currentCustomer;

    //get config setting to determine if attributes should be displayed
    const displayAttributes = _.get(this.props.settings.configurationManager.getFunctionalBehaviorValues().
        customerFunctionChoices, "customerProfile.attributes.visible", true);

    const displayLoyalty = this.shouldDisplayLoyalty(customer);

    const displayLoyaltyIndicator = _.get(this.props.settings.configurationManager.getFunctionalBehaviorValues().
        customerFunctionChoices, "customerProfile.displayLoyaltyIndicator", true);

    const displayTransHistory = _.get(this.props.settings.configurationManager.getFunctionalBehaviorValues().
        customerFunctionChoices, "customerProfile.purchaseHistory.visible", false) === true;
    this.disableRemoveCustomerButton(customer);

    return (
      <BaseView style={this.styles.root}>
        {!Theme.isTablet && customer &&
          <CustomerDisplayPhone
            assignCustomer={!!(this.props.customer)}
            customer={customer}
            returnMode={this.props.returnMode}
            languages={this.state.languages}
            onAssignRemove={this.onAssignRemove.bind(this)}
            onExit={this.props.onExit}
            phoneFormat={
              getDefaultPhoneFormat(this.props.settings.configurationManager, customer.phoneCountryCode,
                  this.props.i18nLocation)}
            addressFormat={
              getAddressFormatorDefault(this.props.settings.configurationManager, customer.countryCode,
                  this.props.i18nLocation)}
            attributeDefs={displayAttributes ? this.state.attributeDefs : undefined}
            businessState={this.props.businessState}
            displayLoyalty={displayLoyalty}
            displayLoyaltyEnrollButton={this.state.displayEnrollmentButton}
            displayLoyaltyIndicator={displayLoyaltyIndicator}
            displayTransHistory={displayTransHistory}
            onSubmitLoyaltyEnrollment={this.loyaltyEnrollment.bind(this)}
            onFindCustomerTransactions={this.findCustomerTransactions.bind(this)}
            transactions={this.props.transactionState.transactions}
            selectedTransaction={this.props.transactionState.selectedTransaction}
            retailLocations={this.props.retailLocationsState.retailLocations}
            parentScene={this.props.currentScreenName}
            getHistoricalTransaction={this.props.getHistoricalTransaction.bind(this)}
            searchResponseIncludesFullTransaction={this.searchResponseIncludesFullTransaction}
            disableCustomerButton={this.disableCustomerButton}
            navigation={this.props.navigation}
            customerState={this.props.customerState}
          />
        }
        {Theme.isTablet && customer &&
          <CustomerDisplayTablet
            assignCustomer={!!(this.props.customer)}
            customer={customer}
            returnMode={this.props.returnMode}
            previewMode={this.props.previewMode}
            languages={this.state.languages}
            onAssignRemove={this.onAssignRemove.bind(this)}
            onClearChosenCustomer={this.props.onClearChosenCustomer}
            onExit={this.props.onExit}
            phoneFormat={
               getDefaultPhoneFormat(this.props.settings.configurationManager, customer.phoneCountryCode,
                  this.props.i18nLocation)}
            addressFormat={
              getAddressFormatorDefault(this.props.settings.configurationManager, customer.countryCode,
                  this.props.i18nLocation)}
            attributeDefs={displayAttributes ? this.state.attributeDefs : undefined}
            businessState={this.props.businessState}
            displayLoyalty={displayLoyalty}
            displayLoyaltyEnrollButton={this.state.displayEnrollmentButton}
            displayLoyaltyIndicator={displayLoyaltyIndicator}
            displayTransHistory={displayTransHistory}
            onSubmitLoyaltyEnrollment={this.loyaltyEnrollment.bind(this)}
            onFindCustomerTransactions={this.findCustomerTransactions.bind(this)}
            transactions = {this.props.transactionState.transactions}
            selectedTransaction = {this.props.transactionState.selectedTransaction}
            retailLocations = {this.props.retailLocationsState.retailLocations}
            parentScene={this.props.currentScreenName}
            getHistoricalTransaction={this.props.getHistoricalTransaction.bind(this)}
            searchResponseIncludesFullTransaction={this.searchResponseIncludesFullTransaction}
            navigation={this.props.navigation}
            customerState={this.props.customerState}
          />
        }
      </BaseView>
    );
  }

  private disableRemoveCustomerButton(customer: Customer): void {
    const i18nLocationValue = this.props.i18nLocation;
    if (i18nLocationValue === I18nLocationValues.Peru) {
      const uiInputs: UiInput[] = this.props.businessState.inputs;
      const originalTransactionInput: UiInput = uiInputs && uiInputs.find((uiInput: UiInput) =>
        uiInput.inputKey === UiInputKey.RETRIEVED_TRANSACTION);
      const originalTransaction = originalTransactionInput?.inputValue;
      const originalCustomer = originalTransaction?.customer;
      if (originalCustomer && originalCustomer.customerNumber) {
        this.disableCustomerButton = true;
      }
    }
  }

  private get currentCustomer(): Customer {
    return this.props.customerState.customer || this.props.customer || this.props.businessState.stateValues.get("transaction.customer");
  }

  private shouldDisplayLoyalty(customer: Customer): boolean {
    const loyaltyDisplay = _.get(this.props.settings.configurationManager.getFunctionalBehaviorValues().
        customerFunctionChoices, "customerProfile.loyaltyDisplay", "MembersOnly");
    return loyaltyDisplay === "Always" ||
        loyaltyDisplay === "MembersOnly" && customer && customer.loyaltyMemberships &&
        customer.loyaltyMemberships.length > 0;
  }
  private loyaltyEnrollment(loyaltyPlanKey: string, membershipTypeKey: string, emailAddress?: string): void {
    const uiInputs: UiInput[] = [];
    if (emailAddress) {
      uiInputs.push(new UiInput(UiInputKey.CUSTOMER_OLD, this.currentCustomer));
      uiInputs.push(new UiInput(UiInputKey.CUSTOMER, Object.assign({}, this.currentCustomer, {emailAddress})));
    }
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, this.currentCustomer.customerNumber));
    uiInputs.push(new UiInput(UiInputKey.LOYALTY_PLAN_KEY, loyaltyPlanKey));
    uiInputs.push(new UiInput(UiInputKey.MEMBERSHIP_TYPE_KEY, membershipTypeKey));
    this.performBusinessOperation(ENROLL_CUSTOMER_EVENT, uiInputs);
  }

  private onAssignRemove(): void {
    const eventType: string = this.props.customer ? ASSIGN_CUSTOMER_EVENT : REMOVE_CUSTOMER_EVENT;
    const uiInputs: UiInput[] = [];
    if (this.props.customer) {
      if (this.props.customer.countryName) {
        uiInputs.push(new UiInput(UiInputKey.COUNTRY_NAME, this.props.customer.countryName));
      }
      uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, this.props.customer.customerNumber));
      uiInputs.push(new UiInput(UiInputKey.CUSTOMER, this.currentCustomer));
    }

    const selectedCustomer = this.currentCustomer;
    const doPromptForLottery = !!(this.props.businessState && this.props.businessState.stateValues &&
        this.props.businessState.stateValues.get("transaction.taxLotteryCustomerCode") &&
        selectedCustomer && selectedCustomer.customerType === CustomerType.Business);
    this.setState({ inProgress: true }, () => {
      const customerBusinessOperation =
          () => this.performBusinessOperation(eventType, uiInputs);
      promptToAssignCustomer(customerBusinessOperation, doPromptForLottery);
    });
  }

  private performBusinessOperation(eventType: string, inputs: UiInput[]): void {
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, eventType, inputs);
  }

  private findCustomerTransactions(): void {
    const uiInputs: UiInput[] = [];
    //Retail transactions of following trade types will be included in the response
    const tradeTypes = MerchandiseTransactionTradeType.Sale + "," + MerchandiseTransactionTradeType.Exchange + "," +
        MerchandiseTransactionTradeType.Return;
    uiInputs.push(new UiInput("customerNumber", this.currentCustomer.customerNumber));
    uiInputs.push(new UiInput("tradeTypes", tradeTypes));
    this.props.performBusinessOperation(this.props.deviceIdentity, SEARCH_HISTORICAL_TRANSACTIONS_EVENT, uiInputs);
  }

}

function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings,
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity,
    transactionState: state.transactions,
    retailLocationsState: state.retailLocations,
    currentScreenName: getCurrentRouteNameWithNavigationRef(),
    customerState: state.customer,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  updateCustomer: updateCustomer.request,
  updateUiMode: updateUiMode.request,
  getRetailLocations: getRetailLocationsAction.request,
  getHistoricalTransaction: getHistoricalTransaction.request,
  clearCustomer: clearCustomer.request,
  lookupCustomer: lookupCustomer.request
})(CustomerDisplay);
