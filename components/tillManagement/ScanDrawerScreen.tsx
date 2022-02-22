import * as React from "react";
import { View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { Money } from "@aptos-scp/scp-component-business-core";
import {
  DeviceIdentity,
  IConfigurationManager,
  IConfigurationValues,
  UiInput,
  UIINPUT_SOURCE_PRECONFIGURED
} from "@aptos-scp/scp-component-store-selling-core";
import {
  AccountabilityMode,
  CashDrawerSessionState,
  CONFIRM_CASH_DRAWER_CLOSED_EVENT,
  IDisplayInfo,
  INoSaleDisplayLine,
  IN_NO_SALE_TRANSACTION,
  ITenderDisplayLine,
  NO_SALE_EVENT,
  NO_SALE_TRANSACTION_TYPE,
  OPEN_CASH_DRAWER_EVENT,
  PAID_IN_EVENT,
  PAID_OUT_EVENT,
  PRINT_NO_SALE_RECEIPT_EVENT,
  ReceiptCategory,
  SAFE_TO_TILL_EVENT,
  START_NO_SALE_EVENT,
  TenderAuthCategory,
  TENDER_CHANGE_LINE_TYPE,
  TENDER_EXCHANGE_EVENT,
  TENDER_EXCHANGE_OUT_LINE_TYPE,
  TENDER_PAYMENT_LINE_TYPE,
  TENDER_REFUND_LINE_TYPE,
  TILL_AUDIT_EVENT,
  TILL_COUNT_EVENT,
  TILL_IN_EVENT,
  TILL_OUT_EVENT,
  TILL_RECONCILIATION_EVENT,
  TILL_TO_BANK_EVENT,
  TILL_TO_SAFE_EVENT,
  UiInputKey,
  USER_CONTINUE_CASH_DRAWER_OPEN_EVENT,
  VOID_CASH_DRAWER_TENDER_EVENT,
  VOID_NO_SALE_TRANSACTION_EVENT,
  VOID_TENDER_CONTROL_TRANSACTION_EVENT,
  VOID_TILL_CONTROL_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { ReceiptType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertRequest,
  businessOperation,
  dataEvent,
  DataEventType,
  dismissAlertModal,
  updateUiMode,
  validateCashDrawer
} from "../../actions";
import {
  AppState,
  BusinessState,
  CashDrawerState,
  DataEventState,
  RetailLocationsState,
  SettingsState,
  UiState,
  UI_MODE_TILL_OPERATION
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { renderInputField, RenderSelectOptions } from "../common/FieldValidation";
import Header, { HeaderButton } from "../common/Header";
import { InputType } from "../common/Input";
import { getStoreLocale, getStoreLocaleCurrencyOptions, isFranceLocation } from "../common/utilities";
import { getFeatureAccessConfig, getReasonOptions } from "../common/utilities/configurationUtils";
import { popTo } from "../common/utilities/navigationUtils";
import { tenderOpensCashDrawer } from "../common/utilities/tenderLineUtils";
import {
  getStartEventFromTillEvent,
  getTitle18nCode,
  getVoidTitle18nCode
} from "../common/utilities/tillManagementUtilities";
import ReceiptOptionForm from "../receipt/ReceiptOptionForm";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { ScanDrawerScreenProps } from "./interfaces";
import { scanDrawerStyle } from "./styles";
import { cameraScannerInputStyles } from "../common/styles";
import OfflineNotice from "../common/OfflineNotice";

interface ScanDrawerForm {
  cashDrawerKey: string;
}

interface IGiftCertificateInputState {
  retryChange?: boolean;
  supervisorOverride?: any;
  action?: string;
  tenderId?: number
}

interface StateProps {
  businessState: BusinessState;
  cashDrawerState: CashDrawerState;
  configurationManager: IConfigurationManager;
  currentScreenName: string;
  deviceIdentity: DeviceIdentity;
  incomingDataEvent: DataEventState;
  settings: SettingsState;
  uiState: UiState;
  displayInfo: IDisplayInfo;
  retailLocations: RetailLocationsState;
}

interface DispatchProps {
  alert: AlertRequest;
  businessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  dataEvent: ActionCreator;
  dataEventSuccess: ActionCreator;
  dismissAlertModal: ActionCreator;
  validateCashDrawerRequest: ActionCreator;
  validateCashDrawerSuccess: ActionCreator;
}

interface Props extends ScanDrawerScreenProps, StateProps, DispatchProps, NavigationScreenProps<"scanDrawer"> {}

interface State {
  closeCashDrawerAlertShowing: boolean;
  showReceiptForm: boolean;
  accountabilityMode: AccountabilityMode;
  giftCertificateInputState: IGiftCertificateInputState;
}

class ScanDrawerScreen extends React.Component<Props & InjectedFormProps<ScanDrawerForm, Props> &
    FormInstance<ScanDrawerForm, undefined>, State> {
  private noSaleReceiptRequired: boolean;
  private styles: any;
  private inputStyles: any;
  private reasonCodeListType: string;
  private reasons: RenderSelectOptions[];
  private isManuallyContinuing: boolean;
  private shouldProceedToTillDetails: boolean;
  private shouldProceedToPaidDetails: boolean;
  private eventTypeToVoidFunction: Map<string, () => void>;
  private lastOpenDrawerTender: ITenderDisplayLine;
  private changeTender: ITenderDisplayLine;

  public constructor(props: Props & InjectedFormProps<ScanDrawerForm, Props> &
      FormInstance<ScanDrawerForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(scanDrawerStyle());
    this.inputStyles = Theme.getStyles(cameraScannerInputStyles());

    this.handleNoSale = this.handleNoSale.bind(this);

    if (this.props.eventType === NO_SALE_EVENT) {
      const featureConfig = getFeatureAccessConfig(props.settings.configurationManager, this.props.eventType);
      if (featureConfig && featureConfig.reasonCodeListType) {
        this.reasonCodeListType = featureConfig.reasonCodeListType;
        this.reasons = this.reasonCodeListType &&
            getReasonOptions(props.settings.configurationManager, this.reasonCodeListType);
      }
    }
    const noSaleEventConfig: IConfigurationValues = getFeatureAccessConfig(
      this.props.configurationManager,
      NO_SALE_EVENT
    );
    this.noSaleReceiptRequired = noSaleEventConfig && noSaleEventConfig.printReceipt;

    this.changeTender = this.getChangeTender(this.props.businessState.displayInfo?.tenderDisplayLines);

    const openDrawerTenders = this.getOpenDrawerTenders(
        this.props.businessState.displayInfo?.tenderDisplayLines,
        this.changeTender
    );

    this.lastOpenDrawerTender = this.getLastOpenDrawerTender(openDrawerTenders);

    this.fireManuallyContinueEvent = this.fireManuallyContinueEvent.bind(this);
    this.moveToTillDetailScreen = this.moveToTillDetailScreen.bind(this);
    this.moveToPaidDetailScreen = this.moveToPaidDetailScreen.bind(this);
    this.moveToDetailScreen = this.moveToDetailScreen.bind(this);
    this.retryAutomaticCashDrawerOpen = this.retryAutomaticCashDrawerOpen.bind(this);
    this.voidNoSale = this.voidNoSale.bind(this);
    this.voidTill = this.voidTill.bind(this);
    this.voidTenderControlTransaction = this.voidTenderControlTransaction.bind(this);
    this.reselectDrawer = this.reselectDrawer.bind(this);
    this.handleVoidSelected = this.handleVoidSelected.bind(this);

    this.eventTypeToVoidFunction = new Map<string, () => void>([
      [TILL_IN_EVENT, this.voidTill],
      [TILL_OUT_EVENT, this.voidTill],
      [TILL_COUNT_EVENT, this.voidTill],
      [TILL_AUDIT_EVENT, this.voidTill],
      [TILL_RECONCILIATION_EVENT, this.voidTill],
      [TILL_TO_BANK_EVENT, this.voidTill],
      [NO_SALE_EVENT, this.voidNoSale],
      [PAID_IN_EVENT, this.voidTenderControlTransaction],
      [PAID_OUT_EVENT, this.voidTenderControlTransaction],
      [SAFE_TO_TILL_EVENT, this.voidTenderControlTransaction],
      [TILL_TO_SAFE_EVENT, this.voidTenderControlTransaction],
      [TENDER_EXCHANGE_EVENT, this.voidTenderControlTransaction]
    ]);

    this.isManuallyContinuing = false;

    const giftCertificateInputState = this.props.isGiftCertIssue && this.buildGiftCertificateInputState();

    this.state = {
      showReceiptForm: false,
      closeCashDrawerAlertShowing: undefined,
      accountabilityMode: undefined,
      giftCertificateInputState
    };

    this.shouldProceedToTillDetails = (this.props.eventType === TILL_IN_EVENT || this.props.eventType === TILL_OUT_EVENT
        || this.props.eventType === TILL_COUNT_EVENT || this.props.eventType === TILL_TO_BANK_EVENT ||
        this.props.eventType === TILL_RECONCILIATION_EVENT || this.props.eventType === SAFE_TO_TILL_EVENT ||
        this.props.eventType === TILL_TO_SAFE_EVENT || this.props.eventType === TILL_AUDIT_EVENT);
    this.shouldProceedToPaidDetails =
        (this.props.eventType === PAID_IN_EVENT || this.props.eventType === PAID_OUT_EVENT);
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_TILL_OPERATION);
    const { stateValues } = this.props.businessState;
    this.handleAccountabilityMode(stateValues);

    if (this.props.startup && this.props.eventType === NO_SALE_EVENT) {
      const noSaleLine: INoSaleDisplayLine = this.props.displayInfo && this.props.displayInfo.noSaleDisplayLines &&
          this.props.displayInfo.noSaleDisplayLines[0];
      const cashDrawerKey = noSaleLine && noSaleLine.cashDrawerKey || this.cashDrawerKey;

      // IN_NO_SALE_TRANSACTION_WAITING is handled by the CashDrawerSessionListener
      if (this.props.uiState.logicalState === IN_NO_SALE_TRANSACTION && cashDrawerKey) {
        if (noSaleLine && stateValues.get("CashDrawerSession.state") === CashDrawerSessionState.NoCashDrawer) {
          this.moveToReasonComments();
        } else {
          stateValues.get("CashDrawerSession.state") === CashDrawerSessionState.Open
              ? this.confirmCashDrawerClosed()
              : this.handleNoSaleReceiptBehavior();
        }
      }
    }

    if (this.props.continueWithPreviousDrawer && this.props.previousCashDrawerKey) {
      if (this.props.cashDrawerState.cashDrawer) {
        this.processStartTillEvent(this.props.cashDrawerState);
      } else {
        this.props.validateCashDrawerSuccess({
          cashDrawerKey: this.props.previousCashDrawerKey,
          alternateKey: this.props.previousAlternateKey
        }, this.props.inputSource);
      }
    }

  }

  public componentDidUpdate(prevProps: Props): void {
    const { businessState, cashDrawerState } = this.props;

    // Post validation, display failed validation message otherwise proceed to tillDetails screen
    if (!cashDrawerState.inProgress && prevProps.cashDrawerState.inProgress) {
      if (cashDrawerState.error) {
        this.props.alert(
          I18n.t("invalidCashDrawerTitle"),
          I18n.t("invalidCashDrawerMessage"),
          [{ text: I18n.t("ok"), style: "cancel" }],
          { cancelable: true }
        );
      } else if (cashDrawerState.cashDrawer.hasTerminal &&
          this.state.accountabilityMode === AccountabilityMode.Shared) {
        this.props.alert(
          I18n.t("unableToOpenDrawerTitle"),
          I18n.t("unableToOpenDrawerMessage"),
          [{ text: I18n.t("ok"), style: "cancel" }],
          { cancelable: false }
        );
      } else {
        this.processStartTillEvent(cashDrawerState);
      }
    } else if (this.props.continueWithPreviousDrawer && this.props.previousCashDrawerKey &&
        !prevProps.cashDrawerState.cashDrawer && cashDrawerState.cashDrawer) {
      this.processStartTillEvent(cashDrawerState);
    }

    this.showNoSaleReasonComments(prevProps);

    this.handleCashDrawerStateChange(prevProps);

    const cashDrawerNotConfiguredForTerminal: boolean = prevProps.businessState.inProgress &&
        !businessState.inProgress && cashDrawerState.cashDrawer && !!businessState.error;
    if (cashDrawerNotConfiguredForTerminal) {
      this.props.reset();
    }

    this.preserveUiMode(prevProps);

    this.handleNoSaleEnded(prevProps);

    this.handleVoidCashDrawerTenderEvent(prevProps);
  }

  public componentWillUnmount(): void {
    if (this.props.eventType !== VOID_CASH_DRAWER_TENDER_EVENT &&
          !this.props.isGiftCertIssue) {
      this.props.updateUiMode(undefined);
    }
  }

  public render(): JSX.Element {
    const inputStyles = this.inputStyles;

    return (
      <BaseView style={this.styles.fill}>
        <Header
          isVisibleTablet={Theme.isTablet}
          title={I18n.t(getTitle18nCode(this.props.eventType))}
          backButton={this.getBackButton()}
        />
        <OfflineNotice />
        <View style={this.styles.root}>
          {
            !this.state.showReceiptForm && this.state.accountabilityMode !== AccountabilityMode.Terminal &&
            <Field
              name="cashDrawerKey"
              component={renderInputField}
              inputContainerStyle={inputStyles.transparentBackground}
              style={inputStyles.inputPanel}
              inputStyle={inputStyles.inputField}
              cameraIcon={{
                icon: "Camera",
                size: inputStyles.cameraIcon.fontSize,
                color: inputStyles.cameraIcon.color,
                position: "right",
                style: inputStyles.cameraIconPanel
              }}
              placeholder={I18n.t("drawerID")}
              placeholderSentenceCase={false}
              settings={this.props.settings}
              errorStyle={inputStyles.inputError}
              placeholderStyle={inputStyles.placeholderStyle}
              inputType={InputType.text}
              returnKeyType={"done"}
              autoCapitalize={"none"}
            />
          }
          {
            this.state.showReceiptForm &&
            <ReceiptOptionForm
              styles={this.styles.receiptOptionsArea}
              providedReceiptCategory={ReceiptCategory.NoSale}
              onClose={this.receiptOptionFormOnClose.bind(this)}
              navigation={this.props.navigation}
            />
          }
        </View>
      </BaseView>
    );
  }

  private handleVoidCashDrawerTenderEvent(prevProps: Props): void {
    const { businessState } = this.props;
    if (prevProps.businessState.inProgress && !businessState.inProgress && businessState.eventType === VOID_CASH_DRAWER_TENDER_EVENT) {
      const changeTender = this.getChangeTender(prevProps.businessState.displayInfo?.tenderDisplayLines);
      const openDrawerTenders = this.getOpenDrawerTenders(
        prevProps.businessState.displayInfo.tenderDisplayLines,
        changeTender
      );
      const lastOpenDrawerTender: ITenderDisplayLine = this.getLastOpenDrawerTender(openDrawerTenders);
      const lineVoided = prevProps.businessState.displayInfo?.tenderDisplayLines?.find(
        (displayLine: ITenderDisplayLine) => displayLine.lineNumber === lastOpenDrawerTender.lineNumber
      );
      this.props.navigation.replace("payment", {
        tenderVoidMessage: I18n.t("tenderVoidMessage", {
          tenderName: lineVoided.tenderName,
          tenderAmount: lineVoided.tenderAmount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())
        })
      })
    }
  }

  private getTenderLine(): ITenderDisplayLine {
    return this.props.businessState.displayInfo?.tenderDisplayLines?.find((tenderDisplayLine: ITenderDisplayLine) =>
        tenderDisplayLine.lineType === TENDER_REFUND_LINE_TYPE ||
        tenderDisplayLine.lineType === TENDER_EXCHANGE_OUT_LINE_TYPE
    );
  }

  private handleAccountabilityMode(stateValues: Map<string, any>): void {
    const accountabilityMode: AccountabilityMode = stateValues && stateValues.get("TerminalSession.accountabilityMode");
    this.setState({ accountabilityMode });
    if (accountabilityMode === AccountabilityMode.Terminal) {
      const fixedCashDrawerKey: string = stateValues && stateValues.get("TerminalSession.cashDrawerKey");
      const tillInDrawer: boolean = stateValues && stateValues.get("TillSession.inDrawer");
      const tillInactive: boolean = stateValues && stateValues.get("TillSession.inactive");
      const tillNotInDrawer: boolean = stateValues && stateValues.get("TillSession.notInDrawer");
      const tenderLine: ITenderDisplayLine = this.getTenderLine();

      if (this.props.eventType === TILL_IN_EVENT && (tillInDrawer || tillInactive)) {
        this.handleTerminalAccountabilityAlert("tillInAlreadyPerformed");
      } else if (this.props.eventType === TILL_OUT_EVENT && tillNotInDrawer) {
        this.handleTerminalAccountabilityAlert("tillOutAlreadyPerformed");
      } else if (this.checkIfTillInRequired(tillInDrawer, tillInactive)) {
        this.handleTerminalAccountabilityAlert("tillInRequired");
      } else if (this.props.eventType === TILL_COUNT_EVENT ) {
        this.handleTerminalAccountabilityTillCount(fixedCashDrawerKey, tillInactive, tillInDrawer);
      } else if (tenderLine && tillInDrawer) {
        this.handleTerminalAccountabilityRefund(stateValues, tenderLine, fixedCashDrawerKey);
      } else {
        this.props.validateCashDrawerRequest(fixedCashDrawerKey, DataEventType.KeyedData, UIINPUT_SOURCE_PRECONFIGURED);
      }
    }
  }

  private buildGiftCertificateInputState(): IGiftCertificateInputState {
    const retryInput = this.props.businessState.inputs.find((i) => i.inputKey === UiInputKey.RETRY_CHANGE);
    const supervisorInput = this.props.businessState.inputs.find((i) => i.inputKey === UiInputKey.SUPERVISOR_OVERRIDE);
    const giftCertActionInput = this.props.businessState.inputs.find((i) => i.inputKey === UiInputKey.GIFT_CERT_ACTION);

    let tenderIdInput = this.props.businessState.inputs.find((i) => i.inputKey === UiInputKey.TENDER_ID);
    const changeInputOptions = this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.changeInputOptions");
    tenderIdInput = tenderIdInput || changeInputOptions?.inputs?.find((i: UiInput) => i.inputKey === UiInputKey.TENDER_ID);

    const giftCertificateInputState: IGiftCertificateInputState = {
      action: giftCertActionInput?.inputValue,
      retryChange: retryInput?.inputValue,
      supervisorOverride: supervisorInput?.inputValue,
      tenderId: tenderIdInput?.inputValue
    };
    return giftCertificateInputState;
  }

  private checkIfTillInRequired(tillInDrawer: boolean, tillInactive: boolean): boolean {
      const eventsRequireActiveTillInDrawer: string[] = [
        OPEN_CASH_DRAWER_EVENT,
        PAID_IN_EVENT,
        PAID_OUT_EVENT,
        TILL_RECONCILIATION_EVENT,
        TILL_OUT_EVENT,
        TENDER_EXCHANGE_EVENT
    ];
    const eventsRequireTillInDrawer: string[] = [
        SAFE_TO_TILL_EVENT,
        TILL_TO_SAFE_EVENT,
        TILL_TO_BANK_EVENT,
        TILL_COUNT_EVENT,
        TILL_AUDIT_EVENT
    ];
    return (eventsRequireActiveTillInDrawer.includes(this.props.eventType) && !tillInDrawer) ||
      (eventsRequireTillInDrawer.includes(this.props.eventType) && !(tillInDrawer || tillInactive)) ||
      (this.props.eventType === TILL_AUDIT_EVENT && !tillInDrawer);
  }

  private handleTerminalAccountabilityTillCount(fixedCashDrawerKey: string, tillInactive: boolean,
      tillInDrawer: boolean): void {
    const disallowTillEventsAfterFinalTillSettlement: boolean =
        this.props.configurationManager.getStoreAccountingComponentValues().disallowTillEventsAfterFinalTillSettlement;
    if (disallowTillEventsAfterFinalTillSettlement && !tillInactive) {
      this.handleTerminalAccountabilityAlert("tillReconciliationRequired");
    } else if (!disallowTillEventsAfterFinalTillSettlement && !tillInDrawer) {
      this.handleTerminalAccountabilityAlert("tillInRequired");
    } else {
      this.props.validateCashDrawerRequest(fixedCashDrawerKey, DataEventType.KeyedData, UIINPUT_SOURCE_PRECONFIGURED);
    }
  }

  private handleTerminalAccountabilityRefund(stateValues: Map<string, any>, refundTypeLine: ITenderDisplayLine,
        fixedCashDrawerKey: string): void {
    const tenderBalance: Money  = stateValues && stateValues.get("TillSession.tenderBalances")?.find((tender: any) =>
        tender.tenderId === refundTypeLine.tenderId)?.amount;
    if (tenderBalance.isNegative()) {
      this.handleTerminalAccountabilityAlert("tillInsufficientFund");
    } else {
      this.props.validateCashDrawerRequest(fixedCashDrawerKey, DataEventType.KeyedData, UIINPUT_SOURCE_PRECONFIGURED);
    }
  }

  private handleTerminalAccountabilityAlert(message: string): void {
    this.props.alert(
      "",
      I18n.t(message),
      [{ text: I18n.t("ok"), onPress: () =>
        {
          if(this.shouldProceedToTillDetails || this.shouldProceedToPaidDetails){
            this.props.navigation.dispatch(popTo("storeOperations"));
          } else if(this.props.eventType === TENDER_EXCHANGE_EVENT) {
            this.voidTenderControlTransaction();
          } else if (this.props.isGiftCertIssue) {
            this.onExitScreen();
          } else {
            const changeTender = this.getChangeTender(this.props.businessState.displayInfo?.tenderDisplayLines);
            const openDrawerTenders = this.getOpenDrawerTenders(
              this.props.businessState.displayInfo.tenderDisplayLines,
              changeTender
            );
            const lastOpenDrawerTender: ITenderDisplayLine = this.getLastOpenDrawerTender(openDrawerTenders);
            this.voidTender(
              lastOpenDrawerTender.lineNumber,
              changeTender && changeTender.lineNumber
            );
          }
        }
      }],
      {cancelable: false}
    );
  }

  private receiptOptionFormOnClose(): void {
    this.setState({showReceiptForm: false});
    this.props.navigation.dispatch(popTo(this.props.startup ? "main" : "storeOperations"));
  }

  private processStartTillEvent(cashDrawerState: CashDrawerState): void {
    const { alternateKey } = cashDrawerState.cashDrawer;
    const inputSource: string = cashDrawerState.inputSource;
    this.props.change("cashDrawerKey", this.cashDrawerKey);

    const uiInputs: UiInput[] = [];

    if (this.props.isGiftCertIssue) {
      uiInputs.push(new UiInput(UiInputKey.IS_GIFT_CERT_ISSUE, true));

      if (this.state.giftCertificateInputState?.retryChange){
        uiInputs.push(new UiInput(UiInputKey.RETRY_CHANGE, this.state.giftCertificateInputState.retryChange));
      }

      if (this.state.giftCertificateInputState?.supervisorOverride){
        uiInputs.push(new UiInput(UiInputKey.TENDER_FALLBACK_SUPERVISOR_OVERRIDE, this.state.giftCertificateInputState.supervisorOverride));
      }

      if (this.state.giftCertificateInputState?.action){
        uiInputs.push(new UiInput(UiInputKey.GIFT_CERT_ACTION, this.state.giftCertificateInputState.action));
      }

      if (this.state.giftCertificateInputState?.tenderId) {
        uiInputs.push(new UiInput(UiInputKey.TENDER_ID, this.state.giftCertificateInputState.tenderId));
      }
    } else {
      uiInputs.push(new UiInput(UiInputKey.IS_GIFT_CERT_ISSUE, false));
    }

    uiInputs.push(new UiInput(UiInputKey.CASH_DRAWER_KEY, this.cashDrawerKey, undefined, inputSource));
    uiInputs.push(new UiInput(UiInputKey.ALTERNATE_KEY, alternateKey));
    if (this.props.expectedAmount) {
      uiInputs.push(new UiInput(UiInputKey.TILL_EXPECTED_AMOUNT, this.props.expectedAmount));
    }
    if (this.props.continueWithPreviousDrawer) {
      uiInputs.push(new UiInput(UiInputKey.FROM_TILL_SUCCESS, true, "boolean"));
    }
    this.props.businessOperation(this.props.deviceIdentity,
        getStartEventFromTillEvent(this.props.eventType), uiInputs);
  }

  private showNoSaleReasonComments(prevProps: Props): void {
    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress) {
      if (!this.props.businessState.error && this.props.businessState.eventType === START_NO_SALE_EVENT) {
        this.moveToReasonComments();
      }
    }
  }

  private moveToReasonComments = (): void => {
    this.props.navigation.push("varianceReason", {
      eventType: this.props.eventType,
      reasons: this.reasons,
      hideBackButton: true,
      onSave: this.handleNoSale
    });
  }

  private handleNoSale(comment: string, reason: RenderSelectOptions): void {

    const uiInputs: UiInput[] = [];
    const noSaleLine: INoSaleDisplayLine = this.props.displayInfo && this.props.displayInfo.noSaleDisplayLines &&
        this.props.displayInfo.noSaleDisplayLines[0];
    const cashDrawerKey = noSaleLine && noSaleLine.cashDrawerKey || this.cashDrawerKey;
    const inputSource: string = noSaleLine && noSaleLine.inputSource ||
        this.props.cashDrawerState && this.props.cashDrawerState.inputSource;

    uiInputs.push(new UiInput(UiInputKey.CASH_DRAWER_KEY, cashDrawerKey, undefined, inputSource));

    if (reason) {
      uiInputs.push(new UiInput(UiInputKey.REASON_CODE, reason.code));
      uiInputs.push(new UiInput(UiInputKey.REASON_DESCRIPTION, reason.description));
      uiInputs.push(new UiInput(UiInputKey.REASON_LIST_TYPE, this.reasonCodeListType));
    }
    if (comment) {
      uiInputs.push(new UiInput(UiInputKey.NO_SALE_COMMENT, comment));
    }
    this.props.businessOperation(this.props.deviceIdentity, NO_SALE_EVENT, uiInputs);
    this.props.navigation.pop(); // Need to pop out of reason screen.
  }

  // tslint:disable-next-line:cyclomatic-complexity
  private handleCashDrawerStateChange(prevProps: Props): void {
    const cashDrawerSessionState: CashDrawerSessionState = this.props.businessState.stateValues.get(
      "CashDrawerSession.state"
    );

    const prevCashDrawerSessionState: CashDrawerSessionState = prevProps.businessState.stateValues.get(
      "CashDrawerSession.state"
    );

    if (this.props.isGiftCertIssue && this.props.onContinue && ((prevCashDrawerSessionState === CashDrawerSessionState.WaitingForOpenDrawerResponse &&
        prevCashDrawerSessionState !== cashDrawerSessionState && cashDrawerSessionState === CashDrawerSessionState.Open) ||
        (cashDrawerSessionState === prevCashDrawerSessionState && cashDrawerSessionState === CashDrawerSessionState.Closed &&
        this.isManuallyContinuing))) {
      this.props.onContinue();
    } else {
      if (prevCashDrawerSessionState === CashDrawerSessionState.WaitingForOpenDrawerResponse &&
          prevCashDrawerSessionState !== cashDrawerSessionState) {
        if (cashDrawerSessionState === CashDrawerSessionState.Open) {
          if (this.props.eventType === NO_SALE_EVENT) {
            this.confirmCashDrawerClosed();
          } else if (this.props.eventType === OPEN_CASH_DRAWER_EVENT) {
            if (isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager)) {
              this.props.navigation.replace("receiptSummary", {
                receiptCategory: ReceiptCategory.VatReceipt
              });
            } else {
              this.props.navigation.replace("receiptSummary", {
                receiptCategory: ReceiptCategory.Receipt
              });
            }
          } else if (this.props.eventType === TENDER_EXCHANGE_EVENT) {
            this.props.navigation.replace("receiptSummary", {
              receiptCategory: ReceiptCategory.TenderExchange
            });
          } else {
            this.moveToDetailScreen();
          }
        } else if (cashDrawerSessionState === CashDrawerSessionState.Closed) {
          const changeTender = this.getChangeTender(this.props.businessState.displayInfo?.tenderDisplayLines);

          const openDrawerTenders = this.getOpenDrawerTenders(
              this.props.businessState.displayInfo?.tenderDisplayLines,
              changeTender
          );

          const lastOpenDrawerTender: ITenderDisplayLine = this.getLastOpenDrawerTender(openDrawerTenders);

          if (this.props.eventType === OPEN_CASH_DRAWER_EVENT) {
            const voidTenderTypeText = I18n.t("voidTenderType", { tenderName: lastOpenDrawerTender &&
                lastOpenDrawerTender.tenderName });
            const localizedTenderAmount = lastOpenDrawerTender &&
                lastOpenDrawerTender.tenderAmount.toLocaleString(getStoreLocale()
              , getStoreLocaleCurrencyOptions());
            const isTerminalAccountabilityMode: boolean = this.state.accountabilityMode === AccountabilityMode.Terminal;
            const buttons = [
              isTerminalAccountabilityMode ? { text: I18n.t("retry"), onPress: this.retryAutomaticCashDrawerOpen } :
                  { text: I18n.t("selectDrawer"), onPress: this.reselectDrawer },
              { text: I18n.t("override"), onPress: () => this.fireManuallyContinueEvent(true) }
            ];

            if (isVoidTenderAllowed(lastOpenDrawerTender, changeTender, this.props.isGiftCertIssue)) {
              buttons.push({
                text: `${voidTenderTypeText} ${localizedTenderAmount}`,
                onPress: () => this.voidTender(
                    lastOpenDrawerTender.lineNumber,
                    changeTender && changeTender.lineNumber
                )
              });
            }
            this.props.alert(
                undefined,
                I18n.t("cantOpenDrawerTitle"),
                buttons,
                {cancelable: false, defaultButtonIndex: 2}
              );
          } else if (this.props.eventType === TENDER_EXCHANGE_EVENT) {
            const isTerminalAccountabilityMode: boolean = this.state.accountabilityMode === AccountabilityMode.Terminal;
            this.props.alert(
              undefined,
              I18n.t("cantOpenDrawerTitle"),
              [
                isTerminalAccountabilityMode ? { text: I18n.t("retry"), onPress: this.retryAutomaticCashDrawerOpen } :
                      { text: I18n.t("selectDrawer"), onPress: this.reselectDrawer },
                { text: I18n.t("override"), onPress: () => this.fireManuallyContinueEvent() }
              ],
              { cancelable: false, defaultButtonIndex: 2 }
            );
          } else {
            const voidButtonI18nCode = getVoidTitle18nCode(this.props.eventType);

            this.props.alert(
              undefined,
              I18n.t("cantOpenDrawerTitle"),
              [
                { text: I18n.t("retry"), onPress: this.retryAutomaticCashDrawerOpen },
                { text: I18n.t("override"), onPress: () => this.fireManuallyContinueEvent() },
                {
                  text: I18n.t(voidButtonI18nCode),
                  onPress: this.handleVoidSelected
                }
              ],
              { cancelable: false, defaultButtonIndex: 2 }
            );
          }
        }
      } else if (!this.props.isGiftCertIssue && prevCashDrawerSessionState === CashDrawerSessionState.WaitingForDrawerClosedResponse &&
          prevCashDrawerSessionState !== cashDrawerSessionState) {
        if (cashDrawerSessionState === CashDrawerSessionState.Closed) {
          this.handleNoSaleReceiptBehavior();
        } else {
          this.setState({ closeCashDrawerAlertShowing: true });
          this.props.alert(
            I18n.t("closeDrawerTitle"),
            I18n.t("closeDrawerNoSale"),
            [{
              text: I18n.t("ok"),
              onPress: () => this.props.businessOperation(this.props.deviceIdentity, CONFIRM_CASH_DRAWER_CLOSED_EVENT, [
                new UiInput(UiInputKey.CASH_DRAWER_KEY, this.cashDrawerKey)
              ])
            }]
          );
        }
      } else if (!this.props.isGiftCertIssue && prevCashDrawerSessionState !== CashDrawerSessionState.Closed &&
            cashDrawerSessionState === CashDrawerSessionState.Closed) {
        if (this.state.closeCashDrawerAlertShowing) {
          this.setState({ closeCashDrawerAlertShowing: false });
          this.props.dismissAlertModal();
        }
        this.handleNoSaleReceiptBehavior();
      } else if (prevCashDrawerSessionState === CashDrawerSessionState.Closed &&
          cashDrawerSessionState === CashDrawerSessionState.Open) {
        if (this.props.eventType === NO_SALE_EVENT) {
          this.confirmCashDrawerClosed();
        } else {
          this.moveToDetailScreen();
        }
      } else if (cashDrawerSessionState === prevCashDrawerSessionState &&
        cashDrawerSessionState === CashDrawerSessionState.Closed && this.isManuallyContinuing) {
        if (this.props.eventType === OPEN_CASH_DRAWER_EVENT) {
          if (isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager)) {
            this.props.navigation.replace("receiptSummary", {
              receiptCategory: ReceiptCategory.VatReceipt
            });
          } else {
            this.props.navigation.replace("receiptSummary", {
              receiptCategory: ReceiptCategory.Receipt
            });
          }
        } else if (this.props.eventType === TENDER_EXCHANGE_EVENT) {
          this.props.navigation.replace("receiptSummary", {
            receiptCategory: ReceiptCategory.TenderExchange
          });
        }
      }
    }
  }

  private getChangeTender(tenderDisplayLines: ITenderDisplayLine[]): ITenderDisplayLine {
    return tenderDisplayLines?.find((tenderDisplayLine: ITenderDisplayLine) =>
        tenderDisplayLine.lineType === TENDER_CHANGE_LINE_TYPE
    );
  }

  private getOpenDrawerTenders(
      tenderDisplayLines: ITenderDisplayLine[],
      changeTender: ITenderDisplayLine
  ): ITenderDisplayLine[] {

    if (changeTender && tenderOpensCashDrawer(changeTender,
          this.props.configurationManager.getTendersValues().tenderDefinitions)) {
      const tenderPaymentLine = tenderDisplayLines && tenderDisplayLines.filter((displayLine: ITenderDisplayLine) =>
        displayLine.lineType === TENDER_PAYMENT_LINE_TYPE ||
        displayLine.lineType === TENDER_REFUND_LINE_TYPE
      );
      return tenderPaymentLine && tenderPaymentLine.length > 0 &&
          [tenderPaymentLine[tenderPaymentLine.length - 1]];
    }

    return tenderDisplayLines?.filter((tenderDisplayLine: ITenderDisplayLine) => (
          tenderDisplayLine.lineType === TENDER_PAYMENT_LINE_TYPE ||
          tenderDisplayLine.lineType === TENDER_REFUND_LINE_TYPE
        ) && (
          tenderDisplayLine.tenderId === (changeTender && changeTender.tenderId) ||
          tenderOpensCashDrawer(
              tenderDisplayLine,
              this.props.configurationManager.getTendersValues().tenderDefinitions
          )
        )
    );
  }

  private getLastOpenDrawerTender(openDrawerTenders: ITenderDisplayLine[]): ITenderDisplayLine {
    let lastOpenDrawerTender: ITenderDisplayLine = undefined;
    if (openDrawerTenders) {
      openDrawerTenders.forEach((tender: ITenderDisplayLine) => {
        if (!lastOpenDrawerTender || tender.lineNumber > lastOpenDrawerTender.lineNumber) {
          lastOpenDrawerTender = tender;
        }
      });
    }
    return lastOpenDrawerTender;
  }

  private shouldAllowExit(): boolean {
    return this.props.eventType !== TENDER_EXCHANGE_EVENT && (!this.lastOpenDrawerTender ||
        isVoidTenderAllowed(this.lastOpenDrawerTender, this.changeTender));
  }

  private getBackButton = (): HeaderButton => {
    if (this.state.showReceiptForm || !this.shouldAllowExit()) {
        return <View/>
    } else  {
      return {
        name: "Back",
        title: Theme.isTablet && this.shouldProceedToTillDetails
            ? I18n.t("tillManagement") : undefined,
        action: () => this.onExitScreen()
      }
    }
  }

  private onExitScreen(): void {
    //if onExit prop is defined then use that otherwise fallback on pop.
    const onExit = this.props.onExit || this.props.navigation.pop;
    if (!this.state.showReceiptForm) {
      if (this.props.businessState.displayInfo && this.props.businessState.displayInfo.tenderDisplayLines) {
        const changeTender = this.getChangeTender(this.props.businessState.displayInfo.tenderDisplayLines);

        const openDrawerTenders = this.getOpenDrawerTenders(
            this.props.businessState.displayInfo.tenderDisplayLines,
            changeTender
        );

        const lastOpenDrawerTender: ITenderDisplayLine = this.getLastOpenDrawerTender(openDrawerTenders);

        if (lastOpenDrawerTender && !this.props.isGiftCertIssue) {
          const tenderAmount: string = lastOpenDrawerTender &&
              lastOpenDrawerTender.tenderAmount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions());

          this.props.alert(
              I18n.t("voidTender"),
              `${I18n.t("voidCashDrawerTenderMessage")} ${tenderAmount}`,
              [
                {text: I18n.t("cancel"), onPress: this.reselectDrawer, style: "cancel"},
                {
                  text: I18n.t("okCaps"),
                  onPress: () => this.voidTender(
                      lastOpenDrawerTender.lineNumber,
                      changeTender && changeTender.lineNumber
                  )
                }
              ],
              {cancelable: true, defaultButtonIndex: 0}
          );
        } else if ((!lastOpenDrawerTender && !changeTender) || this.props.isGiftCertIssue) {
          onExit();
        }
      } else {
        onExit();
      }
    }
  }

  private retryAutomaticCashDrawerOpen(): void {
    this.props.businessOperation(this.props.deviceIdentity, OPEN_CASH_DRAWER_EVENT, [
      new UiInput(UiInputKey.CASH_DRAWER_KEY, this.cashDrawerKey)
    ]);
  }

  private fireManuallyContinueEvent(skipConfirm?: boolean): void {
    this.isManuallyContinuing = true;
    const uiInputs: UiInput[] = [];

    uiInputs.push(new UiInput(UiInputKey.CASH_DRAWER_KEY, this.cashDrawerKey));
    if (skipConfirm) {
      uiInputs.push(new UiInput(UiInputKey.SKIP_CONFIRM_CLOSE, skipConfirm));
    }

    this.props.businessOperation(this.props.deviceIdentity, USER_CONTINUE_CASH_DRAWER_OPEN_EVENT, uiInputs);
  }

  private moveToTillDetailScreen(): void {
    const { cashDrawer, inputSource } = this.props.cashDrawerState;

    this.props.navigation.replace("tillDetail", {
      eventType: this.props.eventType,
      cashDrawerKey: cashDrawer.cashDrawerKey,
      inputSource
    });
  }

  private moveToDetailScreen(): void {
    if (this.shouldProceedToTillDetails) {
      this.moveToTillDetailScreen();
    } else if (this.props.eventType === PAID_IN_EVENT || this.props.eventType === PAID_OUT_EVENT) {
      this.moveToPaidDetailScreen();
    }
  }

  private moveToPaidDetailScreen(): void {
    const { cashDrawer, inputSource } = this.props.cashDrawerState;

    this.props.navigation.replace("paidDetail", {
      eventType: this.props.eventType,
      cashDrawerKey: cashDrawer.cashDrawerKey,
      inputSource
    });
  }

  private handleVoidSelected(): void {
    const voidFunc = this.eventTypeToVoidFunction.get(this.props.eventType);
    if (voidFunc) {
      voidFunc();
    }
  }

  private voidNoSale(): void {
    this.props.reset();

    this.props.businessOperation(this.props.deviceIdentity, VOID_NO_SALE_TRANSACTION_EVENT, []);
  }

  private voidTill(): void {
    this.props.reset();

    this.props.businessOperation(this.props.deviceIdentity, VOID_TILL_CONTROL_TRANSACTION_EVENT, []);
    this.props.navigation.pop();
  }

  private voidTenderControlTransaction(): void {
    this.props.reset();

    this.props.businessOperation(this.props.deviceIdentity, VOID_TENDER_CONTROL_TRANSACTION_EVENT, []);
    this.props.navigation.pop();
  }

  private reselectDrawer(): void {
    this.props.change("cashDrawerKey", "");
  }

  private voidTender(lineNumber: number, changeLineNumber: number): void {
    const uiInputs: UiInput[] = [];
    const lineNumbers: number[] = [];

    if (changeLineNumber) {
      lineNumbers.push(changeLineNumber);
    }

    lineNumbers.push(lineNumber);
    uiInputs.push(new UiInput(UiInputKey.LINE_NUMBERS, lineNumbers));

    this.props.businessOperation(this.props.deviceIdentity, VOID_CASH_DRAWER_TENDER_EVENT, uiInputs);
  }

  private preserveUiMode(prevProps: Props): void {
    const uiModeWasChanged: boolean = prevProps.uiState.mode === UI_MODE_TILL_OPERATION &&
                                      this.props.uiState.mode !== UI_MODE_TILL_OPERATION;

    if (uiModeWasChanged && this.props.currentScreenName === "scanDrawer") {
      this.props.updateUiMode(UI_MODE_TILL_OPERATION);
    }
  }

  private handleNoSaleEnded(prevProps: Props): void {
    if (this.props.eventType === NO_SALE_EVENT &&
        prevProps.businessState.stateValues.get("transaction.type") === NO_SALE_TRANSACTION_TYPE &&
        !prevProps.businessState.stateValues.get("transaction.closed") &&
        this.props.businessState.stateValues.get("transaction.closed")) {
      this.props.navigation.dispatch(popTo(this.props.startup ? "main" : "storeOperations"));
    }
  }

  private confirmCashDrawerClosed(): void {
    this.props.businessOperation(this.props.deviceIdentity, CONFIRM_CASH_DRAWER_CLOSED_EVENT, [
      new UiInput(UiInputKey.CASH_DRAWER_KEY, this.cashDrawerKey)
    ]);
  }

  private get cashDrawerKey(): string {
    return this.props.startup
        ? this.props.businessState.stateValues.get("CashDrawerSession.cashDrawerKey")
        : this.props.cashDrawerState.cashDrawer.cashDrawerKey;
  }

  private handleNoSaleReceiptBehavior(): void {
    if (this.noSaleReceiptRequired) {
      this.setState({ showReceiptForm: true });
    } else {
      this.props.businessOperation(this.props.deviceIdentity, PRINT_NO_SALE_RECEIPT_EVENT, [
        new UiInput(UiInputKey.RECEIPT_CATEGORY, ReceiptCategory.NoSale),
        new UiInput(UiInputKey.RECEIPT_TYPE, ReceiptType.None)
      ]);
    }
  }
}

const scanDrawerForm = reduxForm<ScanDrawerForm, Props>({
  form: "scanDrawer",
  validate: (values: ScanDrawerForm) => {
    const errors: { cashDrawerKey: string, inputSource: string } = { cashDrawerKey: undefined, inputSource: undefined };

    if (!values.cashDrawerKey) {
      errors.cashDrawerKey = I18n.t("required", {field: I18n.t("drawerID")});
    }

    return errors;
  },
  initialValues: { cashDrawerKey: undefined }
})(ScanDrawerScreen);

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    cashDrawerState: state.cashDrawerState,
    configurationManager: state.settings.configurationManager,
    currentScreenName: getCurrentRouteNameWithNavigationRef(),
    deviceIdentity: state.settings.deviceIdentity,
    displayInfo: state.businessState.displayInfo,
    incomingDataEvent: state.dataEvent,
    settings: state.settings,
    uiState: state.uiState,
    retailLocations: state.retailLocations
  };
}

const mapDispatchToProps: DispatchProps = {
  alert: alert.request,
  businessOperation: businessOperation.request,
  dataEvent: dataEvent.request,
  dataEventSuccess: dataEvent.success,
  updateUiMode: updateUiMode.request,
  dismissAlertModal: dismissAlertModal.request,
  validateCashDrawerRequest: validateCashDrawer.request,
  validateCashDrawerSuccess: validateCashDrawer.success
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof scanDrawerForm>()(scanDrawerForm));

function isVoidTenderAllowed(lastOpenDrawerTender: ITenderDisplayLine,
                             changeTender: ITenderDisplayLine,
                             isGiftCertIssue?: boolean): boolean {
  return lastOpenDrawerTender && lastOpenDrawerTender.tenderAuthCategory === TenderAuthCategory.None &&
      (!changeTender || changeTender.tenderAuthCategory === TenderAuthCategory.None) &&
      !isGiftCertIssue;
}
