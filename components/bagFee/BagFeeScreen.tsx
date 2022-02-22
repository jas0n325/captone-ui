import * as React from "react";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  BAG_FEE_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import { ActionCreator, businessOperation} from "../../actions";
import { AppState, BusinessState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { BagFeeScreenProps } from "./interfaces";
import BagFeesPhone from "./phone/BagFees";
import { bagFeeScreenStyles } from "./styles";
import BagFeesTablet from "./tablet/BagFees";

interface StateProps {
  settings: SettingsState;
  businessState: BusinessState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface Props extends BagFeeScreenProps, StateProps, DispatchProps, NavigationScreenProps<"bagFee"> {}

class BagFeesScreen extends React.PureComponent<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.handleBagQuantityAccepted = this.handleBagQuantityAccepted.bind(this);
    this.styles = Theme.getStyles(bagFeeScreenStyles());
  }

  public render(): JSX.Element {
    const BagFees = Theme.isTablet ? BagFeesTablet : BagFeesPhone;

    const tabletProps: any = Theme.isTablet ? { appLogo: this.props.appLogo } : {};

    return (
      <BaseView style={this.styles.fill}>
        <BagFees
          { ...tabletProps }
          displayInfo={this.props.businessState.displayInfo}
          currency={this.props.businessState.stateValues.get("transaction.accountingCurrency")}
          settings={this.props.settings}
          onAccept={this.handleBagQuantityAccepted}
          onSkip={this.props.onSkipBagFee}
          onCancel={() => this.props.navigation.pop()}
        />
      </BaseView>
    );
  }

  private handleBagQuantityAccepted(bagQuantity: number): void {
    const inputs: UiInput[] = [];
    inputs.push(new UiInput(UiInputKey.FEE_QUANTITY, bagQuantity));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, BAG_FEE_EVENT, inputs);
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    settings: state.settings,
    businessState: state.businessState
  };
};

export default connect<StateProps, DispatchProps, NavigationScreenProps<"bagFee">>(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})(withMappedNavigationParams<typeof BagFeesScreen>()(BagFeesScreen));
