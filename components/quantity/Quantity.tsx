import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  QUANTITY_CHANGE_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, updateUiMode } from "../../actions";
import {
  AppState,
  BusinessState,
  UI_MODE_QUANTITY_CHANGE
} from "../../reducers";
import Theme from "../../styles";
import AdderSubtractor from "../common/AdderSubtractor";
import BaseView from "../common/BaseView";
import NumericInput from "../common/customInputs/NumericInput";
import Header from "../common/Header";
import ItemLine from "../common/ItemLine";
import { warnBeforeLosingChanges } from "../common/utilities";
import { QuantityProps } from "./interfaces";
import { quantityStyle } from "./styles";
import { NavigationProp } from "../StackNavigatorParams";

interface StateProps {
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
}

interface DispatchProps {
  businessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends StateProps, DispatchProps, QuantityProps {
  navigation: NavigationProp;
}

interface State {
  inProgress: boolean;
  quantity: string;
}

class Quantity extends React.Component<Props, State> {
  private styles: any;
  private quantity: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(quantityStyle());

    this.state = {
      inProgress: false,
      quantity: props.line.quantity.toString()
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_QUANTITY_CHANGE);
    this.quantity.focus();
  }

  public componentDidUpdate(prevProps: Props): void {
    if (
      !this.props.businessState.inProgress &&
      prevProps.businessState.inProgress &&
      !this.props.businessState.error &&
      this.state.inProgress
    ) {
      this.setState({ inProgress: false });
      this.props.onExit();
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <Header
          title={I18n.t("quantity")}
          backButton={{
            name: "Back",
            action: () =>
              warnBeforeLosingChanges(
                this.state.quantity !== this.props.line.quantity.toString(),
                this.props.onExit
              )
          }}
          rightButton={{
            title: I18n.t("apply"),
            action: () => {
              if (this.state.quantity !== "0") {
                this.submitNewQuantity();
              }
            }
          }}
        />

        {this.props.showLine && <ItemLine line={this.props.line} />}
        <View style={this.styles.formArea}>
          <View style={this.styles.controlsRow}>
            <View style={this.styles.textPromptPanel}>
              <Text style={this.styles.textPrompt}>{I18n.t("quantity")}</Text>
            </View>
            <NumericInput
              onRef={(ref: any) => (this.quantity = ref)}
              style={this.styles.input}
              negative={false}
              placeholder={undefined}
              precision={0}
              returnKeyType={"done"}
              secureTextEntry={false}
              trimLeadingZeroes={true}
              clearOnFocus
              value={this.state.quantity}
              onChangeText={this.updateQuantity.bind(this)}
              onSubmitEditing={this.submitNewQuantity.bind(this)}
            />
            <AdderSubtractor
              minimum={1}
              onValueUpdate={(newQuantity: number) =>
                this.updateQuantity(newQuantity.toString())
              }
              value={parseInt(this.state.quantity, 10)}
            />
          </View>
          {Theme.isTablet && (
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.formAreaButton]}
              onPress={() => this.submitNewQuantity()}
              disabled={this.state.quantity === "0"}
            >
              <Text style={this.styles.btnPrimaryText}>{I18n.t("apply")}</Text>
            </TouchableOpacity>
          )}
          {Theme.isTablet && (
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.formAreaButton]}
              onPress={this.props.onExit}
            >
              <Text style={this.styles.btnSecondayText}>
                {I18n.t("cancel")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </BaseView>
    );
  }

  private updateQuantity(newQuantity: string): void {
    const newQuantityAsNum: number = parseInt(newQuantity, 10);

    if (newQuantityAsNum && !(newQuantityAsNum < 1)) {
      this.setState({ quantity: newQuantity });
    }
  }

  private submitNewQuantity(): void {
    const quantityAsNum: number = parseInt(this.state.quantity, 10);

    if (quantityAsNum && !(quantityAsNum < 0)) {
      this.handleQuantityChange();
    }
  }

  private handleQuantityChange(): void {
    // if the value is the same then we don't do anything
    const value = Number.parseInt(this.state.quantity, 10);
    if (isNaN(value)) {
      return;
    }

    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("lineNumber", this.props.line.lineNumber));
    uiInputs.push(new UiInput(UiInputKey.QUANTITY, this.state.quantity));

    this.props.businessOperation(
      this.props.deviceIdentity,
      QUANTITY_CHANGE_EVENT,
      uiInputs
    );
    this.setState({ inProgress: true });

    Keyboard.dismiss();
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity
  };
};

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  businessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(Quantity);
