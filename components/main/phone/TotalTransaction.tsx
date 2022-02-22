import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";

import I18n from "../../../../config/I18n";
import Theme from "../../../styles";
import { AppState } from "../../../reducers";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../../common/utilities";
import { printAmount } from "../../common/utilities/itemLineUtils";
import { totalTransactionStyle } from "./styles";
import VectorIcon from "../../common/VectorIcon";
import { connect } from "react-redux";
import { getTestIdProperties } from "../../common/utilities/utils";

interface StateProps {
  stateValues: Map<string, any>;
  currency: string;
}

interface Props extends StateProps{
  balanceDue?: Money;
  inItemSelection: boolean;
  mixedBasketAllowed: boolean;
  returnMode: boolean;
  returnTotal?: Money;
  totalTransactionIsAllowed: boolean;
  transactionIsOpen: boolean;
  onBasketActionPressed: () => void;
  onTotalPressed: () => void;
}

 class TotalTransaction extends React.PureComponent<Props> {
  private styles: any;
  private zeroAmount: string;
  private testID: string;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(totalTransactionStyle());
    this.testID = "TotalTransaction";

    this.zeroAmount = new Money(0, this.props.currency).toLocaleString
      (getStoreLocale(), getStoreLocaleCurrencyOptions());
  }

  public render(): JSX.Element {
    const disableTotalButton: boolean = !this.props.transactionIsOpen || !this.props.totalTransactionIsAllowed ||
        this.props.inItemSelection;

    const disableTransactionActions: boolean = this.props.returnMode && this.props.mixedBasketAllowed;

    return (
      <View style={this.styles.root}>
        <TouchableOpacity
          style={[this.styles.transactionActionsButton, disableTransactionActions && this.styles.btnDisabled]}
          {...getTestIdProperties(this.testID, "basket-screen-bottom")}
          disabled={disableTransactionActions}
          onPress={this.props.onBasketActionPressed}
        >
          <VectorIcon
            name={"Apps"}
            fill={disableTransactionActions ? this.styles.btnTextDisabled.color : this.styles.appsIcon.color}
            height={this.styles.appsIcon.height}
            width={this.styles.appsIcon.height}
          />
        </TouchableOpacity>
        {
          !disableTransactionActions &&
          <TouchableOpacity
            style={[this.styles.btnPrimary, this.styles.btnTotal, disableTotalButton && this.styles.btnDisabled]}
            {...getTestIdProperties(this.testID, "basket-screen-bottom-grid")}
            disabled={disableTotalButton}
            onPress={this.props.onTotalPressed}
          >
            { // Render but hide this chevron so the price can be centered properly
              !disableTotalButton &&
              <VectorIcon
                name="Forward"
                stroke={this.styles.btnPrimary.backgroundColor}
                strokeWidth={this.styles.chevronIcon.borderWidth}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            }
            <Text style={[this.styles.btnTotalPrice, disableTotalButton && this.styles.btnTextDisabled]}>
              { printAmount(this.props.balanceDue) || this.zeroAmount }
            </Text>
            { // Render and show this chevron
              !disableTotalButton &&
              <VectorIcon
                name="Forward"
                stroke={this.styles.btnTotalPrice.color}
                strokeWidth={this.styles.chevronIcon.borderWidth}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            }
          </TouchableOpacity>
        }
        {
          disableTransactionActions &&
          <View style={this.styles.returnTotal}>
            <Text style={this.styles.returnTotalTitle}>{I18n.t("refundTotal")}</Text>
            <Text style={this.styles.returnTotalText}>{printAmount(this.props.returnTotal) || this.zeroAmount}</Text>
          </View>
        }
      </View>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    stateValues: state.businessState.stateValues,
    currency: state.settings.retailLocationCurrency
  };
};

export default connect(mapStateToProps)(TotalTransaction);
