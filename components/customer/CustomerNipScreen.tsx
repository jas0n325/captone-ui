import * as React from "react";
import { Keyboard } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  ADD_TAX_CUSTOMER_EVENT,
  Customer,
  TaxCustomer,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
  import { ITaxIdentifier } from "@aptos-scp/scp-types-commerce-transaction";

import {
  ActionCreator,
  businessOperation,
  dataEvent,
  getTaxCustomer,
  sceneTitle,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  DataEventState,
  SettingsState,
  UiState
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationScreenProps } from "../StackNavigatorParams";
import CustomerNip from "./CustomerNip";
import { GovernmentTaxIdentifierLocalTypeCode } from "./CustomerUtilities";
import { CustomerNipScreenProps } from "./interfaces";
import { customerDisplayScreenStyle } from "./styles";


interface StateProps {
  businessState: BusinessState;
  customer: Customer;
  dataEventState: DataEventState;
  deviceIdentity: DeviceIdentity;
  settings: SettingsState;
  uiState: UiState;
  i18nLocation: string
}

interface DispatchProps {
  getTaxCustomer: ActionCreator;
  sceneTitle: ActionCreator;
  businessOperation: ActionCreator;
  dataEventSuccess: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends CustomerNipScreenProps, StateProps, DispatchProps, NavigationScreenProps<"customerNip"> {}

interface State {}

class CustomerNipScreen extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(customerDisplayScreenStyle());
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <CustomerNip
          onSave={this.handleNipNumber}
          settings={this.props.settings}
          handleCancel={this.handleCancel}
          i18nLocation={this.props.i18nLocation}
        />
      </BaseView>
    );
  }

  private handleNipNumber = (inputValue: string): void => {
    if (inputValue && inputValue.trim().length > 0) {
      const taxCustomer = (this.props.businessState.stateValues.get("transaction.customer") ?? {}) as TaxCustomer;

      taxCustomer.taxIdentifierCollection = [];
      taxCustomer.taxIdentifierCollection.push({
        name: GovernmentTaxIdentifierLocalTypeCode.NIP,
        value: inputValue
      } as ITaxIdentifier);

      const uiInputs: UiInput[] = [];
      uiInputs.push(new UiInput(UiInputKey.TAX_CUSTOMER, taxCustomer));
      this.props.businessOperation(this.props.deviceIdentity, ADD_TAX_CUSTOMER_EVENT, uiInputs);
    }
    Keyboard.dismiss();
    this.props.onContinue();
  }

  private handleCancel = (): void => {
    Keyboard.dismiss();
    this.props.onCancel();
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    customer: state.customer.customer,
    dataEventState: state.dataEvent,
    deviceIdentity: state.settings.deviceIdentity,
    settings: state.settings,
    uiState: state.uiState,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

const mapDispatchToProps: DispatchProps = {
  businessOperation: businessOperation.request,
  dataEventSuccess: dataEvent.success,
  getTaxCustomer: getTaxCustomer.request,
  sceneTitle: sceneTitle.request,
  updateUiMode: updateUiMode.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof CustomerNipScreen>()(CustomerNipScreen));
