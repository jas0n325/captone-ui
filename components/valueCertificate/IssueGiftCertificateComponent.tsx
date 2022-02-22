import * as React from "react";
import { connect } from "react-redux";
import I18n from "i18n-js";

import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  CONFIRM_CASH_DRAWER_CLOSED_EVENT,
  isStoredValueCertificateServiceAvailable,
  OPEN_CASH_DRAWER_EVENT,
  UiInputKey,
  StoredValueCertificateSessionState,
  ValueCertificateAction,
  RESET_CASH_DRAWER_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { ValueCertSubType } from "@aptos-scp/scp-types-commerce-devices";
import { Money } from "@aptos-scp/scp-component-business-core";

import { ActionCreator, alert, AlertRequest, businessOperation, dataEvent, DataEventType, dismissAlertModal, IKeyListenerData, updateUiMode } from "../../actions";
import {
  AppState,
  BusinessState,
  DataEventState,
  ModalState,
  SettingsState,
  UiState,
  UI_MODE_GIFT_CERTIFICATE_ISSUE
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import {
  didStoredValueCertSessionStateChange
} from "../payment/PaymentDevicesUtils";
import { NavigationProp } from "../StackNavigatorParams";
import {
  getCashDrawerEnabled,
  getMaximumIssueAmount,
  getMinimumIssueAmount,
  getQuickChoiceAmounts
} from "./ValueCertificateUtilities";
import { IssueGiftCertificateComponentProps } from "./interfaces";
import { issueGiftCertificateStyles } from "./styles";
import IssueGiftCertificate from "./IssueGiftCertificate";
import { GiftCertificateAction } from "../common/utilities";

interface StateProps {
  businessState: BusinessState;
  settings: SettingsState;
  deviceIdentity: DeviceIdentity;
  modalState: ModalState;
  uiState: UiState;
  incomingDataEvent: DataEventState;
  paymentStatus: Map<string, any>;
}

interface DispatchProps {
  alert: AlertRequest;
  dismissAlert: ActionCreator;
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  dataEventSuccess: ActionCreator;
}

interface Props extends IssueGiftCertificateComponentProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  giftCertificateNumber: string;
  scan: boolean;
  scanButtonEnabled: boolean;
  lastIssueAttempt: {giftCertificateNumber: string, amount: string, inputSource: string};
  isWaitingToExit: boolean;
}

class IssueGiftCertificateComponent extends React.Component<Props, State> {
  private styles: any;
  private minimumIssueAmount: string;
  private maximumIssueAmount: string;
  private quickChoiceAmounts: string[];
  private issueEnabled: boolean;
  private cashDrawerEnabled: boolean;
  private displayingConfirmCashDrawerClosedAlert: boolean;
  private requestedCashDrawerStatus: any;
  private reversalInProgress: boolean;
  private skipCashDrawerScreen: boolean = true;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(issueGiftCertificateStyles());

    if (!this.props.isChange) {
      this.minimumIssueAmount = getMinimumIssueAmount(props.settings.configurationManager);
      this.maximumIssueAmount = getMaximumIssueAmount(props.settings.configurationManager);
      this.quickChoiceAmounts = getQuickChoiceAmounts(props.settings.configurationManager);
    }

    this.cashDrawerEnabled = getCashDrawerEnabled(props.settings.configurationManager);

    this.reversalInProgress = this.props.businessState.stateValues.get("StoredValueCertificateSession.state") ===
        StoredValueCertificateSessionState.ReversalInProgress;
    this.issueEnabled =
        isStoredValueCertificateServiceAvailable(this.props.settings.configurationManager,
            this.props.businessState.stateValues.get("StoredValueCertificateSession.state"), ValueCertSubType.GiftCertificate);
    this.state = {
      giftCertificateNumber: null,
      scan: false,
      scanButtonEnabled: false,
      lastIssueAttempt: undefined,
      isWaitingToExit: false
    };
  }

  public componentDidMount(): void {
    if (this.cashDrawerEnabled && !(this.hasCashDrawerKey() &&
        this.props.businessState.stateValues.get("CashDrawerSession.isOpen"))) {
      const currentAction = this.getCurrentAction();
      this.props.businessState.inputs.push(new UiInput(UiInputKey.GIFT_CERT_ACTION, currentAction));

      this.skipCashDrawerScreen = false;
      this.props.navigation.push("scanDrawer", {
        eventType: OPEN_CASH_DRAWER_EVENT,
        onContinue: () => {
          this.props.navigation.pop();
          this.props.updateUiMode(UI_MODE_GIFT_CERTIFICATE_ISSUE);
        },
        onExit: () => {
          if(Theme.isTablet) {
            this.props.navigation.pop();
          }
          this.handleComponentClose()
        },
        isGiftCertIssue: true
      });
    }
  }

  public componentWillMount(): void {
    this.props.updateUiMode(UI_MODE_GIFT_CERTIFICATE_ISSUE);
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.incomingDataEvent &&
        (this.props.incomingDataEvent.eventType === DataEventType.ScanData ||
          this.props.incomingDataEvent.eventType === DataEventType.KeyListenerData) &&
        this.props.uiState.mode === UI_MODE_GIFT_CERTIFICATE_ISSUE) {
      const incomingScannerData = this.props.incomingDataEvent?.data;
      if (incomingScannerData) {
        this.setState({giftCertificateNumber: incomingScannerData.data ||
            (incomingScannerData as IKeyListenerData).inputText});
        // Clear the props
        this.props.dataEventSuccess(this.props.incomingDataEvent, false);
      }
    }
    if (didStoredValueCertSessionStateChange(this.props.businessState && this.props.businessState.stateValues,
        prevProps.businessState && prevProps.businessState.stateValues)) {
      this.issueEnabled = isStoredValueCertificateServiceAvailable(this.props.settings.configurationManager,
          this.props.businessState.stateValues.get("StoredValueCertificateSession.state"),
          ValueCertSubType.GiftCertificate, ValueCertificateAction.Issue);
      this.reversalInProgress = this.props.businessState.stateValues.get("StoredValueCertificateSession.state") ===
          StoredValueCertificateSessionState.ReversalInProgress;
    }
    const { stateValues } = this.props.businessState;
    if (!prevProps.businessState.stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer") &&
        stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer")) {
      this.handleCashDrawerClosed(stateValues);
    }
    if (!this.skipCashDrawerScreen) {
      this.handleCashDrawerPrompts(prevProps);
    }
  }

  public render(): JSX.Element {
    const currency = this.props.settings.retailLocationCurrency;
    return (
        <BaseView style={[this.styles.root, this.props.style]}>
          <IssueGiftCertificate
              settings={this.props.settings}
              minimumIssueAmount={this.minimumIssueAmount && new Money(this.minimumIssueAmount, currency)}
              maximumIssueAmount={this.maximumIssueAmount && new Money(this.maximumIssueAmount, currency)}
              quickChoiceAmounts={
                this.quickChoiceAmounts?.map((amount: string) => new Money(amount, currency))
              }
              scan ={this.state.scan}
              scanButtonEnabled={this.state.scanButtonEnabled}
              scannedCertificateNumber={this.state.giftCertificateNumber}
              onIssue={this.onIssue.bind(this)}
              onScan={this.onScan.bind(this)}
              onCancel={this.handleComponentClose.bind(this)}
              issueEnabled={this.issueEnabled}
              isRefund={this.props.isRefund}
              amount={this.props.amount}
              isChange={this.props.isChange}
              isReversalInProgress={this.reversalInProgress}
          />
        </BaseView>
    );
  }

  private onIssue(giftCertificateNumber: string, amount: string, inputSource: string): void {
    if (this.props.businessState.stateValues.get("CashDrawerSession.skipConfirmClose")) {
      this.handleRequestCashDrawerStatus(true);
    }

    if(!this.props.businessState.stateValues.get("CashDrawerSession.isOpen")) {
      this.props.onIssue(giftCertificateNumber, amount, inputSource, this.props.initialInputs);
      //reset cash drawer to clear cash drawer key
      this.resetCashDrawer();
    } else {
      this.setState({lastIssueAttempt:{giftCertificateNumber, amount, inputSource}});
      this.showConfirmDrawerClosedAlert();
    }
  }

  private onScan(): void {
    this.setState({scan: true});
  }

  private isModalShowing(): boolean {
    return !!Object.keys(this.props.modalState).find(
      (key: string) => this.props.modalState[key].show);
  }

  private showConfirmDrawerClosedAlert(): void {
    this.displayingConfirmCashDrawerClosedAlert = true;
    this.props.alert(
      I18n.t("closeDrawerTitle"),
      I18n.t("closeDrawerMessage"),
      [{ text: I18n.t("ok"), onPress: () => this.handleConfirmDrawerClosedAlertInteraction() }],
      { cancellable: true }
    );
  }

  private handleConfirmDrawerClosedAlertInteraction(): void {
    this.displayingConfirmCashDrawerClosedAlert = false;
    this.handleRequestCashDrawerStatus(true);
  }

  private handleCashDrawerPrompts = (prevProps: Props): void => {
    const { stateValues } = this.props.businessState;
    const previousStateValues = prevProps.businessState.stateValues;
    if (!this.props.modalState.blocked && !this.isModalShowing() &&
        !this.requestedCashDrawerStatus &&
        stateValues.get("CashDrawerSession.isOpen")) {
      this.handleRequestCashDrawerStatus();
    } else if (stateValues.get("transaction.waitingToClose") &&
        previousStateValues.get("CashDrawerSession.isWaitingForDrawerClosedResponse") &&
        !stateValues.get("CashDrawerSession.isWaitingForDrawerClosedResponse") &&
        !stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer") &&
        !this.props.businessState.inProgress) {
      this.showConfirmDrawerClosedAlert();
    }
  }

  private handleRequestCashDrawerStatus(tryClose?: boolean): void {
    const stateValues = this.props && this.props.businessState && this.props.businessState.stateValues;
    if (stateValues?.get("CashDrawerSession.isOpen")) {
      this.requestedCashDrawerStatus = true;
      const cashDrawerKey = stateValues.get("CashDrawerSession.cashDrawerKey");
      const uiInputs: UiInput[] = [ new UiInput(UiInputKey.CASH_DRAWER_KEY, cashDrawerKey) ];
      if (tryClose && this.props.businessState.stateValues.get("CashDrawerSession.skipConfirmClose")){
        uiInputs.push(new UiInput(UiInputKey.CASH_DRAWER_RESET, true));
      }

      this.props.performBusinessOperation(
        this.props.settings.deviceIdentity,
        CONFIRM_CASH_DRAWER_CLOSED_EVENT,
        uiInputs
      );
    }
  }

  private handleCashDrawerClosed(stateValues: Map<string, any>): void {
    if (this.displayingConfirmCashDrawerClosedAlert) {
      this.displayingConfirmCashDrawerClosedAlert = false;
      this.props.dismissAlert();
    }

    if(this.state.lastIssueAttempt){
      //retry last attempt now that drawer is closed
      this.onIssue(this.state.lastIssueAttempt.giftCertificateNumber,
          this.state.lastIssueAttempt.amount, this.state.lastIssueAttempt.inputSource);
    } else if (this.state.isWaitingToExit) {
      //retry previous close attempt now that drawer is closed
      this.handleComponentClose();
    }
  }

  private handleComponentClose(): void {
    if (this.props.businessState.stateValues.get("CashDrawerSession.skipConfirmClose")) {
      this.handleRequestCashDrawerStatus(true);
    }

    if(!this.props.businessState.stateValues.get("CashDrawerSession.isOpen")) {
      //reset cash drawer to clear cash drawer key
      this.resetCashDrawer();
      this.props.updateUiMode(undefined);
      this.props.onExit();
    } else {
      this.setState({isWaitingToExit: true});
      this.showConfirmDrawerClosedAlert();
    }
  }

  private resetCashDrawer(): void {
    if (this.hasCashDrawerKey()) {
      this.props.performBusinessOperation(
        this.props.settings.deviceIdentity,
        RESET_CASH_DRAWER_EVENT,
        []
      );
    }
  }

  private hasCashDrawerKey(): boolean {
    return !!this.props.businessState.stateValues.get("CashDrawerSession.cashDrawerKey");
  }

  private getCurrentAction(): string {
    if (this.props.isChange) {
      return GiftCertificateAction.Change;
    } else if(this.props.isRefund) {
      return GiftCertificateAction.Refund;
    } else {
      return GiftCertificateAction.Sale;
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    modalState: state.modalState,
    settings: state.settings,
    deviceIdentity: state.settings.deviceIdentity,
    uiState: state.uiState,
    incomingDataEvent: state.dataEvent
  };
};

export default connect<StateProps, DispatchProps, Omit<Props, keyof (StateProps & DispatchProps)>>(mapStateToProps, {
  alert: alert.request,
  dismissAlert: dismissAlertModal.request,
  performBusinessOperation: businessOperation.request,
  dataEventSuccess: dataEvent.success,
  updateUiMode: updateUiMode.request
})(IssueGiftCertificateComponent);
