import * as React from "react";
import { Keyboard } from "react-native";
import { connect } from "react-redux";

import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_TENDER_EVENT,
  FIND_VALUE_CERTIFICATES_EVENT,
  IPinRules,
  isValueCertificateSearchEnabled,
  IValueCertificateResult,
  TenderAuthCategory,
  TERMINAL_STATE_SYNC_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { TenderType } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  dataEvent,
  DataEventType,
  IDataEventData,
  IKeyListenerData,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  DataEventState,
  SettingsState,
  UiState,
  UI_MODE_TENDERING,
  UI_MODE_WAITING_FOR_INPUT
} from "../../reducers";
import { PendingPaymentMode } from "../../reducers/pendingPayment";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { popTo } from "../common/utilities/navigationUtils";
import {
  businessEventCompletedWithoutError,
  isCustomerRequiredForTender,
  isValueCertificatePartialRedeemEnabled,
  ITenderType
} from "../payment/PaymentDevicesUtils";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { NavigationProp } from "../StackNavigatorParams";
import CardRedeem from "./CardRedeem";
import { getActiveGiftTender } from "./GiftCardUtilities";
import { CardRedeemComponentProps } from "./interfaces";
import { baseViewFill } from "./styles";

interface Props extends CardRedeemComponentProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface StateProps {
  businessState: BusinessState;
  settings: SettingsState;
  uiState: UiState;
  deviceIdentity: DeviceIdentity;
  incomingDataEvent: DataEventState;
  paymentStatus: Map<string, any>;
  pendingPaymentMode?: PendingPaymentMode;
  currentScreenName?: string;
}

interface DispatchProps {
  dataEventSuccess: ActionCreator;
  businessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

export interface State {
  cardNumber: string;
  showPaymentDeviceSelection: boolean;
  tenderAmount: string;
  pinValue: string;
  useSwipe: boolean;
  tenderAuthCategory: TenderAuthCategory;
  inputSource: string;
  waitingOnCustomer: boolean;
}

class CardRedeemComponent extends React.Component<Props, State> {
  private styles: any;
  private pinRules: IPinRules;
  private customerExitNeedsPop: boolean;

  public constructor(props: Props) {
    super(props);

    const activeGiftTender: ITenderType = getActiveGiftTender(this.props.activeTenders);
    this.pinRules = activeGiftTender && activeGiftTender.pinRules;

    this.state = {
      cardNumber: undefined,
      showPaymentDeviceSelection: false,
      tenderAmount: undefined,
      pinValue: undefined,
      useSwipe: false,
      tenderAuthCategory: undefined,
      inputSource: undefined,
      waitingOnCustomer: false
    };

    this.styles = Theme.getStyles(baseViewFill());
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.state.waitingOnCustomer && (this.props.pendingPaymentMode !== prevProps.pendingPaymentMode ||
          this.returningToRedeemWaitingForPayment(prevProps))) {

      if (this.props.pendingPaymentMode === PendingPaymentMode.WaitingOnPayment)  {
        if (Theme.isTablet) {
          this.props.navigation.dispatch(popTo("payment"));
        } else {
          this.customerExitNeedsPop = false;
          this.props.navigation.dispatch(popTo("redeem"));
        }
        if (this.props.businessState.stateValues.get("transaction.customer")) {
          this.props.updatePendingPayment(PendingPaymentMode.Completed);
          this.setState({waitingOnCustomer: false});
          if (this.state.tenderAmount && this.state.cardNumber) {
            this.performCardRedeem(this.state.tenderAmount, this.state.cardNumber, this.state.pinValue, this.state.useSwipe,
                this.state.tenderAuthCategory, this.state.inputSource);
          }
        } else {
          // Customer required and not provided
          // moving to PendingPaymentMode.Completed because we could not proceed with payment.
          this.props.updatePendingPayment(PendingPaymentMode.Completed);
        }
      } else if (this.props.pendingPaymentMode === PendingPaymentMode.Completed) {
        // The payment mode being Completed while waitingForCustomer indicates the customer action failed
        this.props.updateUiMode(UI_MODE_TENDERING);
        this.props.onCancel();
        Keyboard.dismiss();
      }
    }
    if (this.props.incomingDataEvent.data && this.props.incomingDataEvent.data !== prevProps.incomingDataEvent.data) {
      let incomingScannerData: IDataEventData;
      let incomingCardNumber: string;
      if (this.props.incomingDataEvent.eventType === DataEventType.KeyListenerData) {
        incomingCardNumber = (this.props.incomingDataEvent.data as IKeyListenerData).inputText;
      } else if (this.props.incomingDataEvent.eventType === DataEventType.ScanData) {
        incomingScannerData = this.props.incomingDataEvent.data ? this.props.incomingDataEvent.data: undefined;
        incomingCardNumber = incomingScannerData ? incomingScannerData.data : undefined;
      }
      if (incomingCardNumber) {
        const currentCardNumber = this.state.cardNumber;
        if (currentCardNumber !== incomingCardNumber) {
          this.setState({cardNumber: incomingCardNumber});
        }
        // Clear the props
        this.props.dataEventSuccess(this.props.incomingDataEvent, false);
      }
    }

    if (businessEventCompletedWithoutError(prevProps.businessState, this.props.businessState)
          && this.props.businessState.eventType !== TERMINAL_STATE_SYNC_EVENT) {
      this.props.onCancel();
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(UI_MODE_TENDERING);
  }

  public componentWillMount(): void {
    this.props.updateUiMode(UI_MODE_WAITING_FOR_INPUT);
    const currency = this.props.businessState.stateValues.get("transaction.accountingCurrency");
    if (isCustomerRequiredForTender(TenderType.ValueCertificate, this.props.subType, this.props.tenderAuthCategory,
        this.props.settings.diContainer, this.props.remainingTenderAmount, currency,
        this.props.stateValues.get("transaction.balanceDue"), this.props.settings.configurationManager) &&
        !this.props.businessState.stateValues.get("transaction.customer")) {
      this.promptForCustomer();
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <CardRedeem
          amountDue={this.props.businessState.stateValues.get("transaction.balanceDue")}
          tenderAmount={this.props.remainingTenderAmount}
          currency={this.props.businessState.stateValues.get("transaction.accountingCurrency")}
          cardNumber={this.state.cardNumber}
          settings={this.props.settings}
          stateValues={this.props.stateValues}
          onRedeem={this.handleCardRedeem.bind(this)}
          onCancel={this.props.onCancel}
          tenderAuthCategory={this.props.tenderAuthCategory}
          showPaymentDeviceSelection={this.state.showPaymentDeviceSelection}
          resetPaymentDeviceSelection={this.resetPaymentDeviceSelection.bind(this)}
          walletPaymentDevices={this.props.walletPaymentDevices}
          primaryGiftDevices={this.props.primaryGiftDevices}
          onCardRedeemDeviceSelected={this.onCardRedeemDeviceSelected.bind(this)}
          paymentStatus={this.props.paymentStatus}
          pinRules={this.pinRules}
          waitingForCustomer={this.state.waitingOnCustomer}
        />
      </BaseView>
    );
  }

  private resetPaymentDeviceSelection(): void {
    this.setState({
      showPaymentDeviceSelection: false,
      inputSource: undefined,
      useSwipe: false
    });
  }

  private handleCardRedeem(tenderAmount: string, cardNumber: string, pinValue: string,
                           useSwipe?: boolean, tenderAuthCategory?: TenderAuthCategory,
                           inputSource?: string): void {
    const initializedPrimaryPaymentDevices: number = this.props.walletPaymentDevices.length;
    if (this.props.useFirstDeviceOnly ||
        (initializedPrimaryPaymentDevices === 1 && tenderAuthCategory === TenderAuthCategory.Wallet)) {
          this.performCardRedeem(tenderAmount, cardNumber, pinValue, useSwipe, tenderAuthCategory,
              inputSource, this.props.walletPaymentDevices[0].code);
    } else if (initializedPrimaryPaymentDevices && tenderAuthCategory === TenderAuthCategory.Wallet) {
      this.setState({
        tenderAmount,
        cardNumber,
        pinValue,
        useSwipe,
        tenderAuthCategory,
        inputSource
      });
      this.setState({ showPaymentDeviceSelection: true });
    } else {
      if ((!cardNumber || cardNumber.trim().length === 0) && !useSwipe) {
        return;
      }

      const currency = this.props.businessState.stateValues.get("transaction.accountingCurrency");
      if (isCustomerRequiredForTender(TenderType.ValueCertificate, this.props.subType, tenderAuthCategory,
          this.props.settings.diContainer, tenderAmount, currency,
          this.props.stateValues.get("transaction.balanceDue"), this.props.settings.configurationManager) &&
          !this.props.businessState.stateValues.get("transaction.customer")) {
        this.props.updatePendingPayment(PendingPaymentMode.WaitingOnCustomer);
        this.promptForCustomer(tenderAmount, cardNumber, pinValue, useSwipe, tenderAuthCategory, inputSource);
      } else {
        this.performCardRedeem(tenderAmount, cardNumber, pinValue, useSwipe, tenderAuthCategory, inputSource);
      }
    }
  }

  private promptForCustomer(tenderAmount?: string, cardNumber?: string, pinValue?: string, useSwipe?: boolean,
                            tenderAuthCategory?: TenderAuthCategory, inputSource?: string): void {
    this.customerExitNeedsPop = true;
    this.setState({
      tenderAmount,
      cardNumber,
      pinValue,
      useSwipe,
      tenderAuthCategory,
      inputSource,
      waitingOnCustomer: true
    });
    this.props.navigation.push("customer", {
      isTransactionStarting: false,
      assignCustomer: true,
      backNavigationTitle: I18n.t("payment"),
      onExit: () => {
        if (isValueCertificateSearchEnabled(this.props.settings.configurationManager) &&
            this.props.businessState.stateValues.get("transaction.customer")?.customerNumber &&
            this.props.uiState.isAllowed(FIND_VALUE_CERTIFICATES_EVENT) && !cardNumber) {
          this.props.navigation.replace("valueCertificate", {
            partialRedeemEnabled: isValueCertificatePartialRedeemEnabled(this.props.settings.configurationManager),
            onExit: () => {
              this.props.navigation.dispatch(popTo("payment"));
              if (Theme.isTablet) {
                // TODO: DSS-14564 Replace this when value certificates are applied.
                this.props.updatePendingPayment(PendingPaymentMode.WaitingOnPayment);
                this.props.onCancel();
              }
            },
            onApply: (valueCertificate: IValueCertificateResult, tenderAmountp: string) => {
              this.onRedeemValueCertificate(valueCertificate, tenderAmountp);
            }
          });
        } else {
          if (Theme.isTablet) {
            this.props.navigation.dispatch(popTo("payment"));
            if (!this.props.businessState.stateValues.get("transaction.customer")) {
              // User selected back
              // Return to payment screen we will not be able to redeem
              this.props.updatePendingPayment(PendingPaymentMode.Completed);
              this.props.onCancel();
            }
          } else {
            // Customer event executed or completed
            // mode will be updated depending on processing, simply return to redeeming
            if (this.customerExitNeedsPop) {
              this.props.navigation.dispatch(popTo("redeem"));
            }
          }
        }
      },
      onCancel: () => {
        // User selected back
        // Return to payment screen we will not be able to redeem
        this.props.updatePendingPayment(PendingPaymentMode.Completed);
        this.props.onCancel();
      }
    });
  }

  private returningToRedeemWaitingForPayment(prevProps: Props): boolean {
    return this.props.currentScreenName !== prevProps.currentScreenName && this.props.currentScreenName === "redeem" &&
        this.props.pendingPaymentMode === PendingPaymentMode.WaitingOnPayment;
  }

  private onRedeemValueCertificate(valueCertificate: IValueCertificateResult, tenderAmount: string): void {
    this.performCardRedeem(tenderAmount, valueCertificate.accountNumber, undefined, undefined,
        TenderAuthCategory.StoredValueCertificateService, undefined, undefined, valueCertificate.valueCertificateType);
  }

  private onCardRedeemDeviceSelected(deviceId: string): void {
    this.setState({ showPaymentDeviceSelection: false });
    this.performCardRedeem(this.state.tenderAmount, this.state.cardNumber, this.state.pinValue, this.state.useSwipe,
        this.state.tenderAuthCategory, this.state.inputSource, deviceId);
  }

  private getFirstDeviceId(): string {
    return  this.props.tenderAuthCategory === TenderAuthCategory.GiftDevice ?
        undefined : this.props.walletPaymentDevices &&
        this.props.walletPaymentDevices.length > 0 && this.props.walletPaymentDevices[0].code;
  }

  private performCardRedeem(tenderAmount: string, cardNumber: string, pinValue: string,
                            useSwipe?: boolean, tenderAuthCategory?: TenderAuthCategory,
                            inputSource?: string, deviceId?: string, tenderSubType?: string): void {
    this.props.updatePendingPayment(PendingPaymentMode.Completed);
    const uiInputs: UiInput[] = [];
    if (pinValue && pinValue.trim()) {
      uiInputs.push(new UiInput(UiInputKey.GIFT_CARD_PIN, pinValue));
    }
    if (tenderSubType) {
      uiInputs.push(new UiInput(UiInputKey.TENDER_SUB_TYPE, tenderSubType));
    }

    uiInputs.push(new UiInput(UiInputKey.TENDER_AUTH_CATEGORY_NAME,
        tenderAuthCategory || TenderAuthCategory.GiftDevice));
    uiInputs.push(new UiInput(UiInputKey.TENDER_AMOUNT, tenderAmount));

    const primaryDeviceId: string = deviceId ? deviceId : this.getFirstDeviceId();
    if (primaryDeviceId && tenderAuthCategoryRequiresDevice(tenderAuthCategory)) {
      uiInputs.push(new UiInput(UiInputKey.AUTHORIZATION_DEVICE_ID, primaryDeviceId));
    }

    if (!useSwipe) {
      if (tenderAuthCategory === TenderAuthCategory.StoredValueCertificateService) {
        uiInputs.push(new UiInput(UiInputKey.VALUE_CERTIFICATE_NUMBER, cardNumber, undefined, inputSource));
      } else {
        uiInputs.push(new UiInput(UiInputKey.REDEEM_CARD_NUMBER, cardNumber, undefined, inputSource));
      }
    }
    this.props.updateUiMode(UI_MODE_TENDERING);
    this.props.businessOperation(this.props.settings.deviceIdentity, APPLY_TENDER_EVENT, uiInputs);
    if (this.props.tenderAuthCategory !== TenderAuthCategory.GiftDevice) {
      this.props.onCancel();
    }
    Keyboard.dismiss();
  }
}

function tenderAuthCategoryRequiresDevice(tenderAuthCategory: TenderAuthCategory): boolean {
  return tenderAuthCategory === TenderAuthCategory.PaymentDevice ||
      tenderAuthCategory === TenderAuthCategory.NonIntegratedDevice ||
      tenderAuthCategory === TenderAuthCategory.GiftDevice ||
      tenderAuthCategory === TenderAuthCategory.Wallet;
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    settings: state.settings,
    uiState: state.uiState,
    incomingDataEvent: state.dataEvent,
    currentScreenName: getCurrentRouteNameWithNavigationRef(),
    pendingPaymentMode: state.pendingPayment?.mode
  };
}
export default connect(mapStateToProps, {
  businessOperation: businessOperation.request,
  dataEventSuccess: dataEvent.success,
  updateUiMode: updateUiMode.request
})(CardRedeemComponent);
