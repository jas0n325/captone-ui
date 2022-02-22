import _ from "lodash";
import * as React from "react";
import { isPhone } from "react-native-device-detection";
import { connect } from "react-redux";

import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  ASSIGN_CUSTOMER_EVENT,
  Customer,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import { ActionCreator, businessOperation } from "../../actions";
import {
  AppState,
  BusinessState,
  CustomerState,
  SettingsState
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationProp } from "../StackNavigatorParams";
import { SingleResultBehavior } from "./CustomerUtilities";
import { CustomerResultsProps } from "./interfaces";
import CustomerResultsPhone from "./phone/CustomerResults";
import { baseViewFill } from "./styles";
import CustomerResultsTablet from "./tablet/CustomerResults";

interface StateProps {
  businessState: BusinessState;
  customerState: CustomerState;
  settings: SettingsState;
  i18nLocation: string;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface Props extends CustomerResultsProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  inProgress: boolean;
}

class CustomerResults extends React.Component<Props, State> {
  private styles: any;
  private customerSearchConfig: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(baseViewFill());

    this.customerSearchConfig =
      this.props.settings.configurationManager.getFunctionalBehaviorValues().customerFunctionChoices.customerSearch;

    this.state = {
      inProgress: false
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (
      !this.props.customerState.inProgress &&
      prevProps.customerState.inProgress
    ) {
      if (
        this.props.customerState.customers &&
        this.props.customerState.customers.length === 1 &&
        this.customerSearchConfig &&
        this.customerSearchConfig.singleResultBehavior
      ) {
        if (
          this.customerSearchConfig.singleResultBehavior ===
          SingleResultBehavior.SearchResults
        ) {
          if (Theme.isTablet) {
            this.props.onCustomerSelected(
              this.props.customerState.customers[0]
            );
          }
        } else if (
          this.customerSearchConfig.singleResultBehavior ===
          SingleResultBehavior.Profile
        ) {
          this.props.onCustomerSelected(this.props.customerState.customers[0]);
          if (Theme.isTablet) {
            this.props.navigation.push("customerPreviewDisplay", {
              previewMode: true,
              customer: this.props.customerState.customers[0],
              onExit: this.props.onExit
            });
          }
        } else if (
          this.customerSearchConfig.singleResultBehavior ===
          SingleResultBehavior.AssignToBasket
        ) {
          const uiInputs: UiInput[] = [];
          uiInputs.push(
            new UiInput(
              UiInputKey.CUSTOMER_NUMBER,
              this.props.customerState.customers[0].customerNumber
            )
          );
          this.setState({ inProgress: true }, () =>
            this.props.performBusinessOperation(
              this.props.settings.deviceIdentity,
              ASSIGN_CUSTOMER_EVENT,
              uiInputs
            )
          );
        }
      }
    }
    if (
      this.state.inProgress &&
      !this.props.businessState.inProgress &&
      prevProps.businessState.inProgress &&
      !this.props.businessState.error &&
      this.customerSearchConfig &&
      this.customerSearchConfig.singleResultBehavior ===
        SingleResultBehavior.AssignToBasket
    ) {
      this.props.onExit();
      this.setState({ inProgress: false });
    }
  }

  public render(): JSX.Element {
    const customerLookupInProgress: boolean =
      this.props.customerState.inProgress;
    const customerLookupFailed: boolean =
      !customerLookupInProgress &&
      !!(
        this.props.customerState.error ||
        this.props.customerState.customers.length === 0
      );
    if (isPhone) {
      return (
        <BaseView style={this.styles.fill}>
          <CustomerResultsPhone
            assignCustomer={this.props.assignCustomer}
            hideCreateCustomer={this.props.hideCreateCustomer}
            returnMode={this.props.returnMode}
            customerLookupFailed={customerLookupFailed}
            customerLookupInProgress={customerLookupInProgress}
            customerState={this.props.customerState}
            onCustomerSelected={(customer: Customer) =>
              this.props.onCustomerSelected(customer)
            }
            onExit={() => this.props.onExit()}
            configurationManager={this.props.settings.configurationManager}
            showCustomerLoyaltyIndicator={this.showCustomerLoyaltyIndicator.bind(
              this
            )}
            navigation={this.props.navigation}
            i18nLocation={this.props.i18nLocation}
          />
        </BaseView>
      );
    } else {
      return (
        <BaseView style={this.styles.fill}>
          <CustomerResultsTablet
            assignCustomer={this.props.assignCustomer}
            chosenCustomer={this.props.chosenCustomer}
            customerLookupFailed={customerLookupFailed}
            customerLookupInProgress={customerLookupInProgress}
            customerState={this.props.customerState}
            noSearchesOccurred={this.props.noSearchOccurred}
            onCustomerSelected={this.props.onCustomerSelected}
            configurationManager={this.props.settings.configurationManager}
            showCustomerLoyaltyIndicator={this.showCustomerLoyaltyIndicator.bind(
              this
            )}
            i18nLocation={this.props.i18nLocation}
          />
        </BaseView>
      );
    }
  }

  private showCustomerLoyaltyIndicator(customer: Customer): boolean {
    return (
      _.get(
        this.customerSearchConfig,
        "searchResults.displayLoyaltyIndicator",
        true
      ) && customer.hasLoyaltyMemberships
    );
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    customerState: state.customer,
    settings: state.settings,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})(CustomerResults);
