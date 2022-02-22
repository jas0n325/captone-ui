import * as React from "react";
import { Keyboard } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  IConfigurationManager,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_ITEM_EVENT,
  IFeatureAccessConfig,
  QUANTITY_CHANGE_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import { ActionCreator, businessOperation, updateUiMode } from "../../actions";
import { AppState, BusinessState, UI_MODE_ZERO_PRICED } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import {
  getFeatureAccessConfig,
  getMaximumAllowedFieldLength
} from "../common/utilities/configurationUtils";
import { getCurrencyCode } from "../common/utilities/utils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { ZeroPricedScreenProps } from "./interfaces";
import { zeroPriceScreenStyles } from "./styles";
import ZeroPriced from "./ZeroPriced";

interface StateProps {
  businessState: BusinessState;
  retailLocationCurrency: string;
  configManager: IConfigurationManager;
  deviceIdentity: DeviceIdentity;
}

interface DispatchProps {
  businessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface State {
  inProgress: boolean;
}

interface Props extends ZeroPricedScreenProps,
    StateProps,
    DispatchProps,
    NavigationScreenProps<"zeroPriced"> {}

class ZeroPricedScreen extends React.Component<Props, State> {
  private maxAllowedLength: number;
  private currency: string;
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(zeroPriceScreenStyles());

    this.maxAllowedLength = getMaximumAllowedFieldLength(
      this.props.configManager
    );
    this.currency = getCurrencyCode(
      this.props.businessState.stateValues,
      this.props.retailLocationCurrency
    );

    this.state = {
      inProgress: false
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_ZERO_PRICED);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (
      !this.props.businessState.inProgress &&
      prevProps.businessState.inProgress &&
      !this.props.businessState.error &&
      this.state.inProgress
    ) {
      this.setState({ inProgress: false });
      this.props.navigation.pop();
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <ZeroPriced
          line={this.props.line}
          currency={this.currency}
          maxAllowedLength={this.maxAllowedLength}
          quantityDisabled={this.quantityDisabled}
          onSave={this.handlePriceChange.bind(this)}
          onCancel={this.pop}
          navigation={this.props.navigation}
        />
      </BaseView>
    );
  }

  private handlePriceChange(price: string, quantity: string): void {
    // if the value is the same then we don't do anything
    if (isNaN(Number.parseFloat(price))) {
      return;
    }

    if (isNaN(Number.parseFloat(quantity))) {
      return;
    }

    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("itemKey", this.props.itemKey));
    uiInputs.push(new UiInput("price", price));
    uiInputs.push(new UiInput(UiInputKey.QUANTITY, quantity));
    uiInputs.push(
      new UiInput(
        UiInputKey.SELL_SOFT_STOPPED_ITEM,
        this.props.sellSoftStoppedItem
      )
    );

    if (this.props.itemKeyType) {
      uiInputs.push(new UiInput("itemKeyType", this.props.itemKeyType));
    }

    this.props.businessOperation(
      this.props.deviceIdentity,
      APPLY_ITEM_EVENT,
      uiInputs
    );
    this.setState({ inProgress: true });

    Keyboard.dismiss();
  }

  private get quantityDisabled(): boolean {
    const quantityChangeFeatureConfig: IFeatureAccessConfig =
      getFeatureAccessConfig(this.props.configManager, QUANTITY_CHANGE_EVENT);
    return (
      quantityChangeFeatureConfig &&
      quantityChangeFeatureConfig.enabled === false
    );
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    retailLocationCurrency: state.settings.retailLocationCurrency,
    configManager: state.settings && state.settings.configurationManager,
    deviceIdentity: state.settings.deviceIdentity
  };
}

export default connect(mapStateToProps, {
  businessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(withMappedNavigationParams<typeof ZeroPricedScreen>()(ZeroPricedScreen));
