import _ from "lodash";
import * as React from "react";
import { ActivityIndicator, Alert, AlertButton, Platform, Text, TouchableOpacity, View } from "react-native";
import { appDetailsSettings } from "react-native-android-open-settings";
import Permissions from "react-native-permissions";
import { connect } from "react-redux";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DI_TYPES,
  IConfigurationManager,
  IConfigurationValues,
  PosBusinessError,
  QualificationError,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_ITEM_EVENT,
  APPLY_SINGLE_USE_COUPON_EVENT,
  BALANCE_INQUIRY_EVENT,
  CANCEL_TENDER_SESSION_EVENT,
  Customer,
  DOMAIN_NOTIFICATION_EVENT,
  ENROLL_CUSTOMER_EVENT,
  ENTER_ATTENDANT_MODE_EVENT,
  IChangeFallbackOptions,
  ICustomerConfig,
  IN_MERCHANDISE_TRANSACTION_WAITING,
  IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE,
  IN_TENDER_CONTROL_TRANSACTION_WAITING,
  IN_TENDER_CONTROL_TRANSACTION_WAITING_TO_CLOSE,
  ISSUE_GIFT_CARD_EVENT,
  ISupervisorCredentials,
  ITenderDisplayLine,
  IValueCertificateResult,
  LOGGED_OFF,
  MULTI_LINE_EVENT,
  POST_VOID_FAILED_EVENT,
  POST_VOID_TRANSACTION_EVENT,
  RETRY_AUTHORIZATION_EVENT,
  SELL_ITEM_EVENT,
  SSF_AUTHORIZATION_DEVICE_ID_MISSING_I18N_CODE,
  SSF_DEFAULT_GIFTCARD_RELOAD_AUTH_ERROR_I18N_CODE,
  SSF_DEFAULT_GIFTCARD_SALE_AUTH_ERROR_I18N_CODE,
  SSF_DEFAULT_GIFT_CERTIFICATE_ISSUE_AUTH_ERROR_I18N_CODE,
  SSF_GIFTCARD_ISSUE_AUTH_ERROR_I18N_CODE,
  SSF_GIFTCARD_RELOAD_AUTH_ERROR_I18N_CODE,
  SSF_GIFT_CERTIFICATE_ISSUE_AUTH_ERROR_I18N_CODE,
  SSF_PAYMENT_DEVICE_AUTH_ERROR_I18N_CODE,
  SSF_PAYMENT_DEVICE_AUTH_TIMEOUT_I18N_CODE,
  SSF_PAYMENT_DEVICE_AUTH_VOID_FAILED_ALLOW_REFUND,
  SSF_PAYMENT_DEVICE_POST_VOID_AUTH_I18N_CODE,
  SUSPEND_TRANSACTION_EVENT,
  TenderAuthCategory,
  TenderAuthorizationState,
  TenderType,
  TENDER_AUTH_MANUAL_REVERSAL_EVENT,
  TENDER_AUTH_STATUS_EVENT,
  TENDER_CHANGE_EVENT,
  TENDER_CHANGE_FALLBACK_EVENT,
  TENDER_EXCHANGE_IN_EVENT,
  TimerUpdateType,
  UiInputKey,
  UPDATE_CUSTOMER_ENROLLMENT_EVENT,
  VOID_LINE_EVENT,
  VOID_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { IPaymentStatus, StatusCode } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertModalOptions,
  AlertRequest,
  businessOperation,
  displayErrorScanner,
  feedbackNoteAction,
  hideModal,
  HideModalAction,
  ModalAction,
  showCameraScanner,
  showModal,
  updateAppAccessLock,
  updatePendingPayment,
  updateTimers,
  updateUiMode,
  userNotification
} from "../../actions";
import {
  AppState,
  BusinessState,
  CameraScannerState,
  CustomerState,
  IUserNotificationState,
  ModalState,
  RemoteCallState,
  SelfCheckoutState,
  SettingsState,
  UiState,
  UI_MODE_GIFTCARD_ISSUE,
  UI_MODE_GIFT_CERTIFICATE_ISSUE,
  UI_MODE_SUSPEND_TRANSACTION,
  UI_MODE_TILL_OPERATION
} from "../../reducers";
import { IAppAccessLockState } from "../../reducers/appAccessLock";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import { PendingPaymentMode, PendingPaymentState } from "../../reducers/pendingPayment";
import store from "../../reduxStore";
import Theme from "../../styles";
import AlertModal, { AlertModalButton, ALERT_MODAL } from "../common/AlertModal";
import BaseView from "../common/BaseView";
import {
  ERROR_MESSAGE_MODAL,
  LOADING_MODAL,
  MANAGER_APPROVAL_MODAL,
  MODAL_RESOLUTION,
  RETRY_VOID_AS_REFUND_MODAL,
  SUSPEND_TRANSACTION_MODAL
} from "../common/constants";
import ErrorMessage from "../common/ErrorMessage";
import ManagerApproval from "../common/ManagerApproval";
import RetryVoidAsRefund from "../common/RetryVoidAsRefund";
import Spinner from "../common/Spinner";
import SuspendTransaction from "../common/SuspendTransaction";
import {
  currentSceneHandlesNotifications,
  getDenominationRoundings,
  getNextEnrollmentPromptDate,
  isCustomerEvent,
  isCustomerLoyaltyPromptNeeded,
  messageForcesNotification,
  promptToReturnCoupon,
  shouldHandlePostVoidErrorSeparately
} from "../common/utilities";
import {
  createModalComponent,
  shouldHandleErrorSeparately,
  shouldHandleUnattendedErrorSeparately
} from "../common/utilities";
import { getConfiguredMessage, localize } from "../common/utilities/localizationUtilities";
import { pop, popTo, push } from "../common/utilities/navigationUtils";
import { promptForReferenceIdOnSuspend, resumeTokenLength } from "../common/utilities/suspendUtilities";
import {
  dispatchWithNavigationRef,
  getCurrentRouteNameWithNavigationRef,
  navigate,
  refreshScreenWithNavigationRef
} from "../RootNavigation";
import { SCO_TOGGLE_MODE } from "../selfCheckout/SCOMainScreen";
import { StackNavigatorParams } from "../StackNavigatorParams";
import { activityIndicatorColor } from "../styles";
import { modalStyle } from "./styles";
import { isCashDrawerAction } from "../common/utilities/tillManagementUtilities";
import { UPLOAD_DEVICE_LOGS_EVENT } from '@aptos-scp/scp-component-store-selling-features';
import PaymentDeviceSelection from "../payment/PaymentDeviceSelection";
import { RenderSelectOptions } from "../common/FieldValidation";
import { getIsGiftCardDeviceFilter, getPaymentDevicesAsRenderSelect, makePaymentDeviceTypeFilter } from "../payment/PaymentDevicesUtils";

const LoadingModal = createModalComponent(LOADING_MODAL);

const ManagerApprovalModal = createModalComponent(MANAGER_APPROVAL_MODAL);

const RetryVoidAsRefundModal = createModalComponent(RETRY_VOID_AS_REFUND_MODAL);

const AlertModalWrapper = createModalComponent(ALERT_MODAL);

const ErrorMessageModal = createModalComponent(ERROR_MESSAGE_MODAL);

const SuspendTransactionModal = createModalComponent(SUSPEND_TRANSACTION_MODAL);

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.modalContainer.ModalContainer");

const NEW_CUSTOMER_ONLY = "NewCustomersOnly";

export interface StateProps {
  businessState: BusinessState;
  cameraScannerState: CameraScannerState;
  customerState: CustomerState;
  modalState: ModalState;
  remoteCall: RemoteCallState;
  uiState: UiState;
  userNotification: IUserNotificationState;
  settings: SettingsState;
  selfCheckoutModeState: SelfCheckoutState;
  paymentStatus: Map<string, IPaymentStatus>;
  pendingPaymentState: PendingPaymentState;
  appAccessLock: IAppAccessLockState;
  currentScreen: keyof StackNavigatorParams;
}

export interface DispatchProps {
  alert: AlertRequest;
  hideModal: HideModalAction;
  showModal: ModalAction;
  userNotificationSuccess: ActionCreator;
  businessOperationRequest: ActionCreator;
  displayErrorScanner: ActionCreator;
  showCameraScanner: ActionCreator;
  updateTimers: ActionCreator;
  updateUiMode: ActionCreator;
  feedbackNoteRequest: ActionCreator;
  updatePendingPayment: ActionCreator;
}

interface Props extends StateProps, DispatchProps {
}

export interface State {
  payment: boolean;
  errorTitle: string;
  errorSubText: string;
  error: string;
  userNotificationMessage: boolean;
  cashDrawerWaiting: boolean;
  manualReversalWaiting: boolean;
  shouldShowLoadingModal: boolean;
  showAppLockedMessage: boolean;
  showPaymentDeviceSelection: boolean;
}

class ModalContainer extends React.Component<Props, State> {
  private styles: any;
  private blocking: boolean;
  private authMessage: string;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(modalStyle());
    this.blocking = true;
    this.authMessage = I18n.t("authorizing");

    this.state = {
      payment: false,
      errorTitle: undefined,
      errorSubText: undefined,
      error: undefined,
      userNotificationMessage: false,
      cashDrawerWaiting: undefined,
      manualReversalWaiting: undefined,
      shouldShowLoadingModal: true,
      showAppLockedMessage: props.appAccessLock.showAppLockMessage,
      showPaymentDeviceSelection: false
    };
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (!this.props.modalState.blocked) {
      const loadingModalInstance = this.props.modalState[LOADING_MODAL];
      const loadingModalShowing: boolean = loadingModalInstance && loadingModalInstance.show;

      if (this.processingStarted() && !loadingModalShowing) {
        this.blocking = this.isModalBlocking();
        this.props.showModal(LOADING_MODAL);
        logger.debug(`Showing the Modal in ModalContainer while modal state is not blocked`, {
          metaData: new Map<string, any>([
            ["loadingModalShowing", loadingModalShowing],
            ["businessState.inProgress", this.props.businessState.inProgress],
            ["remoteCall.isProcessing", this.props.remoteCall.isProcessing],
            ["state.error", !!this.state.error],
            ["state.payment", this.state.payment],
            ["state.cashDrawerWaiting", this.state.cashDrawerWaiting]
        ])});
      } else if (this.processingStopped() && loadingModalShowing) {
        this.props.hideModal(LOADING_MODAL);
        this.blocking = true;

        logger.debug(`Hiding the Modal in ModalContainer while modal state is not blocked`, {
          metaData: new Map<string, any>([
            ["loadingModalShowing", loadingModalShowing],
            ["businessState.inProgress", this.props.businessState.inProgress],
            ["remoteCall.isProcessing", this.props.remoteCall.isProcessing],
            ["state.error", !!this.state.error],
            ["state.payment", this.state.payment],
            ["state.cashDrawerWaiting", this.state.cashDrawerWaiting]
        ])});

        if (this.thereIsApplicationModeToggleError(prevProps)) {
          this.props.showModal(SCO_TOGGLE_MODE);
        }
      }
    } else if (!prevProps.modalState.blocked) {
      this.props.hideModal(LOADING_MODAL);
      this.blocking = true;
      logger.debug(`Hiding the Modal in ModalContainer while modal state was not previously blocked`, {
        metaData: new Map<string, any>([
          ["modalState.blocked", prevProps.modalState.blocked],
          ["businessState.inProgress", this.props.businessState.inProgress],
          ["remoteCall.isProcessing", this.props.remoteCall.isProcessing],
          ["state.error", !!this.state.error],
          ["state.payment", this.state.payment],
          ["state.cashDrawerWaiting", this.state.cashDrawerWaiting]
      ])});
    }

    if (this.state.payment !== undefined && prevState.payment !== undefined &&
          this.state.payment !== prevState.payment) {
      this.props.updateTimers(this.state.payment ? TimerUpdateType.PaymentStarted : TimerUpdateType.PaymentStopped);
    }

    if (this.props.paymentStatus !== prevProps.paymentStatus) {
      const devices = Array.from(this.props.paymentStatus.values())
          .filter((status: IPaymentStatus) => status.statusCode === StatusCode.PermissionsRequired);
      if (devices && devices.length > 0) {
        const alertTitle = I18n.t("storageAccessRestricted");
        const alertMessage = I18n.t("storageAccessRestrictedExplained");
        const buttons: AlertButton[] = [];
        buttons.push(
            { text: I18n.t("cancel"), style: "cancel" },
            { text: I18n.t("openSettings"), onPress: this.openSettings.bind(this) }
        );
        Alert.alert(alertTitle, alertMessage, buttons);
      }
    }

    this.checkAppAccessLock(prevProps);
    this.checkCashDrawerWaiting(prevProps);

    if (this.manualReversalStopped(prevProps, this.props)) {
      this.onModalCancel();
      this.setState({ manualReversalWaiting: false });
    }
    this.checkCameraScannerHandling(prevProps);

    this.checkChangeFallbackHandling(prevProps);

    this.updateShowLoadingModal(prevProps);

    this.checkLoyaltyPromptHandling(prevProps);

    this.checkLogUploadMessageHandling(prevProps);
  }

  public componentWillReceiveProps(nextProps: Props): void {
    if (this.waitingForNonIntegratedInput(this.props, nextProps)) {
      this.checkAndHandleNonIntegratedPaymentAuth(
          nextProps.businessState.stateValues.get("TenderAuthorizationSession.requiredInputs"),
          nextProps.businessState.eventType);
    } else if (this.waitingForManualReversalStarted(this.props, nextProps) ||
        this.currentlyWaitingForManualReversal(this.props, nextProps) &&
        !this.state.manualReversalWaiting) {
      this.props.showModal(ERROR_MESSAGE_MODAL);
    } else if (this.getPayment(nextProps) && !this.notificationNeeded(nextProps)) {
      this.authMessage = I18n.t("authorizing");
      const payment: boolean = this.getPayment(nextProps);
      if (payment && nextProps.businessState.stateValues.get("TenderAuthorizationSession.state") ===
              TenderAuthorizationState.WaitingForReversal) {
        this.authMessage = I18n.t("unexpectedAuth");
      }
      if (!this.state.payment) {
        this.setState({ payment });
      }
    } else if (this.shouldHandleError(this.props, nextProps)) {
      this.handleError(nextProps.businessState.error, nextProps.businessState.eventType,
          nextProps.businessState.inputs);
    } else if (nextProps.userNotification.message && !this.notificationSet()) {
      this.handleUserNotification(nextProps.userNotification);
    }

    // Remove any existing dialog pop-up
    if ((nextProps.businessState.inProgress && !this.props.businessState.inProgress &&
        !this.state.userNotificationMessage) ||
        nextProps.uiState.logicalState === LOGGED_OFF && this.props.uiState.logicalState !== LOGGED_OFF) {
      this.setState({
        error: undefined, errorTitle: undefined, errorSubText: undefined, userNotificationMessage : false
      });
    }
  }

  public render(): JSX.Element {
    const isBlocking: boolean = !this.state.error && !this.state.payment && !this.props.remoteCall.isProcessing;
    if (this.blocking && !isBlocking) {
      this.blocking = false;
    }
    return (
      <>
        {
          this.state.shouldShowLoadingModal &&
          <LoadingModal>
            <BaseView style={this.blocking ? this.styles.modalTransparentContainer : this.styles.modalContainer}>
              {
                this.state.error &&
                <View style={this.styles.modalView}>
                  {
                    (this.state.errorTitle || this.state.errorSubText) &&
                    <View style={this.styles.textPanel}>
                      <Text style={this.styles.errorTitle}>{this.state.errorTitle}</Text>
                      <Text style={this.styles.errorSubText}>{this.state.errorSubText}</Text>
                      <View style={this.styles.textPanelErrorDetails}>
                        <Text style={this.styles.errorDescription}>{this.state.error}</Text>
                      </View>
                    </View>
                  }
                  {
                    !this.state.errorTitle && !this.state.errorSubText &&
                    <View style={this.styles.textPanel}>
                      <Text style={this.styles.errorText}>{this.state.error}</Text>
                    </View>
                  }
                  <View style={[this.styles.closeButtonContainer, {justifyContent: "center"}]}>
                    <TouchableOpacity onPress={this.onMessageDisplayClose.bind(this)} style={this.styles.closeButton} >
                      <Text style={this.styles.closeButtonText}>
                        {I18n.t("close")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
              {
                !this.state.error && this.state.payment &&
                !this.props.businessState.stateValues.get("UserSession.unattended") &&
                <View style={this.styles.modalView}>
                  <View style={this.styles.textPanel}>
                    <Text style={this.styles.errorText}>{this.authMessage}</Text>
                  </View>
                  <View style={this.styles.indicatorPanel}>
                    <ActivityIndicator size={"large"} color={activityIndicatorColor}/>
                  </View>
                </View>
              }
              {!this.state.error && !this.state.payment && !this.blocking &&
                <Spinner size={0}/>
              }
            </BaseView>
          </LoadingModal>
        }
        { this.state.showPaymentDeviceSelection &&
          <PaymentDeviceSelection
              onApplyPaymentDeviceSelected={this.onDeviceSelected.bind(this)}
              paymentDevicesOptions={this.getDeviceOptions()}
              resetPaymentDeviceSelection={this.resetPaymentDeviceSelection.bind(this)}
          />
          }
        <ManagerApprovalModal>
          <ManagerApproval
            onClose={() => this.onModalCancel(MODAL_RESOLUTION.CANCELLED)}
            onApprove={this.onManagerApproval.bind(this)}
            businessState={this.props.businessState}
          />
        </ManagerApprovalModal>
        <RetryVoidAsRefundModal>
          <RetryVoidAsRefund
            onCancel={this.onRefundModalCancel.bind(this)}
            onAccept={this.processRefundFailedVoid.bind(this)}
          />
        </RetryVoidAsRefundModal>
        <AlertModalWrapper>
          <AlertModal />
        </AlertModalWrapper>
        <ErrorMessageModal>
          <ErrorMessage
            onAccept={this.handleManualReversal.bind(this)}
            text={I18n.t(SSF_PAYMENT_DEVICE_AUTH_TIMEOUT_I18N_CODE)}
          />
        </ErrorMessageModal>
        <SuspendTransactionModal>
          <SuspendTransaction
            promptForReference={promptForReferenceIdOnSuspend(this.props.settings.configurationManager)}
            resumeTokenLength={resumeTokenLength(this.props.settings.configurationManager)}
            onSuspend={this.handleSuspendTransaction}
            onCancel={this.handleCancelSuspendTransaction}
          />
        </SuspendTransactionModal>
      </>
    );
  }

  private handleManualReversal(): void {
    this.props.businessOperationRequest(this.props.settings.deviceIdentity, TENDER_AUTH_MANUAL_REVERSAL_EVENT, []);
    this.onModalCancel();
    this.blocking = this.isModalBlocking();
    this.props.showModal(LOADING_MODAL);
    this.setState({ manualReversalWaiting: true });
  }

  private shouldHandleError(props: Props, nextProps: Props): boolean {
    return (!nextProps.businessState.inProgress && this.props.businessState.inProgress) ||
        (nextProps.uiState.logicalState !== IN_MERCHANDISE_TRANSACTION_WAITING &&
        this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING);
  }

  private waitingForManualReversalStarted(props: Props, nextProps: Props): boolean {
    const nextStateManualReversal = nextProps.businessState.stateValues &&
        nextProps.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.WaitingForTenderAuthManualReversal;
    const currentStateManualReversal = props.businessState.stateValues &&
        props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.WaitingForTenderAuthManualReversal;
    return (nextStateManualReversal && !currentStateManualReversal);
  }

  private currentlyWaitingForManualReversal(props: Props, nextProps: Props): boolean {
    const nextStateManualReversal = nextProps.businessState.stateValues &&
        nextProps.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.WaitingForTenderAuthManualReversal;
    const currentStateManualReversal = props.businessState.stateValues &&
        props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.WaitingForTenderAuthManualReversal;
    return (nextStateManualReversal && currentStateManualReversal);
  }

  private manualReversalStopped(props: Props, nextProps: Props): boolean {
    const nextStateManualReversal = nextProps.businessState.stateValues &&
        nextProps.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.CancelInProgress;
    const currentStateManualReversal = props.businessState.stateValues &&
        props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.CancelInProgress;
    return (!nextStateManualReversal && currentStateManualReversal);
  }

  private waitingForNonIntegratedInput(props: Props, nextProps: Props): boolean {
    const nextStateNonIntegrated = nextProps.businessState.stateValues &&
        nextProps.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.WaitingForNonIntegratedInput;
    const currentStateNonIntegrated = props.businessState.stateValues &&
        props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.WaitingForNonIntegratedInput;
    //if inProgress has ended but still in waitingForNonIntegratedInput, show screen for multiple voids
    return (nextStateNonIntegrated && currentStateNonIntegrated === false) ||
        (nextStateNonIntegrated && currentStateNonIntegrated &&
        props.businessState.inProgress && !nextProps.businessState.inProgress) ;
  }

  private getPayment(props: Props): boolean {
    return (props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING ||
        props.uiState.logicalState === IN_TENDER_CONTROL_TRANSACTION_WAITING ||
        props.uiState.logicalState === IN_TENDER_CONTROL_TRANSACTION_WAITING_TO_CLOSE ||
        props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE) &&
        props.businessState.stateValues.get("TenderAuthorizationSession.isAuthorizationDeviceActive");
  }

  private openSettings(): void {
    if (Platform.OS === "ios") {
      Permissions.openSettings().catch(() => {
        // nothing to do
      });
    } else if (Platform.OS === "android") {
      appDetailsSettings();
    }
  }

  private processingStarted(): boolean {
    return this.props.businessState.inProgress || this.props.remoteCall.isProcessing || !!this.state.error ||
        this.state.payment || this.state.cashDrawerWaiting;
  }

  private processingStopped(): boolean {
    return !this.props.businessState.inProgress && !this.props.remoteCall.isProcessing && !this.state.error &&
        !this.state.payment && !this.state.cashDrawerWaiting;
  }

  private notificationNeeded(props: Props): boolean {
    return !!(props.businessState.error || props.userNotification.message);
  }

  private notificationSet(): boolean {
    return !!(this.state.userNotificationMessage || this.props.cameraScannerState.errorMessage);
  }

  private handleUserNotification(userNotificationState: IUserNotificationState): void {
    const notificationCode: string  = userNotificationState.message && userNotificationState.message.i18nCode;

    if (currentSceneHandlesNotifications(this.props.currentScreen, notificationCode) &&
        !messageForcesNotification(notificationCode, this.props.currentScreen)) {
      // The current scene will be able to show the notification - add it to the error heading state.
      this.props.feedbackNoteRequest(localize(userNotificationState.message), userNotificationState.message.i18nCode,
          undefined, FeedbackNoteType.Notification);
      this.props.userNotificationSuccess();
    } else {
      // TODO: Find a better way to distinguish the user notification reason (ZSPFLD-1829)
      // This are special notifications that have the proper pages to handle them so no error must be shown
      if (notificationCode === SSF_PAYMENT_DEVICE_AUTH_VOID_FAILED_ALLOW_REFUND) {
        if (!this.state.payment) {
          this.onAllowRefundVoidFailure();
        }
      } else if (notificationCode === SSF_PAYMENT_DEVICE_POST_VOID_AUTH_I18N_CODE) {
        // error is configurable -
        this.setState({error: getConfiguredMessage(userNotificationState.message, POST_VOID_TRANSACTION_EVENT,
            this.props.settings && this.props.settings.configurationManager), userNotificationMessage : true});
      } else if (notificationCode === SSF_PAYMENT_DEVICE_AUTH_ERROR_I18N_CODE) {
        this.setState({
          error: localize(userNotificationState.message),
          errorTitle: I18n.t("paymentDeviceAuthErrorTitle"),
          errorSubText: I18n.t("paymentDeviceAuthErrorSubtext"),
          userNotificationMessage : true
        });
      } else if (notificationCode === SSF_GIFTCARD_ISSUE_AUTH_ERROR_I18N_CODE ||
          notificationCode === SSF_GIFTCARD_RELOAD_AUTH_ERROR_I18N_CODE ||
          notificationCode === SSF_DEFAULT_GIFTCARD_SALE_AUTH_ERROR_I18N_CODE ||
          notificationCode === SSF_DEFAULT_GIFTCARD_RELOAD_AUTH_ERROR_I18N_CODE ||
          notificationCode === SSF_GIFT_CERTIFICATE_ISSUE_AUTH_ERROR_I18N_CODE ||
          notificationCode === SSF_DEFAULT_GIFT_CERTIFICATE_ISSUE_AUTH_ERROR_I18N_CODE) {
        this.setState({
          userNotificationMessage : true,
          errorSubText: localize(userNotificationState.message),
          error: localize({
            i18nCode: SSF_PAYMENT_DEVICE_AUTH_ERROR_I18N_CODE,
            parameters: userNotificationState.message?.parameters
          })
        })
      } else if (!this.handleErrorForCamera(localize(userNotificationState.message))) {
        this.setState({ error: localize(userNotificationState.message), userNotificationMessage : true });
      }
    }

  }

  private handleError(error: Error, eventType: string, inputs: UiInput[]): void {
    if (error && error instanceof PosBusinessError) {
      //TODO:  Are we missing something here?  What if businessState.error is present but is just an Error instance?
      //       sagas/businessState.ts, listening for BUSINESS_OPERATION.REQUEST submits and awaits PEPS submissions.
      //       If that submission results in an error the saga method can build either a PosBusinessError OR
      //       just an Error instance.

      const errorMessage = localize(error.localizableMessage);
      // TODO:Find a better way to distinguish the reject reason (https://jira.aptos.com/browse/ZSPFLD-1829)
      // This are special errors that have the proper pages to handle them so no error must be shown
      if ((!shouldHandleErrorSeparately(error) &&
          !shouldHandleUnattendedErrorSeparately(this.props.businessState , error)) ||
          (eventType === POST_VOID_TRANSACTION_EVENT && !shouldHandlePostVoidErrorSeparately(error))) {
        if (!this.handleErrorForCamera(errorMessage)) {
          if (currentSceneHandlesNotifications(this.props.currentScreen, error.localizableMessage?.i18nCode) &&
              !messageForcesNotification(error.localizableMessage?.i18nCode, this.props.currentScreen)) {
            // The current scene will be able to show the notification - add it to the error heading state.
            this.props.feedbackNoteRequest(errorMessage, error.localizableMessage?.i18nCode,
                undefined, FeedbackNoteType.Notification);
            this.props.userNotificationSuccess();
          } else {
            this.setState({ payment: false, error: errorMessage});
          }
        }
      } else if (error.localizableMessage?.i18nCode === SSF_AUTHORIZATION_DEVICE_ID_MISSING_I18N_CODE) {
        this.onCaptureAuthorizationDeviceId();
      }
      this.handleSupervisorOverride(error as QualificationError);
      this.handleForfeitChangeConfirmation(error as QualificationError);
    } else {
      this.setState({ payment: false });
    }
  }

  private handleErrorForCamera(errorMessage: string): boolean {
    if (this.props.currentScreen === "scan") {
      this.props.displayErrorScanner(errorMessage);
      return true;
    }
  }

  private onMessageDisplayClose(): void {
    if (this.state.userNotificationMessage) {
      // This keeps it closed by clearing the message from the app state, which feeds into the props above.
      this.props.userNotificationSuccess();
    }
    // This does the immediate close of the dialog.
    this.setState({error: undefined, userNotificationMessage: false, errorSubText: undefined, errorTitle: undefined});
  }

  private returnCouponMessage(): void {
    if (this.props.businessState.eventType === APPLY_SINGLE_USE_COUPON_EVENT) {
      promptToReturnCoupon();
    }
  }

  private checkAndHandleNonIntegratedPaymentAuth = (requiredInputs: any[],
                                                    eventType: string): void => {
    if (Theme.isTablet && (eventType !== POST_VOID_TRANSACTION_EVENT &&
        eventType !== VOID_TRANSACTION_EVENT && eventType !== TENDER_AUTH_STATUS_EVENT)) {
      refreshScreenWithNavigationRef("payment", {
        nonIntegratedPayment: true,
        isTendering: true,
        originalEventType: eventType,
        requiredInputs
      });
    } else {
      dispatchWithNavigationRef(push("nonIntegratedAuthorization", {
        onCancel: () => {
          this.props.businessOperationRequest(this.props.settings.deviceIdentity, CANCEL_TENDER_SESSION_EVENT, []);
          dispatchWithNavigationRef(pop());
        },
        isTendering: true,
        originalEventType: eventType,
        requiredInputs,
        uiId: Math.floor(Math.random() * 100000000)
      }));
    }
  }

  private onAllowRefundVoidFailure(): void {
    this.props.hideModal(LOADING_MODAL);
    this.props.showModal(RETRY_VOID_AS_REFUND_MODAL);
    this.setState({userNotificationMessage: true});
  }

  private onCaptureAuthorizationDeviceId(): void {
    this.setState({showPaymentDeviceSelection: true});
  }

  private getDeviceOptions(): RenderSelectOptions[] {
    let tenderAuthCategory = TenderAuthCategory.PaymentDevice;
    const inputs = this.props.businessState.inputs;
    const tenderAuthCategoryInput = inputs?.find((input) => input.inputKey === UiInputKey.TENDER_AUTH_CATEGORY_NAME);
    if (tenderAuthCategoryInput) {
      tenderAuthCategory = tenderAuthCategoryInput.inputValue
    } else {
      const event = this.props.businessState.eventType;

      if (event === BALANCE_INQUIRY_EVENT ||
            event === ISSUE_GIFT_CARD_EVENT ||
            event === TENDER_EXCHANGE_IN_EVENT ||
            event === APPLY_ITEM_EVENT) {
        tenderAuthCategory = TenderAuthCategory.GiftDevice;
      }
    }
    if (tenderAuthCategory === TenderAuthCategory.GiftDevice) {
      return getPaymentDevicesAsRenderSelect(this.props.paymentStatus,
          getIsGiftCardDeviceFilter(this.props.settings.configurationManager, this.props.settings.deviceIdentity.deviceId));
    } else {
      const peripheralsConfig: IConfigurationValues = this.props.settings.diContainer
          .get<IConfigurationManager>(DI_TYPES.IConfigurationManager)
          .getPeripheralsValues();

      const primaryDeviceId =
          peripheralsConfig.paymentType.primaryDevicesByTerminalId &&
          peripheralsConfig.paymentType.primaryDevicesByTerminalId[this.props.settings.deviceIdentity.deviceId]
          || peripheralsConfig.paymentType.primaryDeviceId;
      if (tenderAuthCategory === TenderAuthCategory.PaymentDevice) {
        return getPaymentDevicesAsRenderSelect(this.props.paymentStatus,
            makePaymentDeviceTypeFilter(primaryDeviceId));
      } else if (tenderAuthCategory === TenderAuthCategory.Wallet) {
        const walletDeviceId: string | string[] = peripheralsConfig.paymentType.walletDeviceId ||
            primaryDeviceId;
        return getPaymentDevicesAsRenderSelect(this.props.paymentStatus,
            makePaymentDeviceTypeFilter(walletDeviceId));
      }
    }
  }

  private onDeviceSelected(deviceId: string): void {
    // Re-execute the last business event with the selection authorization device id
    this.setState({showPaymentDeviceSelection: false});
    const inputs = this.props.businessState.inputs.filter((input) =>
        input.inputKey !== UiInputKey.TENDER_AUTH_STATUS);
    inputs.push(new UiInput(UiInputKey.AUTHORIZATION_DEVICE_ID, deviceId));

    this.props.businessOperationRequest(
      this.props.settings.deviceIdentity,
      this.props.businessState.eventType,
      inputs
    );
  }

  private resetPaymentDeviceSelection(): void {
    this.setState({
      showPaymentDeviceSelection: false
    });
  }

  private processRefundFailedVoid(): void {
    this.props.hideModal(RETRY_VOID_AS_REFUND_MODAL);
    this.onMessageDisplayClose();

    this.props.businessOperationRequest(this.props.settings.deviceIdentity, RETRY_AUTHORIZATION_EVENT,
        [new UiInput(UiInputKey.RETRY_VOID_AS_REFUND, true)]);
  }

  private onRefundModalCancel(): void {

    const isPostVoiding: boolean = this.props.businessState.stateValues &&
        this.props.businessState.stateValues.get("ResumeSession.isPostVoiding");
    if (isPostVoiding) {
      this.props.businessOperationRequest(this.props.settings.deviceIdentity, POST_VOID_FAILED_EVENT, []);
    }

    this.onModalCancel(MODAL_RESOLUTION.CANCELLED);
  }

  private onModalCancel(resolution?: MODAL_RESOLUTION): void {
    this.props.hideModal(MANAGER_APPROVAL_MODAL, resolution);
    this.props.hideModal(RETRY_VOID_AS_REFUND_MODAL, resolution);
    this.props.hideModal(ERROR_MESSAGE_MODAL, resolution);
    this.onMessageDisplayClose();
    this.returnCouponMessage();

    if (this.props.businessState.eventType === TENDER_CHANGE_FALLBACK_EVENT) {
      this.checkChangeFallbackHandling(this.props, true);
    }
  }

  private onManagerApproval(username: string, password: string): void {
    this.props.hideModal(MANAGER_APPROVAL_MODAL);
    this.onMessageDisplayClose();

    const uiInputs: UiInput[] = this.props.businessState.inputs;
    const supervisorCredentials: ISupervisorCredentials = {userName: username, password};
    if (this.props.businessState.eventType !== MULTI_LINE_EVENT) {
      this.checkOrUpdateUiInputs(uiInputs, UiInputKey.SUPERVISOR_OVERRIDE, supervisorCredentials);
    } else {
      const index: number = uiInputs.findIndex((item) => item.inputKey === UiInputKey.UI_INPUTS);
      let multiLineUIInput: UiInput[];
      if (index >= 0) {
        multiLineUIInput = uiInputs[index].inputValue as UiInput[];
      } else {
        multiLineUIInput = [];
        uiInputs.push(new UiInput(UiInputKey.UI_INPUTS, multiLineUIInput));
      }
      this.checkOrUpdateUiInputs(multiLineUIInput, UiInputKey.SUPERVISOR_OVERRIDE, supervisorCredentials);
    }
    this.props.businessOperationRequest(this.props.settings.deviceIdentity,
        this.props.businessState.eventType, uiInputs);
  }

  private checkOrUpdateUiInputs(uiInputs: UiInput[], key: string, valueToChange: any): void {
    const index: number = uiInputs.findIndex((item) => item.inputKey === key);
    if (index >= 0) {
      uiInputs[index] = new UiInput(key, valueToChange);
    } else {
      uiInputs.push(new UiInput(key, valueToChange));
    }
  }

  private handleSupervisorOverride(error: QualificationError): void {
    if (error && error.requiredInputs && error.requiredInputs.find((item) => item === UiInputKey.SUPERVISOR_OVERRIDE)) {
      this.props.hideModal(LOADING_MODAL);
      this.props.showModal(MANAGER_APPROVAL_MODAL);
    }
  }

  private handleForfeitChangeConfirmation(error: QualificationError): void {
    if (error && error.requiredInputs &&
          error.requiredInputs.find((item) => item === UiInputKey.FORFEIT_TENDER_CHANGE_CONFIRMATION)) {

      const modalButtons: AlertModalButton[] = [];
      const okButton = { text: I18n.t("ok"), onPress: () => {
        const inputs = this.props.businessState.inputs || [];
        inputs.push(new UiInput(UiInputKey.FORFEIT_TENDER_CHANGE_CONFIRMATION, true));
        this.props.businessOperationRequest(
          this.props.settings.deviceIdentity,
          this.props.businessState.eventType,
          inputs
        )}};
      modalButtons.push(okButton);

      if (this.props.uiState.isAllowed(SELL_ITEM_EVENT)) {
        const sellItemsButton = { text: I18n.t("sellItems"), onPress: () =>
        {
          dispatchWithNavigationRef(popTo("main"))
          setTimeout(() => {this.props.updateUiMode(undefined);});
        }};
        modalButtons.push(sellItemsButton);
      }

      const cancelButton = { text: I18n.t("cancel"), onPress: () => this.processCancelForfeitChange()};
      modalButtons.push(cancelButton);

      this.showAlert(undefined, undefined, localize(error.localizableMessage), modalButtons);
    }
  }

  private processCancelForfeitChange(): void {
    const inquiryResults = this.props.businessState.stateValues.get("StoredValueCertificateSession.inquiryResults");
    if (inquiryResults && inquiryResults.valueCertificates) {
      const currentCertificateNumber = this.props.businessState.inputs.find((input) =>
          input.inputKey === UiInputKey.VALUE_CERTIFICATE_NUMBER)?.inputValue;
      const resultsRemaining = !!inquiryResults.valueCertificates.find((result: IValueCertificateResult) =>
          result.accountNumber !== currentCertificateNumber && !result.tenderLineNumber)
      if (!resultsRemaining) {
        // if there are no other results return to payment
        dispatchWithNavigationRef(popTo("payment"));
      }
    }
  }

  private thereIsApplicationModeToggleError(prevProps: Props): boolean {
    const businessErrorOccurred: boolean = prevProps.businessState && !prevProps.businessState.error &&
        this.props.businessState && !!this.props.businessState.error;

    const userNotificationErrorOccurred: boolean = this.props.userNotification && !!this.props.userNotification.error;

    return this.props.businessState.eventType === ENTER_ATTENDANT_MODE_EVENT &&
        (businessErrorOccurred || userNotificationErrorOccurred);
  }

  private isModalBlocking(): boolean {
    return !this.state.error && !this.state.payment && !this.props.remoteCall.isProcessing &&
           !this.state.cashDrawerWaiting;
  }


  private uiModeAllowChangeFallback(): boolean {
    return this.props.uiState.mode !== UI_MODE_GIFT_CERTIFICATE_ISSUE &&
        this.props.uiState.mode !== UI_MODE_TILL_OPERATION &&
        this.props.uiState.mode !== UI_MODE_GIFTCARD_ISSUE;
  }

  private checkChangeFallbackHandling(prevProps: Props, force?: boolean): void {
    if (force || (!this.props.businessState.inProgress && prevProps.businessState.inProgress &&
        !this.props.businessState.error &&
        this.uiModeAllowChangeFallback() &&
        this.props.businessState.eventType !== "TenderChangeFallback" &&
        this.props.businessState.eventType !== DOMAIN_NOTIFICATION_EVENT &&
        this.props.pendingPaymentState?.mode !== PendingPaymentMode.WaitingOnCustomer &&
        this.props.pendingPaymentState?.mode !== PendingPaymentMode.WaitingOnLoyalty &&
        !isCashDrawerAction(this.props.businessState.eventType))) {
      if (this.props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
          TenderAuthorizationState.Completed &&
          this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.isChangeFallbackInProgress")) {
        this.createTenderChangeFallbackDialog();
      }
    }
  }

  private createTenderChangeFallbackDialog(): void {
    const changeFallBackOptions: IChangeFallbackOptions = this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.ChangeFallbackOptions");
    const modalButtons: AlertModalButton[] = [];
    let alertTitle: string;
    if (changeFallBackOptions && changeFallBackOptions.isVoidFailure) {
      alertTitle = I18n.t("voidPaymentFailed");

      const voidButton = { text: I18n.t("retry"), onPress: () => this.voidLastTender() };
      modalButtons.push(voidButton);
    } else {
      alertTitle = changeFallBackOptions.failedChangeTenderType ?
        I18n.t("unableToIssueChange", { tenderName: changeFallBackOptions.failedChangeTenderType?.tenderName.toLowerCase() }) :
        I18n.t("unableToIssueChangeDefault");

      const retryButton = { text: I18n.t("retry"), onPress: () => this.processTenderChange() };
      modalButtons.push(retryButton);
    }
    if (changeFallBackOptions) {
      if (changeFallBackOptions?.fallbackTenders?.length > 1) {
        const selectTenderButton = {
          text: I18n.t("selectTender"),
          onPress: () => this.props.businessOperationRequest(this.props.settings.deviceIdentity, TENDER_CHANGE_EVENT, [])
        };
        modalButtons.push(selectTenderButton);
      } else if (changeFallBackOptions?.fallbackTenders?.length === 1) {
        changeFallBackOptions.fallbackTenders.forEach((fallbackTender: TenderType) => {
          //find the tender line used in the failure to send to event for the purpose of validation.
          const lastTenderLine = this.props.businessState.displayInfo.tenderDisplayLines &&
            _.last(this.props.businessState.displayInfo.tenderDisplayLines);
          const tenderButton = {
            text: I18n.t("giveFallbackPrefix") + fallbackTender.tenderName.toLowerCase(),
            onPress: () => this.processTenderChange(fallbackTender.id, lastTenderLine)
          };
          modalButtons.push(tenderButton);
        });
      }
      if (changeFallBackOptions.allowVoid && !changeFallBackOptions.isVoidFailure) {
        const voidButton = { text: I18n.t("voidPayment"), onPress: () => this.voidLastTender() };
        modalButtons.push(voidButton);
      }
    }
    this.showAlert(alertTitle, undefined, undefined,
      modalButtons, { cancelable: true, renderButtonsInRows: true });
  }

  private processTenderChange(tenderId?: string, originalTenderLine?: ITenderDisplayLine): void {
    const uiInputs: UiInput[] = [];
    if (tenderId) {
      const changeDue = this.props.businessState.stateValues.get("transaction.changeDue")
      const roundedBalanceDue = getDenominationRoundings(this.props.settings.configurationManager,
          changeDue?.times(-1));
      const tenderDenominationRounding = roundedBalanceDue && tenderId &&
          roundedBalanceDue.find((tender) => tender.tenderId === tenderId);

      if (tenderDenominationRounding?.roundedValue) {
        const roundedAmount = tenderDenominationRounding.roundedValue.abs().ne(changeDue) &&
            tenderDenominationRounding.roundedValue.abs();
        uiInputs.push(new UiInput(UiInputKey.TENDER_AMOUNT, roundedAmount));
      }

      uiInputs.push(new UiInput(UiInputKey.TENDER_ID, tenderId));
    } else {
      uiInputs.push(new UiInput(UiInputKey.RETRY_CHANGE, true));
    }

    if (originalTenderLine) {
      uiInputs.push(new UiInput(UiInputKey.ORIGINAL_TRANSACTION_LINE_REFERENCES, originalTenderLine));
    }

    uiInputs.push(new UiInput(UiInputKey.TENDER_AMOUNT,
        this.props.businessState.stateValues.get("transaction.changeDue")));
    this.props.businessOperationRequest(this.props.settings.deviceIdentity, TENDER_CHANGE_FALLBACK_EVENT, uiInputs);
  }

  private voidLastTender(): void {
    const lastTenderLine = this.props.businessState.displayInfo.tenderDisplayLines &&
        _.last(this.props.businessState.displayInfo.tenderDisplayLines);
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("lineNumber", lastTenderLine && lastTenderLine.lineNumber));
    this.props.businessOperationRequest(this.props.settings.deviceIdentity, VOID_LINE_EVENT, uiInputs);
  }

  private checkCameraScannerHandling(prevProps: Props): void {
    if (prevProps.cameraScannerState) {
      if ((!this.props.cameraScannerState.inProgress ||
            (this.props.uiState.mode && !prevProps.uiState.mode))
            && this.props.currentScreen === "scan") {
          dispatchWithNavigationRef(pop());
      }
      if ((this.phoneScanInterruptionComplete(prevProps) && !Theme.isTablet) ||
            (this.tabletScanInterruptionComplete(prevProps) && Theme.isTablet)) {
        if (this.props.cameraScannerState.inProgress) {
          this.props.showCameraScanner(
            this.props.cameraScannerState.consecutiveScanningEnabled,
            this.props.cameraScannerState.delay,
            this.props.cameraScannerState.header,
            this.props.cameraScannerState.goodIcon,
            this.props.cameraScannerState.badIcon,
            this.props.cameraScannerState.handleHideCamera,
            this.props.cameraScannerState.translator
          );
        }
      }
    }
  }

  private checkLogUploadMessageHandling(prevProps: Props): void {
    if (this.props.paymentStatus !== prevProps.paymentStatus) {
      const prevLogUploadInProgressDeviceIds = Array.from(prevProps.paymentStatus.values())
          .filter((status: IPaymentStatus) => status.statusCode === StatusCode.LogUploadInProgress).map((status: IPaymentStatus) => status.deviceId);
      const currLogsSucceededDevices = Array.from(this.props.paymentStatus.values()).filter(((status: IPaymentStatus) =>
          status.statusCode === StatusCode.LogUploadSuccess && prevLogUploadInProgressDeviceIds.indexOf(status.deviceId) > -1));
      const currLogsFailedDevices = Array.from(this.props.paymentStatus.values()).filter(((status: IPaymentStatus) =>
          status.statusCode === StatusCode.LogUploadFailed && prevLogUploadInProgressDeviceIds.indexOf(status.deviceId) > -1));

      if (!_.isEmpty(currLogsFailedDevices) || !_.isEmpty(currLogsSucceededDevices)) {
        const alertTitle = !_.isEmpty(currLogsFailedDevices) ? I18n.t("logUploadFailed") : I18n.t("logUploadCompleted");
        const alertMessage = !_.isEmpty(currLogsFailedDevices) ? I18n.t("logUploadFailedDescription") : I18n.t("logUploadCompletedDesription");
        const buttons: AlertModalButton[] = [];
        buttons.push(
          { text: I18n.t("ok"), style: "cancel" }
        );
        this.showAlert(alertTitle, undefined, alertMessage, buttons);
      }
    }
  }

  private checkLoyaltyPromptHandling(prevProps: Props): void {
    const cameraState = this.props.cameraScannerState;
    const isConsecutiveScanning = cameraState.consecutiveScanningEnabled && cameraState.inProgress;
    //do not show loyalty prompt if performing consecutive scanning
    if (!isConsecutiveScanning && prevProps.businessState.inProgress &&
        !this.props.businessState.inProgress || this.customerCreationUpdated(prevProps)) {
      if (isCustomerEvent(this.props.businessState.eventType)) {
        if (isCustomerLoyaltyPromptNeeded(this.props.settings.configurationManager,
              this.props.businessState.eventType, this.props.businessState.stateValues,
              prevProps.businessState.stateValues, this.props.customerState.customer)) {

          if (this.props.pendingPaymentState &&
              this.props.pendingPaymentState.mode === PendingPaymentMode.WaitingOnCustomer) {
            this.props.updatePendingPayment(PendingPaymentMode.WaitingOnLoyalty);
          }
          const customerConfig = this.props.settings.configurationManager.getCustomerValues() as ICustomerConfig;
          const deferralEnabled =
              _.get(customerConfig, "loyalty.enrollment.enrollmentPrompt.deferralButton.enabled", false);
          const newCustomersOnly = _.get(customerConfig, "loyalty.enrollment.enrollmentPrompt.appliesTo",
              NEW_CUSTOMER_ONLY) === NEW_CUSTOMER_ONLY;

          const enrollButton = { text: I18n.t("enroll"), onPress: () => this.promptLoyaltyEnrollment()};
          const neverButton = { text: I18n.t("never"), onPress: () => this.loyaltyEnrollmentPromptUpdate(false)};

          let modalButtons: AlertModalButton[];
          if (newCustomersOnly) {
            const noButton = { text: I18n.t("no")};
            modalButtons = [enrollButton, noButton];
          } else if (deferralEnabled) {
            const notNowButton = { text: I18n.t("notnow"), onPress: () => this.loyaltyEnrollmentPromptUpdate(true)};
            modalButtons = [enrollButton, notNowButton, neverButton];
          } else {
            modalButtons = [enrollButton, neverButton];
          }
          this.showAlert(I18n.t("loyalty"), undefined, I18n.t("loyaltyEnrollPrompt"),
              modalButtons, { cancelable: true });
        } else if (this.props.pendingPaymentState &&
            this.props.pendingPaymentState.mode === PendingPaymentMode.WaitingOnCustomer) {
          this.props.updatePendingPayment(PendingPaymentMode.WaitingOnPayment);
        }
      } else if ((this.props.businessState.eventType === UPDATE_CUSTOMER_ENROLLMENT_EVENT) &&
            this.props.pendingPaymentState.mode === PendingPaymentMode.WaitingOnLoyalty) {
        this.props.updatePendingPayment(PendingPaymentMode.WaitingOnPayment);
      }
    }
  }

  private customerCreationUpdated(prevProps: Props): boolean {
    return !!(!prevProps.customerState.creationResult && this.props.customerState.creationResult);
  }

  private promptLoyaltyEnrollment(): void {
    const customer =
        this.props.businessState.stateValues.get("transaction.customer") || this.props.customerState.customer;
    navigate("loyaltyEnrollment", {
      customer,
      onSave: this.loyaltyEnrollment.bind(this),
      emailAddress: customer?.emailAddress
    });
  }

  private loyaltyEnrollmentPromptUpdate(allowPromptForEnrollment: boolean): void {
    const uiInputs: UiInput[] = [];
    const customer: Customer =
        this.props.businessState.stateValues.get("transaction.customer") || this.props.customerState.customer;
    const modifiedCustomer = Object.assign({}, customer);

    modifiedCustomer.allowPromptForLoyaltyEnrollment = allowPromptForEnrollment;

    if (allowPromptForEnrollment) {
      //if allowing enrollment, then set next enrollment date based on deferral days
      modifiedCustomer.earliestNextLoyaltyEnrollmentPromptDate =
          getNextEnrollmentPromptDate(this.props.settings.configurationManager);
    }

    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_OLD, customer));
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER, modifiedCustomer));
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, customer.customerNumber));
    this.props.businessOperationRequest(this.props.settings.deviceIdentity, UPDATE_CUSTOMER_ENROLLMENT_EVENT, uiInputs);
  }

  private loyaltyEnrollment(loyaltyPlanKey: string, membershipTypeKey: string, emailAddress?: string): void {
    const customer =
        this.props.businessState.stateValues.get("transaction.customer") || this.props.customerState.customer;
    const uiInputs: UiInput[] = [];
    let additionalProps;

    //if allowPromptForLoyaltyEnrollment is undefined on customer then don't set it.
    const allowPromptForLoyaltyEnrollment = customer.allowPromptForLoyaltyEnrollment !== undefined ? false : undefined;

    if (emailAddress) {
      additionalProps = {emailAddress, allowPromptForLoyaltyEnrollment};
    } else {
      additionalProps = {allowPromptForLoyaltyEnrollment};
    }

    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_OLD, customer));
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER, Object.assign({}, customer, additionalProps)));

    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, customer.customerNumber));
    uiInputs.push(new UiInput(UiInputKey.LOYALTY_PLAN_KEY, loyaltyPlanKey));
    uiInputs.push(new UiInput(UiInputKey.MEMBERSHIP_TYPE_KEY, membershipTypeKey));

    this.props.businessOperationRequest(this.props.settings.deviceIdentity, ENROLL_CUSTOMER_EVENT, uiInputs);
  }

  private showAlert = (title: string, timeout?: number, message?: string, buttons?: AlertModalButton[],
                       options?: AlertModalOptions): void => {
    if (this.props.currentScreen === "scan") {
      this.props.displayErrorScanner(message || title);
    } else {
      if (timeout) {
        setTimeout(() => {this.props.alert(title, message, buttons, options);}, timeout);
      } else {
        this.props.alert(title, message, buttons, options);
      }
    }
  }

  private phoneScanInterruptionComplete(prevProps: Props): boolean {
    // Phone interruptions are complete if the user is returned to main screen
    return this.props.currentScreen !== prevProps.currentScreen && this.props.currentScreen === "main";
  }

  private tabletScanInterruptionComplete(prevProps: Props): boolean {
    // Tablet interruptions are complete if the user is on main screen, and the ui mode is cleared
    return !!(this.props.currentScreen === "main" && !this.props.uiState.mode && prevProps.uiState.mode);
  }

  private checkCashDrawerWaiting(prevProps: Props): void {
    const cashDrawerWaitingChanged: boolean = this.cashDrawerIsWaiting(prevProps) !==
                                              this.cashDrawerIsWaiting(this.props);

    if (cashDrawerWaitingChanged) {
      this.setState({ cashDrawerWaiting: this.cashDrawerIsWaiting(this.props) });
    }
  }

  private cashDrawerIsWaiting(providedProps: Props): boolean {
    return providedProps.businessState && providedProps.businessState.stateValues &&
        providedProps.businessState.stateValues.get("CashDrawerSession.isWaitingForDrawerResponse");
  }

  private updateShowLoadingModal(prevProps: Props): void {
    // In the Global Blue workflow after printing or canceling out of the print screen,
    // the LOADING_MODAL modal is displayed, blocking the UI even though the modal should be
    // hidden (the state value for showing it is false).
    const loadingModalState = this.props.modalState[LOADING_MODAL];
    const { stateValues } = this.props.businessState;

    const wasPrinting = prevProps && prevProps.businessState && prevProps.businessState.stateValues &&
        prevProps.businessState.stateValues.get("TaxRefundSession.isPrinting");
    const isCompleted = stateValues && (stateValues.get("TaxRefundSession.isCompletedOrSkipped") ||
        stateValues.get("TaxRefundSession.documentIdentifier"));
    const isUploadingLogs = this.props.businessState.eventType === UPLOAD_DEVICE_LOGS_EVENT;
    const isPrintingReceipt = stateValues && stateValues.get("ReceiptSession.state") === "WaitingForPrinting";

    const shouldShowLoadingModal= loadingModalState && loadingModalState.show &&
    !(wasPrinting && isCompleted && !isPrintingReceipt) && !isUploadingLogs;
    if (this.state.shouldShowLoadingModal !== shouldShowLoadingModal) {
      this.setState({shouldShowLoadingModal});
    }
  }

  private checkAppAccessLock(prevProps: Props): void {
    if ((this.props.appAccessLock !== prevProps.appAccessLock) &&
        this.props.appAccessLock.appLocked && this.props.appAccessLock.showAppLockMessage) {
      const alertTitle = I18n.t("appLockErrorTitle");
      const alertMessage = I18n.t("appLockErrorMessage");
      const button: AlertButton[] = [];
      button.push({ text: I18n.t("ok")});
      Alert.alert(alertTitle, alertMessage, button);
      store.dispatch(updateAppAccessLock.success(true, false, this.props.appAccessLock.accessError));
    }
  }

  private handleSuspendTransaction = (resumeToken?: string): void => {
    const uiInputs: UiInput[] = [];
    if (resumeToken && promptForReferenceIdOnSuspend(this.props.settings.configurationManager)) {
      uiInputs.push(new UiInput(UiInputKey.SUSPEND_TRANSACTION_RESUME_TOKEN, resumeToken));
    }
    this.props.businessOperationRequest(this.props.settings.deviceIdentity, SUSPEND_TRANSACTION_EVENT, uiInputs);
    this.props.updateUiMode(UI_MODE_SUSPEND_TRANSACTION);

    this.props.hideModal(SUSPEND_TRANSACTION_MODAL);

    if (!Theme.isTablet) {
      dispatchWithNavigationRef(popTo("main"));
    }
  }

  private handleCancelSuspendTransaction = () =>
      this.props.hideModal(SUSPEND_TRANSACTION_MODAL, MODAL_RESOLUTION.CANCELLED);

}

function mapStateToProps(state: AppState): StateProps {
  return {
    appAccessLock: state.appAccessLock,
    settings: state.settings,
    businessState: state.businessState,
    cameraScannerState: state.cameraScanner,
    customerState: state.customer,
    modalState: state.modalState,
    remoteCall: state.remoteCall,
    uiState: state.uiState,
    userNotification: state.userNotification,
    selfCheckoutModeState: state.selfCheckoutState,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    pendingPaymentState: state.pendingPayment,
    currentScreen: getCurrentRouteNameWithNavigationRef() as keyof StackNavigatorParams
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  alert: alert.request,
  hideModal,
  showModal,
  userNotificationSuccess: userNotification.success,
  businessOperationRequest: businessOperation.request,
  showCameraScanner: showCameraScanner.request,
  displayErrorScanner: displayErrorScanner.request,
  updateTimers,
  updateUiMode: updateUiMode.request,
  feedbackNoteRequest: feedbackNoteAction.request,
  updatePendingPayment: updatePendingPayment.request
})(ModalContainer);
