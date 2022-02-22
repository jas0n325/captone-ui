import _ from "lodash";
import * as React from "react";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  SHIPPING_FEE_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { FeeType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation } from "../../actions";
import { AppState, BusinessState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { getShippingFeesConfig } from "../common/utilities/shippingFeeUtilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { ShippingMethodScreenProps } from "./interfaces";
import ShippingMethods from "./ShippingMethod";
import { shippingMethodsStyles } from "./styles";

interface StateProps {
  settings: SettingsState;
  businessState: BusinessState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface State {
  shippingMethod: ShippingMethod;
}

interface Props extends ShippingMethodScreenProps, StateProps, DispatchProps, NavigationScreenProps<"shippingMethod"> {}

export interface ShippingMethod {
  carrierName: string;
  serviceLevel: string;
  description: I18Props;
  displayName: I18Props;
  shippingFee: ShippingFeeProps;
  selectedByDefault: boolean;
  enabled: boolean;
  displayOrder: number;
  shippingMethodID: string;
}

interface I18Props {
  i18nCode: string;
  default: string;
}

interface ShippingFeeProps {
  feeCalculationMethod: string;
  amount: string;
}

class ShippingMethodScreen extends React.PureComponent<Props, State> {
  private styles: any;
  private shippingMethodList: ShippingMethod[];
  private shippingMethod: ShippingMethod;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(shippingMethodsStyles());
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.businessState.inProgress && !this.props.businessState.inProgress && !this.props.businessState.error &&
      this.props.businessState.eventType === SHIPPING_FEE_EVENT) {
      this.props.onExit();
    }
  }

  public getShippingFeesConfig = () => {

    let selectedShippingMethodId: string;
    if(this.props.businessState.displayInfo.shippingFeeDisplayLines &&
       this.props.businessState.displayInfo.shippingFeeDisplayLines.length > 0){
      const shippingMethodLines =
          this.props.businessState.displayInfo.shippingFeeDisplayLines.find(line => line.feeType === "Shipping");
      selectedShippingMethodId = shippingMethodLines.feesByFulfillmentGroup[0].feeId;
    }

    this.shippingMethodList = getShippingFeesConfig(this.props.settings.configurationManager);
    if (this.state === null) {
      if (!selectedShippingMethodId) {
        const isSelectedByDefault = this.shippingMethodList.find(x => x.selectedByDefault === true);
        if (isSelectedByDefault) {
          this.shippingMethod = isSelectedByDefault;
        }
        else {
          if (this.shippingMethodList.length === 1) {
            this.shippingMethod = this.shippingMethodList[this.shippingMethodList.length - 1];
          }
        }
      }
      else if (selectedShippingMethodId) {
        this.shippingMethod = this.shippingMethodList.find(x => x.shippingMethodID === selectedShippingMethodId);
        this.setState({ shippingMethod: this.shippingMethod });
      }

      this.setState({ shippingMethod: this.shippingMethod });
    }
    else {
      this.shippingMethod = this.state.shippingMethod;
    }
  }

  public render(): JSX.Element {
    this.getShippingFeesConfig();

    return (
      <BaseView style={this.styles.fill}>
        <ShippingMethods
          displayInfo={this.props.businessState.displayInfo}
          currency={this.props.businessState.stateValues.get("transaction.accountingCurrency")}
          settings={this.props.settings}
          onAccept={this.shippingFeeAccepted.bind(this)}
          setShippingMethod={this.setShippingMethod.bind(this)}
          onCancel={this.pop}
          shippingMethodList={this.shippingMethodList}
          shippingMethodName={_.get(this, "shippingMethod.displayName") &&
            I18n.t(this.shippingMethod.displayName.i18nCode, {defaultValue: this.shippingMethod.displayName.default})}
          onBack={this.pop}
        />
      </BaseView>
    );
  }

  private setShippingMethod = (shippingMethod: ShippingMethod) => {
    this.setState({ shippingMethod });
  }

  private pop = () => {
    this.props.navigation.pop();
  }

  private shippingFeeAccepted(): void {
    const order =  this.props.businessState.stateValues.get("transaction.order") ;
    const shippingMethod = this.state === null ? this.shippingMethod : this.state.shippingMethod;
    const inputs: UiInput[] = [];
    inputs.push(new UiInput(UiInputKey.FEE_TYPE, FeeType.Shipping));
    inputs.push(new UiInput(UiInputKey.ORDER_REFERENCE_ID, order._orderReferenceId));
    inputs.push(new UiInput(UiInputKey.SHIPPING, shippingMethod));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, SHIPPING_FEE_EVENT, inputs);
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    settings: state.settings,
    businessState: state.businessState
  };
};

export default connect(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})(withMappedNavigationParams<typeof ShippingMethodScreen>()(ShippingMethodScreen));
