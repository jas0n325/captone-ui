import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  BAG_FEE_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { FeeType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation} from "../../actions";
import {
  AppState,
  BusinessState,
  SettingsState
} from "../../reducers";
import Theme from "../../styles";
import AdderSubtractor from "../common/AdderSubtractor";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../common/utilities";
import { getUnitAmount } from "../common/utilities/transactionFeeUtilities";
import VectorIcon from "../common/VectorIcon";
import { SCOScreenKeys, SCOScreenProps } from "./common/constants";
import { selfCheckoutBagFeeScreenStyles } from "./styles";

interface StateProps {
  settings: SettingsState;
  businessState: BusinessState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface Props extends StateProps, DispatchProps, SCOScreenProps {}

interface State {
  bagQuantity: number;
}

class SCOBagFeeScreen extends React.Component<Props , State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(selfCheckoutBagFeeScreenStyles());
    const { displayInfo } = this.props.businessState;
    if (displayInfo.transactionFeeDisplayLines &&
      displayInfo.transactionFeeDisplayLines.length > 0) {

      const feeDisplayLine = displayInfo.transactionFeeDisplayLines.find((line) => line.feeType === FeeType.Bag);
      if (feeDisplayLine) {
        this.state = { bagQuantity: feeDisplayLine.quantity };
      } else {
        this.state = { bagQuantity: 0 };
      }
    } else {
      this.state = { bagQuantity: 0 };
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.businessState.inProgress && !this.props.businessState.inProgress && !this.props.businessState.error &&
        this.props.businessState.eventType === BAG_FEE_EVENT) {
      this.props.navigateToNextScreen(SCOScreenKeys.Member);
    }
  }

  public render(): JSX.Element {
    const currency = this.props.businessState.stateValues.get("transaction.accountingCurrency");
    const unitCost: Money = getUnitAmount(this.props.settings.configurationManager, currency);
    return (
      <View style={this.styles.root}>
        <View style={this.styles.bagFeesMainView}>
          <View style={this.styles.addBagRapper}>
            <VectorIcon name={"Bag"}
              height={this.styles.basketIcon.fontSize}
              width={this.styles.basketIcon.fontSize}
            />
            <View style={this.styles.addToBagTexts}>
              <Text numberOfLines={1} style={this.styles.addBagText}>{I18n.t("addBagText")}</Text>
              <View style={this.styles.rapperQuantity}>
                <View>
                  <Text style={this.styles.bagFeetext}>{I18n.t("bagFee")}</Text>
                  <Text style={this.styles.amountTextBagFee}>
                    {unitCost && `${unitCost.toLocaleString(getStoreLocale()
                      , getStoreLocaleCurrencyOptions())}/${I18n.t("each")}`}
                  </Text>
                </View>
                <Text style={this.styles.quantityText}>{this.state.bagQuantity}</Text>
                <AdderSubtractor minimum={0} value={this.state.bagQuantity}
                  onValueUpdate={(newValue: number) => this.setState({ bagQuantity: newValue })}
                  style={this.styles}/>
              </View>
            </View>
          </View>
        </View>
        <View style= {this.styles.footerOptionsBagFees}>
          <View style={this.styles.actionButtons}>
            <TouchableOpacity
              style={this.styles.backButton}
              onPress={() => this.props.navigateToNextScreen(SCOScreenKeys.ShoppingBag)}
            >
              <Text style={this.styles.backText} >{I18n.t("back")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={this.styles.continueButton}
              onPress={this.handleBagQuantityConfirmed}
            >
              <Text style={this.styles.continueText} >{I18n.t("continue")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  private handleBagQuantityConfirmed = (): void => {
    const inputs: UiInput[] = [];
    inputs.push(new UiInput(UiInputKey.FEE_QUANTITY, this.state.bagQuantity));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, BAG_FEE_EVENT, inputs);
  }

}

function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings,
    businessState: state.businessState
  };
}

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request
};

export default connect(mapStateToProps, mapDispatchToProps)(SCOBagFeeScreen);
