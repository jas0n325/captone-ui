import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { TRANSACTION_FEE_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, BusinessState, UiState } from "../../reducers";
import Theme from "../../styles";
import { SCOScreenKeys, SCOScreenProps } from "./common/constants";
import SCOBasket from "./common/SCOBasket";
import { shoppingBagScreenStyles } from "./styles";

interface StateProps {
  businessState: BusinessState;
  uiState: UiState;
}

interface Props extends StateProps, SCOScreenProps {}

interface State {}

class ShoppingBagScreen extends React.Component<Props , State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(shoppingBagScreenStyles());
  }

  public render(): JSX.Element {
    const transactionHasItems = this.props.businessState && this.props.businessState.displayInfo &&
        this.props.businessState.displayInfo.itemDisplayLines.length > 0;

    return (
      <View style={this.styles.root}>
        <View style={this.styles.leftSide}>
          <SCOBasket isOnShoppingBagScreen={true} />
        </View>
        <View style={this.styles.rightSide}>
          <TouchableOpacity
            style={transactionHasItems ? this.styles.continueButton : this.styles.continueButtonDisabled}
            onPress={this.handleNextSceenNavigation}
            disabled={!transactionHasItems}>
            <Text style={this.styles.continueText}>{I18n.t("continue")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  private handleNextSceenNavigation = (): void => {
    if (this.props.uiState.isAllowed(TRANSACTION_FEE_EVENT)) {
      this.props.navigateToNextScreen(SCOScreenKeys.BagFee);
    } else {
      this.props.navigateToNextScreen(SCOScreenKeys.Member);
    }
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    uiState: state.uiState
  };
}

export default connect(mapStateToProps)(ShoppingBagScreen);
