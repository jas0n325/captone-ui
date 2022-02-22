import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { TenderAuthCategory } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, updateUiMode } from "../../actions";
import { AppState, UiState } from "../../reducers";
import Theme from "../../styles";
import BasePaymentScreen, {
  BasePaymentScreenDispatchProps,
  BasePaymentScreenProps,
  BasePaymentScreenState,
  BasePaymentScreenStateProps
} from "../payment/BasePaymentScreen";
import { SCOScreenKeys, SCOScreenProps } from "./common/constants";
import SCOBasket from "./common/SCOBasket";
import { paymentStyles } from "./styles";

const logger: ILogger = LogManager.getLogger(
  "com.aptos.storeselling.ui.components.payment.selfCheckout.Payment"
);

interface StateProps extends BasePaymentScreenStateProps {
  uiState: UiState;
}

interface DispatchProps extends BasePaymentScreenDispatchProps {
  updateUiMode: ActionCreator;
}

interface Props
  extends StateProps,
    DispatchProps,
    BasePaymentScreenProps,
    SCOScreenProps {}

class Payment extends BasePaymentScreen<Props, BasePaymentScreenState> {
  private styles: any;
  private activePaymentTendersExist: boolean;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(paymentStyles());

    this.state = {
      tenderAmount: undefined,
      tenderAuthCategory: undefined,
      tenderId: undefined,
      tenderType: undefined,
      showPaymentDeviceSelection: false,
      offlineOptionsOn: false,
      retryAuthorizationOn: false,
      useFirstDeviceOnly: true,
      references: undefined
    };

    this.activePaymentTendersExist =
      this.activeTenders.filter(
        (aTender) =>
          aTender.tenderAuthCategory === TenderAuthCategory.PaymentDevice
      ).length > 0;
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    const customerNumber: string =
      this.props.businessState.stateValues &&
      this.props.businessState.stateValues.get("transaction.customer") &&
      this.props.businessState.stateValues.get("transaction.customer")
        .customerNumber;
    return (
      <>
        <View style={this.styles.root}>
          <View style={this.styles.leftSide}>
            <SCOBasket isOnShoppingBagScreen={false} />
          </View>
          <View style={this.styles.rightSide}>
            <View style={this.styles.buttonArea}>
              <TouchableOpacity
                style={this.styles.backButton}
                onPress={() =>
                  this.props.navigateToNextScreen(SCOScreenKeys.Member)
                }
              >
                <Text style={this.styles.backText}>{I18n.t("back")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  this.styles.continueButton,
                  !this.activePaymentTendersExist && this.styles.btnDisabled
                ]}
                onPress={this.onPay.bind(this)}
                disabled={!this.activePaymentTendersExist}
              >
                <Text
                  style={[
                    this.styles.continueText,
                    !this.activePaymentTendersExist &&
                      this.styles.btnTextDisabled
                  ]}
                >
                  {I18n.t("pay")}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={this.styles.agreementText}>
              {I18n.t("bySelecting")}
              <Text style={this.styles.agreementEmphasisText}>
                {I18n.t("pay")}
              </Text>
              {I18n.t("confirmAllItemsAdded")}
            </Text>
            {customerNumber && (
              <View style={this.styles.memberPresentArea}>
                <Text style={this.styles.membershipExplanation}>
                  {I18n.t("toUseMembershipOffers")}
                  <Text style={this.styles.membershipExplanationEmphasis}>
                    {I18n.t("help")}
                  </Text>
                  {I18n.t("andOurStaffWillAssistYou")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </>
    );
  }

  protected onUiModeVoid(): void {
    logger.debug(
      "onUiModeVoid called on Self Checkout Payment. Voiding is not currently supported in self checkout mode."
    );
  }

  private onPay(): void {
    //display payment selection screen
    this.props.navigateToNextScreen(SCOScreenKeys.PaymentSummary);
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    settings: state.settings,
    uiState: state.uiState
  };
}

export default connect(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(Payment);
