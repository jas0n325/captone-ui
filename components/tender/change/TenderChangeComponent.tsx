import * as React from "react";
import { connect } from "react-redux";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";
import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  IChangeInputOptions,
  RESET_CASH_DRAWER_EVENT,
  TenderDenominationRoundings,
  TenderType,
  TENDER_CHANGE_EVENT,
  TENDER_CHANGE_FALLBACK_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import { ActionCreator, businessOperation, dataEvent, updateUiMode } from "../../../actions";
import {
  AppState,
  BusinessState,
  SettingsState,
  UI_MODE_CUSTOMER_SEARCH_SCREEN,
  UI_MODE_TENDERING,
  UiState
} from "../../../reducers";
import Theme from "../../../styles";
import BaseView from "../../common/BaseView";
import { NavigationProp } from "../../StackNavigatorParams";
import { TenderChangeComponentProps } from "./interfaces";
import { tenderChangeStyles } from "./styles";
import {
  getDenominationRoundings,
  printAmount
} from "../../common/utilities";
import i18n from "../../../../config/I18n";
import Header from "../../common/Header";
import TransactionTotalsFooter from "../../common/presentational/TransactionTotalsFooter";
import { isCustomerRequiredForChangeTender } from "../../payment/PaymentDevicesUtils";
import I18n from "../../../../config/I18n";
import { PendingPaymentMode } from "../../../reducers/pendingPayment";
import { popTo } from "../../common/utilities/navigationUtils";

interface StateProps {
  businessState: BusinessState;
  settings: SettingsState;
  deviceIdentity: DeviceIdentity;
  paymentStatus: Map<string, any>;
  pendingPaymentMode?: PendingPaymentMode;
  uiState: UiState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  dataEventSuccess: ActionCreator;
}

interface Props extends TenderChangeComponentProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  waitingOnCustomer: boolean;
  tender: TenderType;
}

class TenderChangeComponent extends React.Component<Props, State> {
  private styles: any;
  private changeDue: Money;
  private changeTenders: TenderType[];
  private isFallback: boolean;
  private roundedBalanceDue: TenderDenominationRoundings[];

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(tenderChangeStyles());

    this.changeDue = this.props.businessState.stateValues.get("transaction.changeDue");
    this.isFallback  = this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.isChangeFallbackInProgress");

    if (this.isFallback) {
      this.changeTenders = this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.ChangeFallbackOptions")?.fallbackTenders;
    } else {
      const changeInputOptions: IChangeInputOptions =
          this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.changeInputOptions");
      this.changeTenders = changeInputOptions.validChangeTenderTypes;
    }
    this.roundedBalanceDue = getDenominationRoundings(this.props.settings.configurationManager,
        this.changeDue?.times(-1));

    this.state = {
      waitingOnCustomer: false,
      tender: undefined
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.uiState.mode !== UI_MODE_TENDERING &&
        prevProps.uiState.mode === UI_MODE_CUSTOMER_SEARCH_SCREEN) {
      this.props.updateUiMode(UI_MODE_TENDERING);
    }

    if (this.state.tender && this.props.pendingPaymentMode !== prevProps.pendingPaymentMode &&
          this.props.pendingPaymentMode === PendingPaymentMode.WaitingOnPayment) {
      this.handleChange(this.state.tender);
    }
  }

  public componentWillUnmount(): void {
    if (this.props.uiState.mode === UI_MODE_TENDERING) {
      this.props.updateUiMode(undefined);
    }
  }

  public render(): JSX.Element {
    return (
        <BaseView style={[this.styles.root]}>
          <Header
            title = {i18n.t("payment")}
            backButton = {<View />}
          />
          { this.changeDue &&
            <View style={this.styles.topSection}>
              <View style={this.styles.totalArea}>
                <Text style={this.styles.totalText}>{i18n.t("changeDue")}</Text>
                <Text style={this.styles.totalAmountText}>
                  {
                    printAmount(this.changeDue)
                  }
                </Text>
              </View>
            </View>
          }
          <ScrollView style={this.styles.scrollContainer}>

            { this.changeTenders &&

              <View style={this.styles.paymentMethodContainer}>
                {
                  this.changeTenders.map((tender) => {
                    return this.renderChangeTender(tender, this.styles, () => this.onPress(tender));
                  })
                }
              </View>
            }
            { !Theme.isTablet &&
              this.renderFooter()
            }
          </ScrollView>
        </BaseView>
    );
  }

  private renderChangeTender(tender: TenderType, styles: any, onPress: () => void): JSX.Element {
    const tenderDenominationRounding = this.getRoundingBalanceDueTender(tender.id);
    let roundedAmount: Money;

    if (tenderDenominationRounding?.roundedValue) {
      roundedAmount = tenderDenominationRounding.roundedValue.abs().ne(this.changeDue) &&
          tenderDenominationRounding.roundedValue.abs();
    }

    return <TouchableOpacity
        style={roundedAmount ? styles.paymentMethodButtonDetailed : styles.paymentMethodButton}
        onPress={onPress}
      >
          <Text
            style={styles.paymentButtonTitle}>
              {tender.tenderName}
          </Text>
        {
          roundedAmount &&
          <Text
          style={styles.paymentButtonSubTitle}>
            {printAmount(roundedAmount)}
          </Text>
        }
    </TouchableOpacity>;
  }

  private onPress(tender: TenderType): void {
    if (isCustomerRequiredForChangeTender(tender, this.props.settings.configurationManager) &&
        !this.props.businessState.stateValues.get("transaction.customer")) {
      this.props.updatePendingPayment(PendingPaymentMode.WaitingOnCustomer);
      this.promptForCustomer(tender);
    } else {
      this.resetCashDrawer();
      this.handleChange(tender);
    }
  }

  private handleChange(tender: TenderType): void {
    this.setState({waitingOnCustomer: false});
    this.props.updatePendingPayment(undefined);
    this.props.updateUiMode(undefined);
    const tenderDenominationRounding = this.getRoundingBalanceDueTender(tender.id);
    let roundedAmount: Money;

    if (tenderDenominationRounding?.roundedValue) {
      roundedAmount = tenderDenominationRounding.roundedValue.abs().ne(this.changeDue) &&
          tenderDenominationRounding.roundedValue.abs();
    }

    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.TENDER_ID, tender.id));
    uiInputs.push(new UiInput(UiInputKey.TENDER_AUTH_CATEGORY_NAME, tender.tenderAuthCategory));
    uiInputs.push(new UiInput(UiInputKey.TENDER_SUB_TYPE, tender.subType));
    uiInputs.push(new UiInput(UiInputKey.TENDER_TYPE_NAME, tender.tenderTypeName));
    uiInputs.push(new UiInput(UiInputKey.TENDER_AMOUNT, roundedAmount?.amount || this.changeDue?.amount));

    this.props.performBusinessOperation(this.props.settings.deviceIdentity, this.isFallback ?
        TENDER_CHANGE_FALLBACK_EVENT : TENDER_CHANGE_EVENT, uiInputs);

    if (Theme.isTablet) {
      this.props.onExit();
    } else {
      this.props.navigation.pop();
    }
  }

  private promptForCustomer(tender: TenderType): void {
    this.setState({ waitingOnCustomer: true, tender });
    this.props.navigation.push("customer", {
      isTransactionStarting: false,
      assignCustomer: true,
      backNavigationTitle: I18n.t("payment"),
      onExit: () => {
        if (Theme.isTablet) {
          this.props.navigation.dispatch(popTo("payment"));
        } else {
          this.props.navigation.dispatch(popTo("tenderChange"));
        }
      },
      onCancel: () => {
        this.props.navigation.pop();
      }
    });
  }

  private resetCashDrawer(): void {
    if (this.props.businessState.stateValues.get("CashDrawerSession.cashDrawerKey")) {
      this.props.performBusinessOperation(
        this.props.settings.deviceIdentity,
        RESET_CASH_DRAWER_EVENT,
        []
      );
    }
  }

  private renderFooter = (): JSX.Element => {
    const transactionNumber: number = this.props.businessState.stateValues.get("transaction.number");

    const transactionSubTotal: Money = this.getStateValueMoney("transaction.subTotal");
    const transactionTotalSavings: Money = this.getStateValueMoney("transaction.totalSavings");
    const transactionTax: Money = this.getStateValueMoney("transaction.tax");
    const transactionTotal: Money = this.getStateValueMoney("transaction.total");

    return (
      <View style={this.styles.footerContainer}>
        <TransactionTotalsFooter
          style={this.styles.footerArea}
          transactionNumber={transactionNumber && transactionNumber.toString()}
          subtotal={transactionSubTotal}
          totalDiscounts={transactionTotalSavings}
          tax={transactionTax}
          total={transactionTotal}
        />
      </View>
    );
  }

  private getStateValueMoney(tranKey: string): Money {
    return this.props.businessState?.stateValues.get(tranKey);
  }

  private getRoundingBalanceDueTender(tenderId: string): TenderDenominationRoundings {
    return this.roundedBalanceDue && tenderId &&
        this.roundedBalanceDue.find((tender) => tender.tenderId === tenderId);
  }
}


const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    paymentStatus: state.deviceStatus?.paymentStatus,
    settings: state.settings,
    deviceIdentity: state.settings.deviceIdentity,
    pendingPaymentMode: state.pendingPayment?.mode,
    uiState: state.uiState
  };
};

export default connect<StateProps, DispatchProps, Omit<Props, keyof (StateProps & DispatchProps)>>(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  dataEventSuccess: dataEvent.success,
  updateUiMode: updateUiMode.request
})(TenderChangeComponent);
