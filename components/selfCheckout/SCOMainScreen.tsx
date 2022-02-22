import * as React from "react";
import { Image, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  PosBusinessError,
  QualificationError
} from "@aptos-scp/scp-component-store-selling-core";
import {
  CANCEL_TENDER_SESSION_EVENT,
  ITimer,
  SSF_ITEM_HARD_STOP_I18N_CODE,
  SSF_ITEM_SOFT_STOP_I18N_CODE,
  TenderAuthorizationState,
  TimerAction,
  TimerType
} from "@aptos-scp/scp-component-store-selling-features";
import { ICustomer } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  getConfiguredPrinters,
  getReceiptTypes,
  getTaxCustomer,
  hideModal,
  HideModalAction,
  ModalAction,
  recordSCOBlockingBusinessError,
  registerTimer,
  resetReceiptState,
  setAvailableReceiptCategoryButtons,
  setChosenPrinterId,
  setIsReprintLastReceipt,
  setLastSCOSceneKey,
  setReceiptCategory,
  setReceiptEmail,
  setReceiptType,
  showModal,
  startTimer,
  stopTimer,
  unregisterTimer
} from "../../actions";
import { AppState, BusinessState, DataEventState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { createModalComponent } from "../common/utilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import BagFee from "./BagFee";
import { CustomMessagesConfig, getExpectedUncaughtErrorsMap, inTransaction, SCOScreenKeys } from "./common/constants";
import { ISCOUserMessage } from "./common/interfaces";
import SCOPopup from "./common/SCOPopup";
import SCOToggleModePopUp from "./common/SCOToggleModePopUp";
import { SCOMainScreenProps } from "./interfaces";
import MemberScreen from "./MemberScreen";
import Payment from "./Payment";
import PaymentSummary from "./PaymentSummary";
import ShoppingBagScreen from "./ShoppingBagScreen";
import StartScreen from "./StartScreen";
import { scoMainScreenStyles } from "./styles";
import ThankYouScreen from "./ThankYouScreen";
import {
  SCOPrintManagerComponent,
  SCOPrintManagerDispatchProps,
  SCOPrintManagerProps,
  SCOPrintManagerState,
  SCOPrintManagerStateProps
} from "./utilities/SCOPrintManagerComponent";

export const SCO_TOGGLE_MODE = "ScoToggleMode";
const ScoToggleMode = createModalComponent(SCO_TOGGLE_MODE);

interface StateProps extends SCOPrintManagerStateProps {
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
  lastSCOSceneKey: SCOScreenKeys;
  settings: SettingsState;
  dataEvent: DataEventState;
}

interface DispatchProps extends SCOPrintManagerDispatchProps {
  hideModal: HideModalAction;
  performBusinessOperation: ActionCreator;
  recordSCOBlockingBusinessError: ActionCreator;
  registerTimer: ActionCreator;
  setLastSCOSceneKey: ActionCreator;
  showModal: ModalAction;
  startTimer: ActionCreator;
  stopTimer: ActionCreator;
  unregisterTimer: ActionCreator;
}

interface Props extends SCOMainScreenProps, StateProps, DispatchProps, SCOPrintManagerProps,
    NavigationScreenProps<"scoMainScreen"> {}

interface State extends SCOPrintManagerState {
  currentScoScreen: SCOScreenKeys;
  inactivityTimeout: number;
  showMessage: boolean;
  showToggleModePopUp: boolean;
  showInactivityWarning: boolean;
  showSessionExpirePopUp: boolean;
  transactionInactivityTimeout: number;
  userMessage: ISCOUserMessage;
  warningDuration: number;
  warningDurationRemaining: number;
}

class SCOMainScreen extends SCOPrintManagerComponent<Props, State> {
  private expectedUncaughtErrors: Map<string, ISCOUserMessage>;
  private showLogoConfig: any;
  private styles: any;

  // Timer Keys
  private transactionInactivityTimerKey: string = "transactionInactivityTimerKey";
  private emptyCartInactivityTimerKey: string = "emptyCartInactivityTimerKey";
  private warningDurationTimerKey: string = "warningDurationTimerKey";

  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(scoMainScreenStyles());

    this.showLogoConfig = this.props.settings.uiStyling.attendantModeToggleButtonImage;
    this.expectedUncaughtErrors = getExpectedUncaughtErrorsMap(this.getCustomMessages());

    const checkoutModeBehaviors = this.props.settings.configurationManager.getFunctionalBehaviorValues()
        .selfCheckoutModeBehaviors;
    const transactionInactivityTimeout = checkoutModeBehaviors.transactionInactivityTimeout;
    const inactivityTimeout = checkoutModeBehaviors && checkoutModeBehaviors.emptyCartInactivityTimeout;
    const warningDuration = checkoutModeBehaviors.emptyCartWarningDuration;

    this.state = {
      currentScoScreen: this.getSceneToLoad(props),
      inactivityTimeout,
      showInactivityWarning: false,
      showMessage: false,
      showSessionExpirePopUp: false,
      showToggleModePopUp: false,
      transactionInactivityTimeout,
      userMessage: {
        isDismissible: true,
        text: undefined,
        title: undefined
      },
      warningDuration,
      warningDurationRemaining: warningDuration,
      receiptSubmitted: false
    };
  }

  public componentDidMount(): void {
    this.checkForUncaughtBusinessStateError();
    this.checkForUncaughtDataEventError();

    this.props.registerTimer(this.transactionInactivityTimerKey, {
      type: TimerType.Timeout,
      onTimerElapsed: this.onTransactionInactivityTimeout.bind(this),
      duration: this.state.transactionInactivityTimeout,
      preventModificationWhilePaymentInProgress: true,
      preventUpdateAfterTimeoutFired: true,
      onUiInteraction: TimerAction.Reset,
      onPaymentStarted: TimerAction.Stop,
      onPaymentStopped: TimerAction.Start
    } as ITimer);

    this.props.registerTimer(this.emptyCartInactivityTimerKey, {
      type: TimerType.Timeout,
      onTimerElapsed: this.onEmptyCartInactivityTimeout.bind(this),
      duration: this.state.inactivityTimeout,
      preventModificationWhilePaymentInProgress: true,
      preventUpdateAfterTimeoutFired: false,
      onUiInteraction: TimerAction.Reset
    } as ITimer);

    this.props.registerTimer(this.warningDurationTimerKey, {
      type: TimerType.Interval,
      onTimerElapsed: this.warningCountdown.bind(this),
      duration: 1,
      preventModificationWhilePaymentInProgress: true,
      onTimerStopped: this.resetInactivityWarningWindow.bind(this)
    } as ITimer);

    if (this.notInStartOrThankYouScreen) {
      if (inTransaction(this.props.businessState.stateValues)) {
        this.startTransactionInactivityTimer();
      } else {
        this.startEmptyCartInactivityTimer();
      }
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    super.componentDidUpdate(prevProps, prevState);
    const prevBusinessState = prevProps.businessState;
    const currentBusinessState = this.props.businessState;

    const enteringStartScreen = prevState.currentScoScreen !== SCOScreenKeys.Start &&
                                this.state.currentScoScreen === SCOScreenKeys.Start;

    const enteringThankYouScreen = prevState.currentScoScreen !== SCOScreenKeys.ThankYou &&
                                   this.state.currentScoScreen === SCOScreenKeys.ThankYou;

    const leavingStartScreen = prevState.currentScoScreen === SCOScreenKeys.Start &&
                               this.state.currentScoScreen !== SCOScreenKeys.Start;

    if (!prevBusinessState.inProgress && currentBusinessState.inProgress ||
        (enteringStartScreen || enteringThankYouScreen)) {
      this.stopTransactionInactivityTimer();
      this.stopEmptyCartInactivityTimer();
      this.stopWarningCountdown();
    } else if (((prevBusinessState.inProgress && !currentBusinessState.inProgress) || leavingStartScreen) &&
               this.notInStartOrThankYouScreen) {
      if (inTransaction(currentBusinessState.stateValues)) {
        this.startTransactionInactivityTimer();
      } else {
        this.startEmptyCartInactivityTimer();
      }
    }

    const hasDataEventError = !prevProps.dataEvent.error && this.props.dataEvent.error;
    if (this.hadNewBusinessStateError(prevProps)) {
      this.checkForUncaughtBusinessStateError();
    } else if (hasDataEventError) {
      this.checkForUncaughtDataEventError();
    }

    if (!this.state.showInactivityWarning && prevState.showInactivityWarning) {
      this.props.stopTimer(this.warningDurationTimerKey);
    }
  }

  public componentWillUnmount(): void {
    this.props.unregisterTimer(this.transactionInactivityTimerKey);
    this.props.unregisterTimer(this.emptyCartInactivityTimerKey);
    this.props.unregisterTimer(this.warningDurationTimerKey);

    this.props.setLastSCOSceneKey(this.state.currentScoScreen);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <View style={this.styles.topButtonArea}>
          { this.renderTopButtonAreaContents() }
        </View>
        {
          this.state.currentScoScreen === SCOScreenKeys.Start &&
          <StartScreen
            navigateToNextScreen={this.handleNavigateToNextScreen.bind(this)}
            toggleShowToggleModePopUp={this.handleShowToggleModeModal}
          />
        }
        {
          this.state.currentScoScreen === SCOScreenKeys.ShoppingBag &&
          <ShoppingBagScreen navigateToNextScreen={this.handleNavigateToNextScreen.bind(this)} />
        }
        {
          this.state.currentScoScreen === SCOScreenKeys.BagFee &&
          <BagFee navigateToNextScreen={this.handleNavigateToNextScreen.bind(this)}/>
        }
        {
          this.state.currentScoScreen === SCOScreenKeys.Member &&
          <MemberScreen
            navigateToNextScreen={this.handleNavigateToNextScreen.bind(this)}
            navigation={this.props.navigation}
          />
        }
        {
          this.state.currentScoScreen === SCOScreenKeys.Payment &&
          <Payment
            navigateToNextScreen={this.handleNavigateToNextScreen.bind(this)}
          />
        }
        {
          this.state.currentScoScreen === SCOScreenKeys.PaymentSummary &&
          <PaymentSummary
            navigateToNextScreen={this.handleNavigateToNextScreen.bind(this)}
            onPaymentComplete={this.onPaymentComplete.bind(this)}
            navigation={this.props.navigation}
          />
        }
        {
          this.state.currentScoScreen === SCOScreenKeys.ThankYou &&
          <ThankYouScreen
            navigateToNextScreen={this.handleNavigateToNextScreen.bind(this)}
          />
        }
        {
          this.state.showMessage && this.renderUserMessagePopUp()
        }
        {
          this.state.showToggleModePopUp &&
          <ScoToggleMode>
            <SCOPopup preserveUiMode={true} navigation={this.props.navigation}>
              <SCOToggleModePopUp onHide={this.handleHideToggleModeModal} navigation={this.props.navigation} />
            </SCOPopup>
          </ScoToggleMode>
        }
        {
          (this.state.showInactivityWarning || this.state.showSessionExpirePopUp) && this.renderInactivityPopUp()
        }
      </BaseView>
    );
  }

  private renderInactivityPopUp(): JSX.Element {
    const showSessionExpirePopUp: boolean = this.state.showSessionExpirePopUp && !this.state.showInactivityWarning;
    const showWarningCountdown: boolean = this.state.showInactivityWarning && !this.state.showSessionExpirePopUp;

    return (
      <SCOPopup
        allowToggleApplicationMode={showSessionExpirePopUp}
        preserveUiMode={showWarningCountdown}
        navigation={this.props.navigation}
      >
        {
          showWarningCountdown &&
          <View style={this.styles.helpPopUpArea}>
            <Text style={this.styles.title}>{I18n.t("inactivity")}</Text>
            <Text style={[this.styles.subtitle, this.styles.subtitleParent]}>{I18n.t("purchaseTimeout")}</Text>
            <Text style={this.styles.timer}>{I18n.t("countdown", { timer: this.state.warningDurationRemaining })}</Text>
            <TouchableOpacity style={this.styles.resumeButton} onPress={this.resumePressed.bind(this)} >
              <Text style={this.styles.resumeButtonText}>{I18n.t("resumeTransaction")}</Text>
            </TouchableOpacity>
          </View>
        }
        {
          showSessionExpirePopUp &&
          <View style={this.styles.helpPopUpArea}>
            <Text style={this.styles.title}>{I18n.t("sessionEnd")}</Text>
            <Text style={[this.styles.subtitleParent, this.styles.subtitle]}>{I18n.t("sessionEndDescription")}</Text>
          </View>
        }
      </SCOPopup>
    );
  }

  private renderTopButtonAreaContents(): JSX.Element {
    return (
      <>
        {
          !this.notInStartOrThankYouScreen && <View />
        }
        {
          this.notInStartOrThankYouScreen &&
          <TouchableHighlight
            style={[this.styles.toggleButton, this.showLogoConfig ? {} : this.styles.toggleButtonNoLogo]}
            onPress={this.handleShowToggleModeModal}
          >
            <View style={this.styles.logoArea}>
              {/* Using TouchableHighlight for visual feedback even when child elements are empty
                  TouchableHighlight requires and accepts only one child; a view with the logo/hidden text or empty */}
              {
                this.showLogoConfig &&
                <Image
                  source={this.showLogoConfig}
                  style={this.styles.logo}
                  resizeMethod={"resize"}
                />
              }
            </View>
          </TouchableHighlight>
        }
        {
          this.state.currentScoScreen !== SCOScreenKeys.Start &&
          <TouchableOpacity
            style={this.styles.helpButton}
            onPress={() => this.showHelpPopUp()}
          >
            <Text style={this.styles.helpText}>{I18n.t("help")}</Text>
          </TouchableOpacity>
        }
      </>
    );
  }

  private renderUserMessagePopUp(): JSX.Element {
    const preserveUiMode: boolean = !this.state.showInactivityWarning && !this.state.showSessionExpirePopUp;
    return (
      <SCOPopup
        allowToggleApplicationMode={!this.state.userMessage.isDismissible}
        preserveUiMode={preserveUiMode}
        navigation={this.props.navigation}
      >
        <View style={this.styles.helpPopUpArea}>
          <Text style={this.styles.title}>{this.state.userMessage.title}</Text>
          <View style={this.styles.subtitleParent}>
            {this.state.userMessage.text.map((text) => <Text style={this.styles.subtitle}>{text}</Text>)}
          </View>
          {
            (this.state.userMessage.isDismissible) &&
            <TouchableOpacity
              style={this.styles.closeHelpButton}
              onPress={() => this.clearUserMessagePopUp()}
            >
              <Text style={this.styles.closeHelpButtonText}>{I18n.t("ok")}</Text>
            </TouchableOpacity>
          }
        </View>
      </SCOPopup>
    );
  }

  private getSceneToLoad(props: Props): SCOScreenKeys {
    let sceneToLoad: SCOScreenKeys = SCOScreenKeys.Start;

    if (!this.props.businessState.stateValues.get("TerminalSession.isOpen")
          || this.props.businessState.stateValues.get("transaction.closed")) {
      return sceneToLoad;
    }

    const customer: ICustomer = this.props.businessState.stateValues &&
                                this.props.businessState.stateValues.get("transaction.customer");

    if (customer && customer.customerNumber && props.lastSCOSceneKey !== SCOScreenKeys.ThankYou) {
      sceneToLoad = SCOScreenKeys.Payment;
    } else if (props.lastSCOSceneKey === SCOScreenKeys.ShoppingBag || props.lastSCOSceneKey === SCOScreenKeys.Member ||
               props.lastSCOSceneKey === SCOScreenKeys.Payment) {
      sceneToLoad = SCOScreenKeys.ShoppingBag;
    } else if (props.lastSCOSceneKey === SCOScreenKeys.ThankYou) {
      sceneToLoad = SCOScreenKeys.ThankYou;
    }

    return sceneToLoad;
  }

  private get notInStartOrThankYouScreen(): boolean {
    return this.state.currentScoScreen !== SCOScreenKeys.Start &&
           this.state.currentScoScreen !== SCOScreenKeys.ThankYou;
  }

  private handleNavigateToNextScreen(newScoScreen: SCOScreenKeys): void {
    this.setState({ currentScoScreen: newScoScreen });
  }

  private clearUserMessagePopUp(): void {
    this.setState({
      showMessage: false,
      userMessage: {
        isDismissible: true,
        text: undefined,
        title: undefined
      }
    });
  }

  private showHelpPopUp(): void {
    this.setState({
      showMessage: true,
      userMessage: {
        title: I18n.t("helpIsOnTheWay"),
        text: [I18n.t("aStaffMemberWillBeWithYouShortly")],
        isDismissible: true
      }
    });
  }

  private handleShowToggleModeModal = () => {
    this.setState({showToggleModePopUp: true});
    this.props.showModal(SCO_TOGGLE_MODE);
  }

  private handleHideToggleModeModal = () => {
    this.setState({showToggleModePopUp: false});
    this.props.hideModal(SCO_TOGGLE_MODE);
  }

  private navigateFromStartScreen = (): void => {
    if (this.state.currentScoScreen === SCOScreenKeys.Start) {
      this.handleNavigateToNextScreen(SCOScreenKeys.ShoppingBag);
    }
  }

  private isExpectedUncaughtError(error: Error): error is QualificationError {
    return error && error instanceof QualificationError &&
           this.expectedUncaughtErrors.has(error.localizableMessage.i18nCode);
  }

  private isExpectedUncaughtPOSError(error: Error): error is PosBusinessError {
    return error && error instanceof PosBusinessError &&
        this.expectedUncaughtErrors.has(error.localizableMessage.i18nCode);
  }

  private checkForUncaughtBusinessStateError(): void {
    const businessStateError = this.props.businessState && this.props.businessState.error;
    const businessErrorUserMessage = !this.props.businessState.inProgress &&
        this.isExpectedUncaughtError(businessStateError) &&
        this.expectedUncaughtErrors.get(businessStateError.localizableMessage.i18nCode);

    if (businessErrorUserMessage) {
      if (businessStateError instanceof QualificationError && (
          businessStateError.localizableMessage.i18nCode === SSF_ITEM_HARD_STOP_I18N_CODE ||
          businessStateError.localizableMessage.i18nCode === SSF_ITEM_SOFT_STOP_I18N_CODE)) {
        this.props.recordSCOBlockingBusinessError(businessStateError);
      }

      this.navigateFromStartScreen();

      this.setState({showMessage: true, userMessage: businessErrorUserMessage});
    }
  }

  private checkForUncaughtDataEventError(): void {
    const dataEventError = this.props.dataEvent && this.props.dataEvent.error;
    const dataEventErrorUserMessage = !this.props.businessState.inProgress &&
        this.isExpectedUncaughtPOSError(dataEventError) &&
        this.expectedUncaughtErrors.get(dataEventError.localizableMessage.i18nCode);

    if (dataEventErrorUserMessage) {
      this.navigateFromStartScreen();

      this.setState({showMessage: true, userMessage: dataEventErrorUserMessage});
    }
  }

  private startTransactionInactivityTimer(): void {
    this.props.startTimer(this.transactionInactivityTimerKey);
  }

  private onTransactionInactivityTimeout(): void {
    this.props.hideModal(SCO_TOGGLE_MODE);
    if (this.props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.WaitingForRetryLastAuthorization) {
      this.props.performBusinessOperation(this.props.deviceIdentity, CANCEL_TENDER_SESSION_EVENT, []);
    }
    this.setState({ showSessionExpirePopUp: true, showToggleModePopUp: false });
  }

  private stopTransactionInactivityTimer(): void {
    this.props.stopTimer(this.transactionInactivityTimerKey);
  }

  private startEmptyCartInactivityTimer(): void {
    this.props.startTimer(this.emptyCartInactivityTimerKey);
  }

  private startWarningCountdown(): void {
    this.props.startTimer(this.warningDurationTimerKey);
  }

  private resetInactivityWarningWindow(): void {
    this.setState({ showInactivityWarning: false, warningDurationRemaining: this.state.warningDuration });
  }

  private onEmptyCartInactivityTimeout(): void {
    this.props.hideModal(SCO_TOGGLE_MODE);
    this.startWarningCountdown();
    this.setState({ showInactivityWarning: true, showToggleModePopUp: false });
  }

  private warningCountdown(): void {
    const warningDurationRemaining = this.state.warningDurationRemaining - 1;
    this.setState({ warningDurationRemaining });

    if (warningDurationRemaining <= 0) {
      this.resetInactivityWarningWindow();
      this.handleNavigateToNextScreen(SCOScreenKeys.Start);
    }
  }

  private stopEmptyCartInactivityTimer(): void {
    this.props.stopTimer(this.emptyCartInactivityTimerKey);
  }

  private stopWarningCountdown(): void {
    this.props.stopTimer(this.warningDurationTimerKey);
    this.resetInactivityWarningWindow();
  }

  private resumePressed(): void {
    this.stopWarningCountdown();
    this.startEmptyCartInactivityTimer();
  }

  private getCustomMessages(): CustomMessagesConfig {
    const functionalBehaviorConfigs = this.props.settings.configurationManager &&
                                      this.props.settings.configurationManager.getFunctionalBehaviorValues();
    const selfCheckoutModeBehaviors = functionalBehaviorConfigs && functionalBehaviorConfigs.selfCheckoutModeBehaviors;
    const customMessages = selfCheckoutModeBehaviors && selfCheckoutModeBehaviors.customMessages;
    const itemNotFoundTitleSCO = customMessages && customMessages.itemNotFoundTitleSCO;
    const itemNotFoundSubtitleSCO = customMessages && customMessages.itemNotFoundSubtitleSCO;
    const itemNotFoundHelpLineSCO = customMessages && customMessages.itemNotFoundHelpLineSCO;

    return {
      itemNotFoundTitleSCO,
      itemNotFoundSubtitleSCO,
      itemNotFoundHelpLineSCO
    };
  }

  private hadNewBusinessStateError(prevProps: Props): boolean {
    const hasBusinessStateError = this.props.businessState.error &&
        this.props.businessState.inProgress !== prevProps.businessState.inProgress;
    const businessStateErrorChanged = prevProps.businessState.error !== this.props.businessState.error;
    return hasBusinessStateError && businessStateErrorChanged;
  }

  private onPaymentComplete(): void {
    this.handleNavigateToNextScreen(SCOScreenKeys.ThankYou);
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity,
    lastSCOSceneKey: state.selfCheckoutState.lastSceneKey,
    settings: state.settings,
    dataEvent: state.dataEvent,
    /** PrintManager Props */
    availableReceiptTypes: state.receipt.availableReceiptTypes,
    chosenPrinterId: state.receipt.chosenPrinterId,
    chosenReceiptType: state.receipt.chosenReceiptType,
    configuredPrinters: state.receipt.configuredPrinters,
    isReprintLastReceipt: state.receipt.isReprintLastReceipt,
    receiptCategory: state.receipt.receiptCategory,
    receiptEmail: state.receipt.receiptEmail,
    receiptPhoneNumber: state.receipt.receiptPhoneNumber,
    taxCustomer: state.receipt.taxCustomer,
    uiState: state.uiState,
    stateValues: state.businessState.stateValues,
    retailLocations: state.retailLocations,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
};

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  hideModal,
  performBusinessOperation: businessOperation.request,
  recordSCOBlockingBusinessError: recordSCOBlockingBusinessError.request,
  registerTimer,
  showModal,
  startTimer,
  stopTimer,
  setLastSCOSceneKey: setLastSCOSceneKey.request,
  unregisterTimer,
  /** PrintManager Props */
  getConfiguredPrinters: getConfiguredPrinters.request,
  getReceiptTypes: getReceiptTypes.request,
  resetReceiptState: resetReceiptState.request,
  setAvailableReceiptCategoryButtons: setAvailableReceiptCategoryButtons.request,
  setChosenPrinterId: setChosenPrinterId.request,
  setIsReprintLastReceipt: setIsReprintLastReceipt.request,
  setReceiptCategory: setReceiptCategory.request,
  setReceiptEmail: setReceiptEmail.request,
  setReceiptType: setReceiptType.request,
  getTaxCustomer: getTaxCustomer.request
})(withMappedNavigationParams<typeof SCOMainScreen>()(SCOMainScreen));
