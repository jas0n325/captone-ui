import _ from "lodash";
import * as React from "react";
import { Alert, Keyboard } from "react-native";
import { isPhone } from "react-native-device-detection";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { Linking } from "@aptos-scp/scp-component-rn-url-linking";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  Customer,
  CUSTOMER_LIST,
  FIND_CUSTOMERS_EVENT,
  ICustomerLookup,
  ICustomerSearch
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  clearCustomer,
  clearPostVoidSearchResult,
  dataEvent,
  DataEventType,
  IDataEventData,
  lookupCustomer,
  sceneTitle,
  searchCustomer,
  updateUiMode
} from "../../actions";
import { AppState, BusinessState, DataEventState, SettingsState, UiState } from "../../reducers";
import { CountriesState } from "../../reducers/countries";
import { UI_MODE_CUSTOMER_SEARCH_SCREEN} from "../../reducers/uiState";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { getCountryName } from "./CustomerUtilities";
import { CustomerSearchScreenProps } from "./interfaces";
import CustomerSearchPhone from "./phone/CustomerSearch";
import { baseViewFill } from "./styles";
import CustomerSearchTablet from "./tablet/CustomerSearch";
import { clientelingAppUrl, ExternalClientelingAppInboundAction, buildExternalClientelingAppRequest } from "../common/utilities";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";

interface StateProps {
  settings: SettingsState;
  uiState: UiState;
  countries: CountriesState;
  incomingDataEvent: DataEventState;
  businessState: BusinessState;
}

interface DispatchProps {
  updateUiMode: ActionCreator;
  searchCustomer: ActionCreator;
  clearCustomer: ActionCreator;
  lookupCustomer: ActionCreator;
  sceneTitle: ActionCreator;
  dataEventSuccess: ActionCreator;
  clearPostVoidSearch: ActionCreator;
}

interface Props extends CustomerSearchScreenProps, StateProps, DispatchProps, NavigationScreenProps<"customer"> {}

interface State {
  chosenCustomer: Customer;
  error: string;
  noSearchOccurred: boolean;
  eventData: IDataEventData;
  addCustomer: boolean;
}

export interface SearchField {
  name: string;
  displayText?: string;
  sequence: number;
}

class CustomerSearchScreen extends React.Component<Props, State> {
  private styles: any;
  private fields: SearchField[];

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(baseViewFill());

    const customerSearch = this.props.settings.configurationManager.getFunctionalBehaviorValues()
        .customerFunctionChoices.customerSearch;

    this.styles = Theme.getStyles(baseViewFill());

    const fieldNames: string[] =
        ["lastName", "firstName", "phoneNumber", "customerNumber", "zipPostalCode", "email", "alternateKey"];
    const searchFields: SearchField[] = [];
    fieldNames.forEach((name, index) => {
      const field = customerSearch ? customerSearch[name] : undefined;
      if (field) {
        if (field.visible) {
          let displayText;
          if (field.label) {
            const labelCode = _.get(field,"label.i18nCode");
            displayText = I18n.t(labelCode, {defaultValue: _.get(field,"label.default")});
          }

          searchFields.push({ name, displayText, sequence: field.sequence || index + 999});
        }
      } else {
        searchFields.push({ name, sequence: index + 999});
      }
    });
    searchFields.sort((a, b) => {
      if (a.sequence !== b.sequence) {
        return a.sequence - b.sequence;
      } else {
        return I18n.t(a.name).localeCompare(I18n.t(b.name));
      }
    });
    this.fields = searchFields;

    this.state = {
      chosenCustomer: undefined,
      error: undefined,
      noSearchOccurred: true,
      addCustomer: false,
      eventData: undefined
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if ((this.props.incomingDataEvent.eventType === DataEventType.ScanData ||
        this.props.incomingDataEvent.eventType === DataEventType.KeyListenerData) &&
        this.props.incomingDataEvent.data) {
      this.setState({ eventData: this.props.incomingDataEvent.data });
      // Clear the props
      this.props.dataEventSuccess(this.props.incomingDataEvent, false);
    }

    if ((this.state.eventData && this.props.businessState.eventType === FIND_CUSTOMERS_EVENT &&
          !this.props.businessState.inProgress && prevProps.businessState.inProgress) ||
        (this.props.searchOccurred && this.state.noSearchOccurred)) {

      this.setState({ noSearchOccurred: false, eventData: undefined });

      const customers: Customer[] = this.props.businessState.nonContextualData.get(CUSTOMER_LIST);
      if (customers?.length === 1) {
        this.setState({ addCustomer: true}, () => {
          this.handleCustomerSelected(customers[0]);
        })
      } else {
        const customerEmail: string = customers?.length === 0 && this.props.businessState.inputs.find(
            (uiInput: UiInput) => uiInput.inputKey === "emailAddress")?.inputValue;

        if (customerEmail) {
          this.props.navigation.push("customerCreate", {
            assignCustomer: this.props.assignCustomer,
            scannedCustomerEmail: customerEmail,
            onExit: this.props.onExit
          });
        } else if (!Theme.isTablet) {
          this.showCustomerList();
        }
      }
    }
  }

  public async componentDidMount(): Promise<void> {
    this.props.updateUiMode(UI_MODE_CUSTOMER_SEARCH_SCREEN);
    if(clientelingAppUrl(this.props.settings.configurationManager) && !this.props.continueWithCustomerSearch) {
      await this.onExternalClientelingCustomerSearch();
    }
  }

  public componentWillUnmount(): void {
    if (this.props.uiState.mode === UI_MODE_CUSTOMER_SEARCH_SCREEN) {
      this.props.updateUiMode(undefined);
    }
    this.props.clearCustomer();
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        { isPhone ? this.renderPhone() : this.renderTablet() }
      </BaseView>
    );
  }

  public renderPhone(): JSX.Element {
    return (
      <CustomerSearchPhone
          isTransactionStarting={this.props.isTransactionStarting}
          assignCustomer={this.props.assignCustomer}
          hideCreateCustomer={this.props.hideCreateCustomer}
          returnMode={this.props.returnMode}
          showReturnPopup={this.props.showReturnPopup}
          searchFields={this.fields}
          onSearch={this.onSearch.bind(this)}
          onCancel={() => this.props.onCancel()}
          onExit={() => this.props.onExit()}
          onSelectCustomerCreate={() =>
            this.props.navigation.push("customerCreate", {
              assignCustomer: this.props.assignCustomer,
              onExit: this.props.onExit
            })
          }
      />
    );
  }

  public renderTablet(): JSX.Element {
    this.props.sceneTitle("customerCreate");
    return (
      <CustomerSearchTablet
          isTransactionStarting={this.props.isTransactionStarting}
          assignCustomer={this.props.assignCustomer}
          hideCreateCustomer={this.props.hideCreateCustomer}
          returnMode = {this.props.returnMode}
          showReturnPopup={this.props.showReturnPopup}
          backNavigationTitle={this.props.backNavigationTitle}
          chosenCustomer={this.state.chosenCustomer}
          addCustomer={this.state.addCustomer}
          noSearchOccurred={this.state.noSearchOccurred}
          searchFields={this.fields}
          onSearch={this.onSearch.bind(this)}
          onCancel={() => this.props.onCancel()}
          onExit={() => this.props.onExit()}
          onClearChosenCustomer={this.handleClearChosenCustomer.bind(this)}
          onCustomerSelected={this.handleCustomerSelected.bind(this)}
          navigation={this.props.navigation}
      />
    );
  }

  private onSearch(params: ICustomerSearch): void {
    this.setState({ noSearchOccurred: false });
    this.props.searchCustomer(this.props.settings.deviceIdentity, params);
    if (!Theme.isTablet) {
      this.showCustomerList();
    }
    Keyboard.dismiss();
  }

  private async onExternalClientelingCustomerSearch(): Promise<void> {
    if(getCurrentRouteNameWithNavigationRef() === "customer") {
      this.props.onExit();
    }
    const url: string = `${clientelingAppUrl(this.props.settings.configurationManager)}${
      buildExternalClientelingAppRequest(this.props.businessState, ExternalClientelingAppInboundAction.SearchForCustomer)
    }`;
    try {
      await Linking.openUrl(url, undefined, false);
    } catch (error) {
      Alert.alert(I18n.t("unableToOpen"), I18n.t("externalClientelingAppNotFoundErrorMessage"), [
        { text: I18n.t("cancel"), onPress: () => this.props.onExit()},
        { text: I18n.t("continue"), style: "cancel", onPress: () => this.onContinueCustomerSearch() }
      ], {cancelable: true});
    }
  }

  private onContinueCustomerSearch(): void {
    this.props.navigation.navigate("customer", {
      assignCustomer: this.props.assignCustomer,
      backNavigationTitle: this.props.backNavigationTitle,
      hideCreateCustomer: this.props.hideCreateCustomer,
      isTransactionStarting: this.props.isTransactionStarting,
      showReturnPopup: this.props.showReturnPopup,
      returnMode: this.props.returnMode,
      searchOccurred: this.props.searchOccurred,
      continueWithCustomerSearch: true,
      onExit: this.props.onExit,
      onCancel: this.props.onCancel
    });
  }

  private showCustomerList(): void {
    this.props.navigation.push("customerList", {
      assignCustomer: this.props.assignCustomer,
      hideCreateCustomer: this.props.hideCreateCustomer,
      returnMode: this.props.returnMode,
      onCustomerSelected: this.handleCustomerSelected.bind(this),
      onExit: () => this.props.onExit()
    });
  }

  private handleCustomerSelected(customer: Customer): void {
    // lookupCustomer call needed to retrieve additional customer information not available from the initial
    // findCustomers call, such as languagePreference, opt-in preferences, and title.
    const params: ICustomerLookup = {
      customerNumber: customer.customerNumber,
      assignCustomer: this.props.assignCustomer,
      customer
    };

    if (customer.countryCode) {
      customer.countryName = getCountryName(customer.countryCode, this.props.countries.countries);
    }

    //clear any cust transaction in state
    this.props.clearPostVoidSearch();

    this.props.lookupCustomer(this.props.settings.deviceIdentity, params);
    if (isPhone) {
      this.props.navigation.push("customerDisplay", {
        assignCustomer: this.props.assignCustomer,
        returnMode: this.props.returnMode,
        addCustomer: this.state.addCustomer,
        customer,
        onExit: this.props.onExit
      });
    } else {
      this.setState({ chosenCustomer: customer });
    }
  }

  private handleClearChosenCustomer(): void {
    this.setState({ chosenCustomer: undefined });
  }
}

function mapStateToProps(state: AppState): any {
  return {
    settings: state.settings,
    uiState: state.uiState,
    incomingDataEvent: state.dataEvent,
    countries: state.countries,
    businessState: state.businessState
  };
}

export default connect(mapStateToProps, {
  clearPostVoidSearch: clearPostVoidSearchResult.request,
  searchCustomer: searchCustomer.request,
  clearCustomer: clearCustomer.request,
  lookupCustomer: lookupCustomer.request,
  updateUiMode: updateUiMode.request,
  sceneTitle: sceneTitle.request,
  dataEventSuccess: dataEvent.success
})(withMappedNavigationParams<typeof CustomerSearchScreen>()(CustomerSearchScreen));
