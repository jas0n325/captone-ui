import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as React from "react";
import {
  Alert,
  AppState as ReactNativeAppState,
  AppStateStatus,
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
import KeyEvent from "react-native-keyevent";
import MobileDeviceManager from "react-native-mdm";
import Orientation from "react-native-orientation-locker";
import SideMenu from "react-native-side-menu";
import { connect } from "react-redux";

//
// WARNING: DO NOT MOVE THIS IMPORT BELOW ANY THAT WILL LOAD CLASSES USING DEPENDENCY INJECTION!!!!!
//
// The inversify.config module MUST be loaded, before loading anything that uses dependency injection, because
// inversify.config imports the reflect-metadata module, which inversify uses to implement dependency injection.
// When inversify.config is loaded after a class that uses dependency injection, the module loading throws the dreaded
// "Reflect.hasOwnMetadata is not a function" error.
import { getTranslationsFromEmbeddedJson, initDependencyInjection, initI18n } from "../../config";
import I18n, { getTranslationsFromI18Translations } from "../../config/I18n";
import { getCustomerAttributes } from "../../config/inversify/inversify.terminal.config/customer.config";
import {
  startListernManager,
  startPeerDiscoveryManager,
  stopListenerManager,
  stopPeerDiscoveryManager
} from "../../config/inversify/inversify.terminal.config/database.config";
import {
  startDeviceServices,
  stopDeviceServices
} from "../../config/inversify/inversify.terminal.config/device-services.config";
import { getLoyaltyReferences } from "../../config/inversify/inversify.terminal.config/loyalty.config";
import { getRetailLocationUpdates } from "../../config/inversify/inversify.terminal.config/organization.config";

import { ILocalizableMessage } from "@aptos-scp/scp-component-business-core";
import { ILogEntryMessage, ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import {
  isDeviceServiceError
} from "@aptos-scp/scp-component-rn-device-services";
import { Linking, UrlEvent } from "@aptos-scp/scp-component-rn-url-linking";
import {
  ConfigurationBlockKey,
  DI_TYPES as CORE_DI_TYPES,
  ITranslationManager,
  PosError,
  QualificationError,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  EXIT_ATTENDANT_MODE_EVENT,
  IN_MERCHANDISE_TRANSACTION,
  IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE,
  IRetailLocation,
  isStoredValueCardServiceAvailable,
  isStoredValueCertificateServiceAvailable,
  LOG_OFF_EVENT,
  LOGGED_OFF,
  NOT_IN_TRANSACTION,
  REPRINT_LAST_RECEIPT_EVENT,
  SSF_ITEM_REQUIRES_PRICE_ENTRY,
  TERMINAL_STATE_SYNC_EVENT,
  TerminalPendingUpdate,
  UiInputKey,
  UPDATE_USER_PREFERENCES_EVENT,
  ValueCardAction,
  ValueCertificateAction
} from "@aptos-scp/scp-component-store-selling-features";
import { IPaymentStatus, ValueCertSubType } from "@aptos-scp/scp-types-commerce-devices";
import { CustomerResponse, ResponseError } from "@aptos-scp/scp-types-sidecar-clienteling";

import { CLIENT_UNEXPECTED_ERROR_I18N_CODE } from "../../config/ErrorCodes";
import {
  ActionCreator,
  AppStatus,
  businessOperation,
  checkIfAppVersionIsBlocked,
  clearSelectedItemLines,
  dataEvent,
  DataEventType,
  IKeyListenerData,
  initAppSettingsAction,
  loadAppResource,
  loadCountries,
  loadRewardReasons,
  searchCustomer,
  updateUiMode,
  userNotification,
  loadI18nLocation
} from "../actions";
import { ItemSelectionMode } from "../actions/itemSelection";
import { setLastSCOSceneKey } from "../actions/selfCheckoutMode";
import {
  AppState,
  BusinessState,
  RetailLocationsState,
  SelfCheckoutState,
  SettingsState,
  UI_MODE_FATAL_ERROR,
  UiState
} from "../reducers";
import Theme from "../styles";

import BaseView from "./common/BaseView";
import { RenderSelectOptions } from "./common/FieldValidation";
import ReasonCodeListScreen from "./common/screens/ReasonCodeListScreen";
import VectorIcon from "./common/VectorIcon";
import OrderDeliveryAddress from "./orderContact/OrderDeliveryAddress";
import { getIsGiftCardDeviceFilter, getPaymentDevicesAsRenderSelect } from "./payment/PaymentDevicesUtils";
import { phoneStyles, tabletStyles } from "./styles";

import { CountriesState } from "../reducers/countries";
import BagFeeScreen from "./bagFee/BagFeeScreen";
import BasketActionsScreen from "./basketActions/BasketActionsScreen";
import { CameraScannerScreenWrapper } from "./camera/CameraScannerScreenWrapper";
import CommentsScreen from "./common/screens/CommentsScreen";
import FreeTextCommentScreen from "./common/screens/FreeTextCommentScreen";
import TextScreen from "./common/screens/TextScreen";
import {
  buildExternalClientelingAppRequest,
  clientelingAppUrl,
  ExternalClientelingAppInboundAction,
  ExternalClientelingAppOutboundAction,
  getDonationDefinition,
  getExternalClientelingAppAction,
  getExternalClientelingAppComponent,
  getLandingDefinition,
  getTestIdProperties,
  isLandingVisible,
  ScreenAction
} from "./common/utilities";
import { pop, popTo, replace } from "./common/utilities/navigationUtils";
import CouponScreen from "./coupon/CouponScreen";
import AddressSearchScreen from "./customer/AddressSearchScreen";
import AttributeGroupCodeScreen from "./customer/AttributeGroupCodeScreen";
import CustomerAttributeEditorScreen from "./customer/CustomerAttributeEditorScreen";
import CustomerCreateScreen from "./customer/CustomerCreateScreen";
import CustomerDisplayScreen from "./customer/CustomerDisplayScreen";
import CustomerNipScreen from "./customer/CustomerNipScreen";
import CustomerResultsScreen from "./customer/CustomerResultsScreen";
import CustomerSearchScreen from "./customer/CustomerSearchScreen";
import CustomerTaxInvoiceScreen from "./customer/CustomerTaxInvoiceScreen";
import CustomerUpdateScreen from "./customer/CustomerUpdateScreen";
import PhoneCountryCodeScreen from "./customer/PhoneCountryCodeScreen";
import OrderInquiryDetailScreen from "./customerOrder/OrderInquiryDetailScreen";
import OrderInquiryScreen from "./customerOrder/OrderInquiryScreen";
import DiscountScreen from "./discounts/DiscountScreen";
import DiscountTypeSelectionScreen from "./discounts/DiscountTypeSelectionScreen";
import PreConfiguredDiscountsScreen from "./discounts/PreConfiguredDiscountsScreen";
import DonationScreen from "./donation/DonationScreen";
import FatalErrorScreen from "./error/FatalErrorScreen";
import VoidableErrorScreen from "./error/VoidableErrorScreen";
import FastDiscountSelectionScreen from "./fastDiscounts/FastDiscountDetailsScreen";
import FastDiscountScreen from "./fastDiscounts/FastDiscountScreen";
import FindNearbyScreen from "./findNearby/FindNearbyScreen";
import StoreOperationDetailsScreen from "./findNearby/StoreOperationDetailsScreen";
import FiscalConfigValidationError from "./fiscalPrinter/FiscalConfigValidationErrorScreen";
import FiscalPrinterEnterDocumentNumberScreen from "./fiscalPrinter/FiscalPrinterEnterDocumentNumberScreen";
import FiscalPrinterReceiptErrorScreen from "./fiscalPrinter/FiscalPrinterReceiptErrorScreen";
import FiscalPrinterError from "./fiscalPrinter/FiscalPrintErrorScreen";
import FiscalPrinter from "./fiscalPrinter/FiscalPrinterScreen";
import FiscalSyncReportError from "./fiscalPrinter/FiscalSyncReportErrorScreen";
import { GenericPrinterScreenWrapper } from "./genericPrinter/GenericPrinterScreenWrapper";
import BalanceInquiryScreen from "./giftCard/BalanceInquiryScreen";
import CardRedeemScreen from "./giftCard/CardRedeemScreen";
import IssueGiftCardScreen from "./giftCard/IssueGiftCardScreen";
import SalesHistoryScreen from "./history/SalesHistoryScreen";
import TransactionHistoryScreen from "./history/TransactionHistoryScreen";
import InformationScreen from "./information/InformationScreen";
import InitScreen from "./init/InitScreen";
import LandingScreen from "./landing/LandingScreen";
import LoginScreen from "./login/LoginScreen";
import ScanLotteryScreen from "./lottery/ScanLotteryScreen";
import LoyaltyDiscountScreen from "./loyaltyMembership/LoyaltyDiscountScreen";
import LoyaltyEnrollmentScreen from "./loyaltyMembership/LoyaltyEnrollmentScreen";
import LoyaltyMembershipDetailScreen from "./loyaltyMembership/LoyaltyMembershipDetailScreen";
import LoyaltyVoucherScreen from "./loyaltyVoucher/LoyaltyVoucherScreen";
import MainScreen from "./main/MainScreen";
import ModalContainer from "./modalContainer/ModalContainer";
import NonMerchScreen from "./nonMerch/NonMerchScreen";
import NotFoundScreen from "./notFound/NotFoundScreen";
import NotOnFileScreen from "./notOnFile/NotOnFileScreen";
import OpenCloseTerminalScreen from "./openCloseTerminal/OpenCloseTerminalScreen";
import OrderPickupDetails from "./orderContact/OrderPickupDetails";
import UnavailableQuantitiesDetail from "./orderInventory/UnavailableQuantitiesDetail";
import NonIntegratedPaymentScreen from "./payment/NonIntegratedPaymentScreen";
import OfflineAuthorizationScreen from "./payment/OfflineAuthorizationScreen";
import PaymentScreen from "./payment/PaymentScreen";
import TenderPromptRulesScreen from "./payment/TenderPromptRulesScreen";
import PreferencesScreen from "./preferences/PreferencesScreen";
import PriceScreen from "./price/PriceScreen";
import ZeroPricedScreen from "./price/ZeroPricedScreen";
import ProductInquiryDetailScreen from "./product/ProductInquiryDetailScreen";
import ProductInquiryScreen from "./product/ProductInquiryScreen";
import ProductScreen from "./product/ProductScreen";
import QuantityScreen from "./quantity/QuantityScreen";
import ReceiptCategoryChoiceScreen from "./receipt/receiptFlow/ReceiptCategoryChoiceScreen";
import ReceiptEmailFormScreen from "./receipt/receiptFlow/ReceiptEmailFormScreen";
import ReceiptPhoneNumberFormScreen from "./receipt/receiptFlow/ReceiptPhoneNumberFormScreen";
import ReceiptPrinterChoiceScreen from "./receipt/receiptFlow/ReceiptPrinterChoiceScreen";
import ReceiptSummaryScreen from "./receipt/ReceiptSummaryScreen";
import ReprintReceiptScreen from "./receipt/ReprintReceiptScreen";
import SuspendedTransactionsScreen from "./resumeSale/SuspendedTransactionsScreen";
import ReturnDetailsScreen from "./return/ReturnDetailsScreen";
import ReturnSearchScreen from "./return/ReturnSearchScreen";
import ReturnWithTransactionScreen from "./return/ReturnWithTransactionScreen";
import ReturnWithTransactionSearchResultScreen from "./return/ReturnWithTransactionSearchResultScreen";
import {
  dispatchWithNavigationRef,
  getCurrentRouteNameWithNavigationRef,
  navigate,
  refreshScreenWithNavigationRef,
  resetStackWithNavigationRef
} from "./RootNavigation";
import AssignSalespersonScreen from "./salesperson/AssignSalespersonScreen";
import { SCOScreenKeys } from "./selfCheckout/common/constants";
import SCOMainScreen from "./selfCheckout/SCOMainScreen";
import { selfCheckoutConfigured, selfCheckoutModeActive } from "./selfCheckout/utilities/SelfCheckoutStateCheck";
import CreatingCouchbaseIndexesScreen from "./settings/CreatingCouchbaseIndexesScreen";
import DownloadProgressScreen from "./settings/DownloadProgressScreen";
import TenantSettingsScreen from "./settings/TenantSettingsScreen";
import TerminalConflictScreen from "./settings/TerminalConflictScreen";
import TerminalSettingsScreen from "./settings/TerminalSettingsScreen";
import ShippingMethodScreen from "./shipping/ShippingMethodScreen";
import SignatureCapture from "./signature/SignatureCaptureScreen";
import { StackNavigatorParams } from "./StackNavigatorParams";
import StoppedItemScreen from "./stoppedItem/StoppedItemScreen";
import StoreOperationsScreen from "./storeOperations/StoreOperationsScreen";
import ItemSubscriptionScreen from "./subscriptions/ItemSubscriptionScreen";
import SubscriptionsAuthorizationScreen from "./subscriptions/SubscriptionsAuthorizationScreen";
import TaxExemptScreen from "./taxExempt/TaxExemptScreen";
import TaxFreeScreen from "./taxFree/TaxFreeScreen";
import TaxActionPanelScreen from "./taxModifiers/TaxActionPanelScreen";
import TaxOverrideScreen from "./taxModifiers/taxOverride/TaxOverrideScreen";
import TenderExchangeScreen from "./tender/exchange/TenderExchangeScreen";
import CurrencyCalculatorScreen from "./tillManagement/CurrencyCalculatorScreen";
import PaidDetailScreen from "./tillManagement/PaidDetailScreen";
import ScanDrawerScreen from "./tillManagement/ScanDrawerScreen";
import TillDetailScreen from "./tillManagement/TillDetailScreen";
import TillManagementScreen from "./tillManagement/TillManagementScreen";
import TillSuccessScreen from "./tillManagement/TillSuccessScreen";
import TillVarianceReasonScreen from "./tillManagement/TillVarianceReasonScreen";
import ChangePasswordScreen from "./user/ChangePasswordScreen";
import ValueCertificateScreen from "./valueCertificate/ValueCertificateScreen";
import TillVarianceScreen from "./tillManagement/TillVarianceScreen";
import IssueGiftCertificateScreen from "./valueCertificate/IssueGiftCertificateScreen";
import TenderChangeScreen from "./tender/change/TenderChangeScreen";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.RootContainer");

//TODO (ref ZSPFLD-1679): Review this example approach while implementing configurable branding.
// Most components define a const "styles" at this point, initialized by EStyleSheet.create().  This gives no
// opportunity to customize styles with configuration values (custom colors and such).
// This module uses a different technique to permit demonstration of how the use of configuration values
// can customize presentation styles.
//
// Here's about the technique:
// (1) Define the EStyleSheet.create()'d "styles" as a private member of the component (so it can be revised).
// (2) Initialize the private member, usually during construction, by applying EStyleSheet.create to the
//     "styles" (at this point, "interpreting" them).
//
// This is an effective approach, but there may well be a better approach.  Moving stylesheet generation in each
// component class from being interpreted once, at module load, to being interpreted multiple times, during construction
// or such, may have an undesirable performance impact.
//
// The technique should be reviewed and possibly revised during implementation of the referenced JIRA task.
//

export interface StateProps {
  businessState: BusinessState;
  itemSelectionMode: ItemSelectionMode;
  paymentStatus: Map<string, IPaymentStatus>;
  retailLocations: RetailLocationsState;
  sceneTitles: Map<string, string>;
  selfCheckoutModeState: SelfCheckoutState;
  settings: SettingsState;
  terminalStateSyncEnabled: boolean;
  uiState: UiState;
  countries: CountriesState;
  i18nLocation: string;
}

export interface DispatchProps {
  dataEvent: ActionCreator;
  initAppSettings: ActionCreator;
  performBusinessOperation: ActionCreator;
  clearSelectedItemLines: ActionCreator;
  uiModeFailure: ActionCreator;
  updateUiMode: ActionCreator;
  userNotification: ActionCreator;
  loadRewardReasons: ActionCreator;
  searchCustomer: ActionCreator;
  setLastSCOSceneKey: ActionCreator;
  loadAppResource: ActionCreator;
  checkIsAppVersionBlocked: ActionCreator;
  loadCountries: ActionCreator;
  loadI18nLocation: ActionCreator;
}

export interface Props extends StateProps, DispatchProps, RootContainerProps {}

export interface RootContainerProps {
  onUiUpdate: (uiStyling: any) => void;
}

export interface State {
  reactNativeAppState: AppStateStatus;
  isOpen: boolean;
  loggedIn: boolean;
  stackNavigator: JSX.Element;
  uiStyleUpdate: boolean;
  isExternalClientelingAppRequestInProgress: boolean;
}

const deviceScreen = Dimensions.get("window");
const sideMenuWidth = deviceScreen.width * 0.9;

/**
 * Timeout for sending keyboard scanner data after receiving a new line
 * used to support multiline barcodes
 * unit: ms
 */
const KEY_EVENT_TIMEOUT: number = 100;

const Stack = createNativeStackNavigator<StackNavigatorParams>();


class RootContainer extends React.Component<Props, State> {
  private allowToContinueAfterConfigs: boolean = true;
  private selfCheckoutModeConfigEnabled: boolean;
  private selfCheckoutConfigError: boolean;
  private landingPageConfigEnabled: boolean;
  private isGiftCardDevice: (paymentStatus: IPaymentStatus) => boolean = undefined;
  private barcodeData: string = "";
  private giftCardDevices: RenderSelectOptions[] = undefined;
  private keyboardDidShowListener: any;
  private keyboardDidHideListener: any;
  private scenes: JSX.Element[];
  private styles: any;
  private storeOperationButtonValue: boolean;
  private capitalizeNextKey: boolean = false;
  private keyEventTimeout: number;
  private isGiftCardAvailable: boolean = false;
  private isValueCertAvailable: boolean = false;
  private isReloadingApp: boolean;
  private currentScreen: string;

  public constructor(props: Props) {
    super(props);

    this.state = {
      reactNativeAppState: undefined,
      isOpen: false,
      loggedIn: false,
      stackNavigator: null,
      uiStyleUpdate: false,
      isExternalClientelingAppRequestInProgress: false
    };

    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.renderSettingBackButton = this.renderSettingBackButton.bind(this);
    this.toggle = this.toggle.bind(this);

    const uri: string = Platform.OS === "android" ? "asset:/ss_aptos.png" : "ss_aptos.png";
    if (!Theme.isTablet) {
      this.styles = Theme.getStyles(phoneStyles(deviceScreen));
      this.createPhoneScenes({uri}, {uri}).catch((error) => {
        throw logger.throwing(error, "RootContainer.createPhoneScenes", LogLevel.WARN);
      });
      Orientation.lockToPortrait();
    } else {
      this.styles = Theme.getStyles(tabletStyles(deviceScreen));
      this.createTabletScenes({uri}, {uri}).catch((error) => {
        throw logger.throwing(error, "RootContainer.createTabletScenes", LogLevel.WARN);
      });
      Orientation.lockToLandscape();
    }

    setJSExceptionHandler(this.globalJSErrorHandler, true);
    setNativeExceptionHandler(this.globalNativeErrorHandler);
  }

  public componentDidMount(): void {
    this.setState({
      stackNavigator: this.getStackNavigator(),
      reactNativeAppState: ReactNativeAppState.currentState
    });

    MobileDeviceManager.isSupported()
        .then((supported: boolean) => logger.info(() => `MDM support verification result: ${supported}`))
        .catch((error: any) => logger.info(() => `MDM support verification error: ${error.message}`));

    initDependencyInjection();

    // Initialize the application state, including the IoC container and redux state.

    this.isReloadingApp = this.props.settings && this.props.settings.appStatus === AppStatus.Ready;

    logger.debug(() => "Starting app settings initialization");
    if (!this.isReloadingApp) {
      this.props.initAppSettings(Theme.isTablet);
    }

    ReactNativeAppState.addEventListener("change", this.handleAppStateChange);

    KeyEvent.onKeyUpListener(this.sendKeyEvent.bind(this));
    this.keyboardDidShowListener = Keyboard.addListener("keyboardDidShow",
        () => KeyEvent.removeKeyUpListener());
    this.keyboardDidHideListener = Keyboard.addListener("keyboardDidHide",
        () => KeyEvent.onKeyUpListener(this.sendKeyEvent.bind(this)));
  }

  public checkSelfCheckoutConfig(prevProps: Props): void {
    this.selfCheckoutConfigError = this.selfCheckoutConfigShouldError();
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    this.currentScreen = getCurrentRouteNameWithNavigationRef();
    if (!prevProps.settings.configurationManager && this.props.settings.configurationManager) {

      const functionalBehaviorsConfig = this.props.settings.configurationManager.getFunctionalBehaviorValues();
      try {
        this.selfCheckoutModeConfigEnabled = selfCheckoutConfigured(this.props);
      } catch (configError) {
        if (this.props.uiState.mode !== UI_MODE_FATAL_ERROR) {
          this.handleSCOConfigError(configError);
        }
      }

      const storeOperationButton = functionalBehaviorsConfig.storeOperationsBehaviors &&
          functionalBehaviorsConfig.storeOperationsBehaviors.storeOperationsHamburgerButton.visible;
      this.storeOperationButtonValue = storeOperationButton;

      this.landingPageConfigEnabled = isLandingVisible(this.props.settings.configurationManager);
    }

    if (prevProps.settings.configurationManager) {
      this.checkSelfCheckoutConfig(prevProps);
    }

    const userSessionUnattendedChanged: boolean = prevProps.businessState && this.props.businessState &&
                                                  prevProps.businessState.stateValues &&
                                                  this.props.businessState.stateValues &&
                                                  prevProps.businessState.stateValues.get("UserSession.unattended") !==
                                                  this.props.businessState.stateValues.get("UserSession.unattended");

    if (this.props.settings.appStatus === AppStatus.Ready || userSessionUnattendedChanged) {
      this.handleSceneChange(prevProps, userSessionUnattendedChanged);
    }

    if (this.props.settings.diContainer && !this.props.countries.countries) {
      this.props.loadCountries();
    }
    if (this.props.settings.diContainer && !this.props.i18nLocation) {
      this.props.loadI18nLocation();
    }
    this.handleTerminalStateSync(prevProps, prevState);

    this.handleTerminalPendingUpdate(prevProps);
    if (clientelingAppUrl(this.props.settings.configurationManager) && !this.state.isExternalClientelingAppRequestInProgress) {
      this.callExternalCustomerAppToFindCustomer();
    }
  }

  public componentWillUnmount(): void {
    // There is, currently, no saga to tear-down components, so this is done here to clean-up.
    // If tear-down becomes more complex, then consider moving this into a saga, unless it is too late at this point to
    // process this in a saga.
//    const diContainer: Container = this.props.components.diContainer;
//    logger.debug(() => `In componentWillUnmount, DI container  ${(!!diContainer) ? "is" : "is not"} available.`);
//    if (diContainer) {
//      logger.info(() => `Tearing-down the DI container.`);
//      tearDownDiContainer(diContainer);
//    }

    ReactNativeAppState.removeEventListener("change", this.handleAppStateChange);

    KeyEvent.removeKeyUpListener();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  public componentWillReceiveProps(nextProps: Props): Promise<void> {
    this.currentScreen = getCurrentRouteNameWithNavigationRef();
    // tslint:disable-next-line:max-line-length
    // logger.trace(() => `In componentWillReceiveProps, nextProps: ${JSON.stringify(nextProps)}, current props: ${JSON.stringify(this.props)}`);

    // Currently, UI_MODE_FATAL_ERROR is only being reported in sagas/settings.ts & sagas/businessState.ts and using
    // updateUiMode.failure action, we set fatal error to state.mode. Prior to this, no failure was
    // expected during app initialization or normal operation of the app.
    if (nextProps.uiState.mode === UI_MODE_FATAL_ERROR) {
      navigate("fatalError");
      return;
    }

    this.handleAppInitializationStateChange(nextProps);

    this.handleLocale(nextProps);

    if (nextProps.settings.uiStyling && !this.props.settings.uiStyling) {
      this.props.onUiUpdate(nextProps.settings.uiStyling.styles);
      this.createScenes(nextProps.settings.uiStyling.appLogo, nextProps.settings.uiStyling.loginLogo).catch((error) => {
        throw logger.throwing(error, "RootContainer.createScenes", LogLevel.WARN);
      });

      this.setState({uiStyleUpdate: true});
    }

    // It refresh the main screen forcing it to re-render and update the components based on the current state. As an
    // example, the logout button has to be hidden when a transaction starts
    if (nextProps.uiState.logicalState !== this.props.uiState.logicalState) {
      setTimeout(() => {
        if (this.currentScreen === "main") {
          refreshScreenWithNavigationRef("main");
        }
      }, 100);
    }

  }

  public render(): JSX.Element {
    return (
      <SideMenu
          menu={this.getMenuComponent()}
          menuPosition="left"
          isOpen={this.state.isOpen}
          openMenuOffset={sideMenuWidth * (Theme.isTablet ? 0.4 : 1)}
          disableGestures={this.disableGestureOrClick()}
          onChange={this.updateMenuState}>
        {this.state.stackNavigator}
        {<ModalContainer/>}
      </SideMenu>
    );
  }

  private updateMenuState = (isOpen: boolean): void => {
    this.setState({ isOpen });
  }

  private disableGestureOrClick(): boolean {
    return !this.state.loggedIn || (this.currentScreen !== "main" &&
        this.currentScreen !== "landing") || this.requiredSalesPersonNotYetProvided();
  }

  private requiredSalesPersonNotYetProvided(): boolean {
    const functionalBehaviors = this.props.settings.configurationManager &&
        this.props.settings.configurationManager.getFunctionalBehaviorValues();
    const allowSalespersonPromptAtTransactionStartToBeSkippedConfigValue =
        functionalBehaviors?.salespersonBehaviors?.allowSalespersonPromptAtTransactionStartToBeSkipped;
    const promptForSalespersonAtTransactionStart =
        functionalBehaviors?.salespersonBehaviors?.promptForSalespersonAtTransactionStart;
    return this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION &&
        !allowSalespersonPromptAtTransactionStartToBeSkippedConfigValue &&
        promptForSalespersonAtTransactionStart &&
        !this.props.businessState.stateValues.get("transaction.salesperson");
  }

  private async createScenes(app: any, login: any): Promise<void> {
    const appLogo =  (app && app.uri) ? app : {uri: Platform.OS === "android" ? "asset:/ss_aptos.png" : "ss_aptos.png"};

    const loginLogo = (login && login.uri) ? login : {uri: Platform.OS === "android" ? "asset:/ss_aptos.png" : "ss_aptos.png"};

    // Re-create the page styles using the new default styles
    if (!Theme.isTablet) {
      this.styles = Theme.getStyles(phoneStyles(deviceScreen));
      await this.createPhoneScenes(appLogo, loginLogo);
    } else {
      this.styles = Theme.getStyles(tabletStyles(deviceScreen));
      await this.createTabletScenes(appLogo, loginLogo);
    }

    this.setState({ stackNavigator: this.getStackNavigator() });
  }

  private renderSettingBackButton(navigation: NativeStackNavigationProp<StackNavigatorParams>): JSX.Element {
    if (!this.state.loggedIn) {
      return <View/>;
    } else {
      return this.renderBackButton(navigation);
    }
  }

  private renderTitle(titleToRender: string): JSX.Element {
    return (
      <Text style={this.styles.navigationBarTitle} adjustsFontSizeToFit={true} numberOfLines={1}>{titleToRender}</Text>
    );
  }

  private renderBackButton(navigation: NativeStackNavigationProp<StackNavigatorParams>): JSX.Element {
    return (
      <TouchableOpacity style={[this.styles.navigationBarLeft]} onPress={() => navigation.pop()}>
        <View style={this.styles.navigationBarLeftIcon}>
          <VectorIcon
            name="Back"
            fill={this.styles.backNavigationItem.color}
            height={this.styles.navigationBarLeftIcon.fontSize}
          />
        </View>
      </TouchableOpacity>
    );
  }

  private renderBackButtonWithText(navigation: NativeStackNavigationProp<StackNavigatorParams>, title: string,
                                   scene?: keyof StackNavigatorParams): JSX.Element {
    return (
      <TouchableOpacity
        style={[this.styles.navigationBarLeft, this.styles.navigationBarLeftButton]}
        onPress={() => scene ? navigation.dispatch(popTo(scene)) : navigation.pop()}
      >
        <View style={this.styles.navigationBarLeftIcon}>
          <VectorIcon
            name="Back"
            fill={this.styles.backNavigationItem.color}
            height={this.styles.navigationBarLeftIcon.fontSize}
          />
        </View>
        <Text style={this.styles.backNavigationItem}>{title}</Text>
      </TouchableOpacity>
    );
  }

  private async createPhoneScenes(appLogo: { uri: string }, loginLogo: { uri: string }): Promise<void> {
    this.scenes = [
      <Stack.Screen name="init" component={InitScreen}/>,
      <Stack.Screen name="tenantSettings" component={TenantSettingsScreen}/>,
      <Stack.Screen name="downloadProgress" component={DownloadProgressScreen}/>,
      <Stack.Screen name="creatingCouchbaseIndexes" component={CreatingCouchbaseIndexesScreen}/>,
      <Stack.Screen name="terminalSettings" component={TerminalSettingsScreen}/>,
      <Stack.Screen name="terminalConflict" component={TerminalConflictScreen}/>,
      <Stack.Screen name="login" component={LoginScreen}
        initialParams={{loginLogo}}
      />,
      <Stack.Screen name="landing" component={LandingScreen}
        initialParams={{
          appLogo,
          isCustomerSearchAvailable: () => this.isCustomerSearchAvailable,
          isOrderInquiryEnabled: () => this.isOrderInquiryEnabled,
          isGiftCardEnabled: () => (this.isGiftCardAvailable || this.isValueCertAvailable),
          isStoreOperationsEnabled: () => !!this.storeOperationButtonValue,
          onMenuToggle: this.toggle,
          onScreenAction: this.onScreenAction
        }}
      />,
      <Stack.Screen name="main" component={MainScreen}
        initialParams={{
          appLogo,
          onMenuToggle: this.toggle
        }}
      />,
      <Stack.Screen name="scan" component={CameraScannerScreenWrapper}/>,
      <Stack.Screen name="zeroPriced" component={ZeroPricedScreen}/>,
      <Stack.Screen name="notFound" component={NotFoundScreen} initialParams={{}}/>,
      <Stack.Screen name="notOnFile" component={NotOnFileScreen}/>,
      <Stack.Screen name="quantity" component={QuantityScreen}/>,
      <Stack.Screen name="preferenceScreen" component={PreferencesScreen}/>,
      <Stack.Screen name="price" component={PriceScreen}/>,
      <Stack.Screen name="customer" component={CustomerSearchScreen}/>,
      <Stack.Screen name="customerList" component={CustomerResultsScreen}/>,
      <Stack.Screen name="customerCreate" component={CustomerCreateScreen}/>,
      <Stack.Screen name="customerNip" component={CustomerNipScreen}/>,
      <Stack.Screen name="customerTaxInvoice" component={CustomerTaxInvoiceScreen}/>,
      <Stack.Screen name="customerUpdate" component={CustomerUpdateScreen}/>,
      <Stack.Screen name="customerDisplay" component={CustomerDisplayScreen}/>,
      <Stack.Screen name="loyaltyEnrollment" component={LoyaltyEnrollmentScreen}/>,
      <Stack.Screen name="textScreen" component={TextScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerBackVisible: false,
          headerLeft: () => this.renderBackButton(navigation),
          headerTitle: () => <View/>
        })}
      />,
      <Stack.Screen name="phoneCountryCode" component={PhoneCountryCodeScreen}/>,
      <Stack.Screen name="payment" component={PaymentScreen} initialParams={{}}/>,
      <Stack.Screen name="signatureCapture" component={SignatureCapture}/>,
      <Stack.Screen name="receiptSummary" component={ReceiptSummaryScreen}/>,
      <Stack.Screen name="receiptCategoryChoice" component={ReceiptCategoryChoiceScreen}/>,
      <Stack.Screen name="receiptEmailForm" component={ReceiptEmailFormScreen}/>,
      <Stack.Screen name="receiptPhoneNumberForm" component={ReceiptPhoneNumberFormScreen}/>,
      <Stack.Screen name="receiptPrinterChoice" component={ReceiptPrinterChoiceScreen}/>,
      <Stack.Screen name="offlineAuthorization" component={OfflineAuthorizationScreen}/>,
      <Stack.Screen name="tenderReference" component={TenderPromptRulesScreen}/>,
      <Stack.Screen name="nonIntegratedAuthorization" component={NonIntegratedPaymentScreen}/>,
      <Stack.Screen name="redeem" component={CardRedeemScreen}/>,
      <Stack.Screen name="reprintReceipt" component={ReprintReceiptScreen}/>,
      <Stack.Screen name="information" component={InformationScreen}/>,
      <Stack.Screen name="changePassword" component={ChangePasswordScreen} initialParams={{}}/>,
      <Stack.Screen name="balanceInquiry" component={BalanceInquiryScreen}/>,
      <Stack.Screen name="productInquiry" component={ProductInquiryScreen}/>,
      <Stack.Screen name="orderInquiry" component={OrderInquiryScreen} initialParams={{}}/>,
      <Stack.Screen name="orderInquiryDetail" component={OrderInquiryDetailScreen}/>,
      <Stack.Screen name="productInquiryDetail" component={ProductInquiryDetailScreen} initialParams={{}}/>,
      <Stack.Screen name="nonMerch" component={NonMerchScreen}/>,
      <Stack.Screen name="salesHistory" component={SalesHistoryScreen} initialParams={{}}/>,
      <Stack.Screen name="transactionHistory" component={TransactionHistoryScreen}/>,
      <Stack.Screen name="fatalError" component={FatalErrorScreen}/>,
      <Stack.Screen name="product" component={ProductScreen}/>,
      <Stack.Screen name="taxActionPanel" component={TaxActionPanelScreen}/>,
      <Stack.Screen name="taxOverrideScreen" component={TaxOverrideScreen}/>,
      <Stack.Screen name="assignSalesperson" component={AssignSalespersonScreen}/>,
      <Stack.Screen name="coupon" component={CouponScreen}/>,
      <Stack.Screen name="issueGiftCard" component={IssueGiftCardScreen}/>,
      <Stack.Screen name="issueGiftCertificate" component={IssueGiftCertificateScreen}/>,
      <Stack.Screen name="tenderChange" component={TenderChangeScreen}/>,
      <Stack.Screen name="reasonCodeList" component={ReasonCodeListScreen}/>,
      <Stack.Screen name="attributeDefList" component={AttributeGroupCodeScreen}/>,
      <Stack.Screen name="attributeEditor" component={CustomerAttributeEditorScreen}/>,
      <Stack.Screen name="addressSearch" component={AddressSearchScreen}/>,
      <Stack.Screen name="comments" component={CommentsScreen}/>,
      <Stack.Screen name="comment" component={FreeTextCommentScreen}/>,
      <Stack.Screen name="orderPickupDetailsConfirmation" component={OrderPickupDetails}/>,
      <Stack.Screen name="orderDeliveryAddressConfirmation" component={OrderDeliveryAddress}/>,
      <Stack.Screen name="discountTypeSelection" component={DiscountTypeSelectionScreen}/>,
      <Stack.Screen name="discountScreen" component={DiscountScreen}/>,
      <Stack.Screen name="fastDiscountScreen" component={FastDiscountScreen}/>,
      <Stack.Screen name="fastDiscountSelection" component={FastDiscountSelectionScreen}/>,
      <Stack.Screen name="bagFee" component={BagFeeScreen}/>,
      <Stack.Screen name="donation" component={DonationScreen}/>,
      <Stack.Screen name="resumeSuspendedTransactions" component={SuspendedTransactionsScreen}/>,
      <Stack.Screen name="stoppedItem" component={StoppedItemScreen}/>,
      <Stack.Screen name="taxExempt" component={TaxExemptScreen}/>,
      <Stack.Screen name="storeOperations" component={StoreOperationsScreen}/>,
      <Stack.Screen name="tenderExchange" component={TenderExchangeScreen}/>,
      <Stack.Screen name="fiscalConfigValidationError" component={FiscalConfigValidationError}/>,
      <Stack.Screen name="fiscalPrinter" component={FiscalPrinter}/>,
      <Stack.Screen name="fiscalPrinterError" component={FiscalPrinterError} initialParams={{}}/>,
      <Stack.Screen name="fiscalPrinterReceiptError" component={FiscalPrinterReceiptErrorScreen} initialParams={{}}/>,
      <Stack.Screen name="fiscalPrinterEnterDocument" component={FiscalPrinterEnterDocumentNumberScreen} initialParams={{}}/>,
      <Stack.Screen name="fiscalSyncReportError" component={FiscalSyncReportError}/>,
      <Stack.Screen name="tillManagement" component={TillManagementScreen}/>,
      <Stack.Screen name="scanDrawer" component={ScanDrawerScreen}/>,
      <Stack.Screen name="scanLottery" component={ScanLotteryScreen}/>,
      <Stack.Screen name="preConfiguredDiscounts" component={PreConfiguredDiscountsScreen}/>,
      <Stack.Screen name="tillDetail" component={TillDetailScreen}/>,
      <Stack.Screen name="currencyCalculator" component={CurrencyCalculatorScreen}/>,
      <Stack.Screen name="tillSuccess" component={TillSuccessScreen}
        options={{
          headerShown: true,
          headerBackVisible: false,
          headerLeft: () => <View/>,
          headerRight: () => <View/>,
          headerTitle: () => <View/>,
          headerStyle: this.styles.mainNavigationBar
        }}
      />,
      <Stack.Screen name="openCloseTerminal" component={OpenCloseTerminalScreen}/>,
      <Stack.Screen name="loyaltyVoucher" component={LoyaltyVoucherScreen}/>,
      <Stack.Screen name="varianceReason" component={TillVarianceReasonScreen}/>,
      <Stack.Screen name="loyaltyDiscount" component={LoyaltyDiscountScreen}/>,
      <Stack.Screen name="loyaltyMembershipDetails" component={LoyaltyMembershipDetailScreen}/>,
      <Stack.Screen name="paidDetail" component={PaidDetailScreen}/>,
      <Stack.Screen name="returnTransaction" component={ReturnWithTransactionScreen} initialParams={{}}/>,
      <Stack.Screen name="returnWithTransactionSearchResult" component={ReturnWithTransactionSearchResultScreen}/>,
      <Stack.Screen name="returnDetails" component={ReturnDetailsScreen} initialParams={{}}/>,
      <Stack.Screen name="returnSearch" component={ReturnSearchScreen}/>,
      <Stack.Screen name="taxFree" component={TaxFreeScreen} initialParams={{}}/>,
      <Stack.Screen name="genericPrinter" component={GenericPrinterScreenWrapper}/>,
      <Stack.Screen name="basketActions" component={BasketActionsScreen}/>,
      <Stack.Screen name="shippingMethod" component={ShippingMethodScreen}/>,
      <Stack.Screen name="findNearbyLocation" component={FindNearbyScreen}/>,
      <Stack.Screen name="unavailableQuantities" component={UnavailableQuantitiesDetail}/>,
      <Stack.Screen name="itemSubscription" component={ItemSubscriptionScreen}/>,
      <Stack.Screen name="subscriptionAuthorization" component={SubscriptionsAuthorizationScreen} initialParams={{}}/>,
      <Stack.Screen name="voidableErrorScreen" component={VoidableErrorScreen} initialParams={{}}/>,
      <Stack.Screen name="storeOperationDetails" component={StoreOperationDetailsScreen}/>,
      <Stack.Screen name="valueCertificate" component={ValueCertificateScreen} initialParams={{appLogo}}/>,
      <Stack.Screen name="tillVariance" component={TillVarianceScreen} />
    ];
  }

  private async createTabletScenes(appLogo: any, loginLogo: any): Promise<void> {
    this.scenes = [
      <Stack.Screen name="init" component={InitScreen} />,
      <Stack.Screen name="tenantSettings" component={TenantSettingsScreen}/>,
      <Stack.Screen name="terminalSettings" component={TerminalSettingsScreen}/>,
      <Stack.Screen name="terminalConflict" component={TerminalConflictScreen}/>,
      <Stack.Screen name="downloadProgress" component={DownloadProgressScreen}/>,
      <Stack.Screen name="creatingCouchbaseIndexes" component={CreatingCouchbaseIndexesScreen}/>,
      <Stack.Screen name="login" component={LoginScreen}
        initialParams={{
          loginLogo
        }}
      />,
      <Stack.Screen name="landing" component={LandingScreen}
        initialParams={{
          appLogo,
          isCustomerSearchAvailable: () => this.isCustomerSearchAvailable,
          isOrderInquiryEnabled: () => this.isOrderInquiryEnabled,
          isGiftCardEnabled: () => (this.isGiftCardAvailable || this.isValueCertAvailable),
          isStoreOperationsEnabled: () => !!this.storeOperationButtonValue,
          onMenuToggle: this.toggle,
          onScreenAction: this.onScreenAction
        }}
      />,
      <Stack.Screen name="main" component={MainScreen}
        initialParams={{
          appLogo,
          onMenuToggle: this.toggle
        }}
      />,
      <Stack.Screen name="scan" component={CameraScannerScreenWrapper}/>,
      <Stack.Screen name="zeroPriced" component={ZeroPricedScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: () => this.renderTitle(I18n.t("zeroPriced")),
          headerLeft: () => this.renderBackButtonWithText(navigation, I18n.t("basket"), "main"),
          headerRight: () => <View/>,
          headerBackVisible: false
        })}
      />,
      <Stack.Screen name="notOnFile" component={NotOnFileScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: () => this.renderTitle(I18n.t("itemNotOnFile")),
          headerLeft: () => this.renderBackButtonWithText(navigation, I18n.t("basket"), "main"),
          headerRight: () => <View/>,
          headerBackVisible: false
        })}
      />,
      <Stack.Screen name="customer" component={CustomerSearchScreen}/>,
      <Stack.Screen name="customerList" component={CustomerResultsScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: () => this.renderTitle(I18n.t("customerSearch")),
          headerLeft: () => this.renderBackButtonWithText(navigation, I18n.t("basket"), "main"),
          headerRight: () => <View/>,
          headerBackVisible: false
        })}
      />,
      <Stack.Screen name="preferenceScreen" component={PreferencesScreen}/>,
      <Stack.Screen name="price" component={PriceScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: () => this.renderTitle(
              (this.props.businessState.error as QualificationError)
              .localizableMessage.i18nCode === SSF_ITEM_REQUIRES_PRICE_ENTRY ?
              I18n.t("price") : I18n.t("overridePrice")
          ),
          headerLeft: () => this.renderBackButtonWithText(navigation, I18n.t("basket"), "main"),
          headerRight: () => <View/>,
          headerBackVisible: false
        })}
      />,
      <Stack.Screen name="customerCreate" component={CustomerCreateScreen}/>,
      <Stack.Screen name="customerNip" component={CustomerNipScreen}/>,
      <Stack.Screen name="customerTaxInvoice" component={CustomerTaxInvoiceScreen}/>,
      <Stack.Screen name="customerUpdate" component={CustomerUpdateScreen}/>,
      <Stack.Screen name="customerDisplay" component={CustomerDisplayScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: () => this.renderTitle(I18n.t("customerProfile")),
          headerLeft: () => this.renderBackButtonWithText(navigation, I18n.t("basket"), "main"),
          headerRight: () => <View/>,
          headerBackVisible: false
        })}
      />,
      <Stack.Screen name="customerPreviewDisplay" component={CustomerDisplayScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: () => this.renderTitle(I18n.t("customerProfile")),
          headerLeft: () => this.renderBackButtonWithText(navigation, I18n.t("searchResults"), "customer"),
          headerRight: () => <View/>,
          headerBackVisible: false
        })}
      />,
      <Stack.Screen name="loyaltyEnrollment" component={LoyaltyEnrollmentScreen}/>,
      <Stack.Screen name="orderPickupDetailsConfirmation" component={OrderPickupDetails}/>,
      <Stack.Screen name="orderDeliveryAddressConfirmation" component={OrderDeliveryAddress}/>,
      <Stack.Screen name="textScreen" component={TextScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerLeft: () => this.renderBackButton(navigation),
          headerRight: () => <View/>,
          headerBackVisible: false,
          headerTitle: () => <View/>
        })}
      />,
      <Stack.Screen name="addressSearch" component={AddressSearchScreen}/>,
      <Stack.Screen name="phoneCountryCode" component={PhoneCountryCodeScreen}/>,
      <Stack.Screen name="payment" component={PaymentScreen} initialParams={{appLogo}}/>,
      <Stack.Screen name="signatureCapture" component={SignatureCapture}/>,
      <Stack.Screen name="receiptSummary" component={ReceiptSummaryScreen} initialParams={{appLogo}}/>,
      <Stack.Screen name="reprintReceipt" component={ReprintReceiptScreen}/>,
      <Stack.Screen name="information" component={InformationScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: () => this.renderTitle(I18n.t("information")),
          headerLeft: () => this.renderBackButtonWithText(navigation, I18n.t("basket"), "main"),
          headerRight: () => <View/>,
          headerBackVisible: false
        })}
      />,
      <Stack.Screen name="changePassword" component={ChangePasswordScreen} initialParams={{}}/>,
      <Stack.Screen name="balanceInquiry" component={BalanceInquiryScreen}/>,
      <Stack.Screen name="orderInquiry" component={OrderInquiryScreen} initialParams={{}}/>,
      <Stack.Screen name="orderInquiryDetail" component={OrderInquiryDetailScreen}/>,
      <Stack.Screen name="productInquiry" component={ProductInquiryScreen}/>,
      <Stack.Screen name="productInquiryDetail" component={ProductInquiryDetailScreen} initialParams={{}}/>,
      <Stack.Screen name="nonIntegratedAuthorization" component={NonIntegratedPaymentScreen}
        options={{
          headerShown: true,
          headerTitle: () => this.renderTitle(I18n.t("nonIntegratedAuthorization")),
          headerLeft: () => <View/>,
          headerRight: () => <View/>,
          headerBackVisible: false
        }}
      />,
      <Stack.Screen name="salesHistory" component={SalesHistoryScreen} initialParams={{}}/>,
      <Stack.Screen name="transactionHistory" component={TransactionHistoryScreen}/>,
      <Stack.Screen name="fatalError" component={FatalErrorScreen}/>,
      <Stack.Screen name="reasonCodeList" component={ReasonCodeListScreen}/>,
      <Stack.Screen name="attributeDefList" component={AttributeGroupCodeScreen}/>,
      <Stack.Screen name="attributeEditor" component={CustomerAttributeEditorScreen}/>,
      <Stack.Screen name="resumeSuspendedTransactions" component={SuspendedTransactionsScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: () => this.renderTitle(I18n.t("resumeSuspendedTransactions")),
          headerLeft: () => this.renderBackButtonWithText(navigation, I18n.t("basket"), "main"),
          headerRight: () => <View/>,
          headerBackVisible: false
        })}
      />,
      <Stack.Screen name="bagFee" component={BagFeeScreen} initialParams={{appLogo}}/>,
      <Stack.Screen name="donation" component={DonationScreen}/>,
      <Stack.Screen name="scoMainScreen" component={SCOMainScreen}/>,
      <Stack.Screen name="nonMerch" component={NonMerchScreen}/>,
      <Stack.Screen name="storeOperations" component={StoreOperationsScreen}/>,
      <Stack.Screen name="tenderExchange" component={TenderExchangeScreen}/>,
      <Stack.Screen name="fiscalConfigValidationError" component={FiscalConfigValidationError}/>,
      <Stack.Screen name="fiscalPrinter" component={FiscalPrinter}/>,
      <Stack.Screen name="fiscalPrinterError" component={FiscalPrinterError} initialParams={{}}/>,
      <Stack.Screen name="fiscalPrinterReceiptError" component={FiscalPrinterReceiptErrorScreen} initialParams={{}}/>,
      <Stack.Screen name="fiscalPrinterEnterDocument" component={FiscalPrinterEnterDocumentNumberScreen} initialParams={{}}/>,
      <Stack.Screen name="fiscalSyncReportError" component={FiscalSyncReportError}/>,
      <Stack.Screen name="tillManagement" component={TillManagementScreen}/>,
      <Stack.Screen name="scanDrawer" component={ScanDrawerScreen}/>,
      <Stack.Screen name="scanLottery" component={ScanLotteryScreen}/>,
      <Stack.Screen name="tillDetail" component={TillDetailScreen}/>,
      <Stack.Screen name="currencyCalculator" component={CurrencyCalculatorScreen}/>,
      <Stack.Screen name="tillSuccess" component={TillSuccessScreen}/>,
      <Stack.Screen name="openCloseTerminal" component={OpenCloseTerminalScreen}/>,
      <Stack.Screen name="loyaltyVoucher" component={LoyaltyVoucherScreen}/>,
      <Stack.Screen name="loyaltyMembershipDetails" component={LoyaltyMembershipDetailScreen}/>,
      <Stack.Screen name="varianceReason" component={TillVarianceReasonScreen}/>,
      <Stack.Screen name="paidDetail" component={PaidDetailScreen}/>,
      <Stack.Screen name="returnTransaction" component={ReturnWithTransactionScreen} initialParams={{}}/>,
      <Stack.Screen name="returnWithTransactionSearchResult" component={ReturnWithTransactionSearchResultScreen}/>,
      <Stack.Screen name="returnDetails" component={ReturnDetailsScreen} initialParams={{}}/>,
      <Stack.Screen name="returnSearch" component={ReturnSearchScreen}/>,
      <Stack.Screen name="receiptPrinterChoice" component={ReceiptPrinterChoiceScreen}/>,
      <Stack.Screen name="taxFree" component={TaxFreeScreen} initialParams={{}}/>,
      <Stack.Screen name="genericPrinter" component={GenericPrinterScreenWrapper}/>,
      <Stack.Screen name="shippingMethod" component={ShippingMethodScreen}/>,
      <Stack.Screen name="findNearbyLocation" component={FindNearbyScreen}/>,
      <Stack.Screen name="unavailableQuantities" component={UnavailableQuantitiesDetail}/>,
      <Stack.Screen name="itemSubscription" component={ItemSubscriptionScreen}/>,
      <Stack.Screen name="subscriptionAuthorization" component={SubscriptionsAuthorizationScreen} initialParams={{}}/>,
      <Stack.Screen name="voidableErrorScreen" component={VoidableErrorScreen} initialParams={{}}/>,
      <Stack.Screen name="storeOperationDetails" component={StoreOperationDetailsScreen}/>,
      <Stack.Screen name="valueCertificate" component={ValueCertificateScreen} initialParams={{appLogo}}/>,
      <Stack.Screen name="tillVariance" component={TillVarianceScreen} />,
      <Stack.Screen name="comment" component={FreeTextCommentScreen}/>
    ];
  }

  private getStackNavigator(): JSX.Element {
    return (
        <Stack.Navigator
          initialRouteName="init"
          screenOptions={{
            gestureEnabled: false,
            contentStyle: this.styles.fill,
            headerShown: false,
            headerStyle: this.styles.navigationBar,
            headerTitleStyle: this.styles.navigationBarTitle,
            headerShadowVisible: false,
            headerTitleAlign: "center"
          }}
        >
          {...this.scenes}
        </Stack.Navigator>
    );
  }

  private handleAppInitializationStateChange(nextProps: Props): void {
    const appStatus = this.props.settings.appStatus;
    const nextAppStatus = nextProps.settings.appStatus;

    if (nextAppStatus !== appStatus) {
      logger.debug(() => `App status transition: ${appStatus} -> ${nextAppStatus}`);

      if (nextAppStatus === AppStatus.Ready) {
        getCustomerAttributes(nextProps.settings.diContainer,
            nextProps.settings.deviceIdentity.retailLocationId,
            nextProps.settings.primaryLanguage,
            [nextProps.settings.primaryLanguage]
        ).catch((error) => {
            logger.warn(() => `in RootContainer, getCustomerAttributes failed with error ${error.message}`);
        });

        getLoyaltyReferences(nextProps.settings.diContainer,
            nextProps.settings.deviceIdentity,
            nextProps.settings.retailLocationCurrency,
            nextProps.settings.primaryLanguage,
            [nextProps.settings.primaryLanguage]
        ).then(() => {
          nextProps.loadRewardReasons();
        }).catch((error) => {
            logger.warn(() => `in RootContainer, getLoyaltyReferences failed with error ${error.message}`);
        });

        getRetailLocationUpdates(nextProps.settings.diContainer, nextProps.settings.deviceIdentity.retailLocationId)
            .catch((error) => {
              logger.warn(() => `in RootContainer, getRetailLocationUpdates failed with error ${error.message}`);
            });

        const donationDefinition = getDonationDefinition(nextProps.settings.configurationManager);
        if (donationDefinition) {
          this.props.loadAppResource(donationDefinition.donationImage, Theme.isTablet);
        }
        const landingDefinition = getLandingDefinition(nextProps.settings.configurationManager);
        if (landingDefinition && landingDefinition.landingPageButtonRows &&
            landingDefinition.landingPageButtonRows.length > 0) {
          landingDefinition.landingPageButtonRows.forEach(landingPageButtonRow => {
            if (landingPageButtonRow.imageName) {
              this.props.loadAppResource(landingPageButtonRow.imageName, Theme.isTablet);
            }
          })
        }
      }

      switch (nextAppStatus) {
        case AppStatus.PendingTenantSettings:
          navigate("tenantSettings");
          break;
        case AppStatus.PendingTerminalSettings:
          navigate("terminalSettings");
          break;
        case AppStatus.PendingDatabaseDownload:
          navigate("downloadProgress");
          break;
        case AppStatus.PendingCouchabaseIndexesCreate:
          navigate("creatingCouchbaseIndexes");
          break;
        case AppStatus.ClearLastScreen:
          dispatchWithNavigationRef(pop());
          break;
        default:
          break;
      }
    }
  }

  private applicationInSelfCheckout(): boolean {
    return selfCheckoutModeActive(this.props);
  }

  private applicationHasUnattendedOperator(): boolean {
    return this.props.businessState &&
        this.props.businessState.stateValues &&
        !!this.props.businessState.stateValues.get("UserSession.unattendedOperator");
  }

  private selfCheckoutConfigShouldError(): boolean {
    const applicationHasUnattendedOperator = this.applicationHasUnattendedOperator();

    return (this.selfCheckoutModeConfigEnabled && (!Theme.isTablet || applicationHasUnattendedOperator !== undefined &&
        !applicationHasUnattendedOperator) && !this.props.businessState.inProgress) ||
        !this.selfCheckoutModeConfigEnabled && applicationHasUnattendedOperator;
  }

  // tslint:disable-next-line:cyclomatic-complexity
  private handleSceneChange(prevProps: Props, userSessionUnattendedChanged: boolean): void {
    const applicationInSelfCheckout = this.applicationInSelfCheckout();

    if (this.selfCheckoutConfigError) {
      if (this.allowToContinueAfterConfigs) {
        this.allowToContinueAfterConfigs = false;
        this.handleSCOConfigErrorPopUp();
      }
    } else if (prevProps.uiState.logicalState === this.props.uiState.logicalState && userSessionUnattendedChanged) {
      logger.debug(() => `UserMode changed from ` +
                         `${prevProps.businessState.stateValues.get("UserSession.unattended")} to ` +
                         `${this.props.businessState.stateValues.get("UserSession.unattended")}`);

      if (applicationInSelfCheckout) {
        this.setState({ isOpen: false });

        if (this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE) {
          this.props.setLastSCOSceneKey(SCOScreenKeys.ThankYou);
        }
      }

      this.clearSelectedItemLinesIfNecessary();

      resetStackWithNavigationRef("init", {
        autoMoveSceneKey: applicationInSelfCheckout ? "scoMainScreen" : "main"
      });
    } else {
      if (this.props.uiState.logicalState && !prevProps.uiState.logicalState) {
        logger.debug(() => "Retrieval of the business state has finished.");
        logger.debug(() => `Logical state is being set to ${this.props.uiState.logicalState}`);

        if (this.props.uiState.logicalState === LOGGED_OFF) {
          logger.debug(() => "Showing login scene.");

          this.setState({loggedIn: false, isOpen: false});

          this.moveToNewScene(applicationInSelfCheckout, () => navigate("scoMainScreen"), () => navigate("login"));
        } else {
          logger.debug(() => "Showing main scene.");

          this.setState({loggedIn: true});

          this.moveToNewScene(applicationInSelfCheckout, () => navigate("scoMainScreen"),
              () => navigate("main", { startup: true }));
        }
      } else if ((this.props.uiState.logicalState === LOGGED_OFF && prevProps.uiState.logicalState !== LOGGED_OFF) ||
          (this.isReloadingApp && this.props.uiState.logicalState && this.props.uiState.logicalState === LOGGED_OFF)) {
        this.props.checkIsAppVersionBlocked();
        logger.debug(() => `Logical state is being updated to ${this.props.uiState.logicalState}`);
        logger.debug(() => "Showing login scene.");

        this.setState({loggedIn: false, isOpen: false});

        this.moveToNewScene(applicationInSelfCheckout, () => navigate("scoMainScreen"),
            () => !this.isReloadingApp ?
                resetStackWithNavigationRef("init", { autoMoveSceneKey: "login" }) : navigate("login"));

        this.isReloadingApp = false;
      } else if ((this.props.uiState.logicalState !== LOGGED_OFF && prevProps.uiState.logicalState === LOGGED_OFF) ||
          (this.isReloadingApp && this.props.uiState.logicalState && this.props.uiState.logicalState !== LOGGED_OFF)) {
        logger.debug(() => `Logical state is being updated to ${this.props.uiState.logicalState}`);
        logger.debug(() => "Showing main scene.");

        this.setState({loggedIn: true});

        // isReloadingApp is used to properly handle the workflow when the application is brought back to the
        // foreground (as it happens after pressing the back button due to an error in Android). In those scenarios, the
        // logicalState hasn't changed because it is not a clean start and it is used to show the main screen which
        // should be push into the stack after the init screen and not replace it.
        this.moveToNewScene(applicationInSelfCheckout, () => navigate("scoMainScreen"),
            () => {
              if (!this.isReloadingApp) {
                dispatchWithNavigationRef(replace("main"));
              } else {
                navigate("main");
              }
              if (this.landingPageConfigEnabled) {
                navigate("landing");
              }
            });

        this.isReloadingApp = false;
      } else {
        logger.debug(() => `Logical state is not being updated, it is ${this.props.uiState.logicalState}`);
      }
    }
  }

  private moveToNewScene(appInSelfCheckout: boolean, scoScene: () => void, attendantModeScene: () => void): void {
    appInSelfCheckout ? scoScene() : attendantModeScene();
  }

  private clearSelectedItemLinesIfNecessary(): void {
    if (this.props.itemSelectionMode !== ItemSelectionMode.None) {
      this.props.clearSelectedItemLines();
    }
  }

  private handleAppStateChange = (appState: AppStateStatus): void => {
    const diContainer = this.props.settings.diContainer;

    if (diContainer) {
      // Not toggling on state "inactive" to avoid excessive/redundant work. Example, user could adjust
      // brightness or accidentally open siri and cause "inactive" state, don't disable devices.
      if (appState === "active") {
        startDeviceServices(diContainer).catch((error) => {
          logger.error(() => `in RootContainer.toggleDevices, startDeviceServices failed with error ${error}`);
        });
        startListernManager(diContainer)
        .then((listenerInfo) => {
          startPeerDiscoveryManager(diContainer, listenerInfo?.port).catch((error) => {
            logger.error("Error starting peer discovery manager", error);
          });
        })
        .catch((error) => {
          logger.error("Error starting peer listener manager", error);
        });
      } else if (appState === "background") {
        stopDeviceServices(diContainer).catch((error) => {
          logger.error(() => `in RootContainer.toggleDevices, stopDeviceServices failed with error ${error}`);
        });
        stopListenerManager(diContainer).catch((error) => {
          logger.error("Error stopping peer listener manager", error);
        });
        stopPeerDiscoveryManager(diContainer).catch((error) => {
          logger.error("Error stopping peer discovery manager", error);
        });
      }
    }

    if (this.state.reactNativeAppState !== appState) {
      this.setState({ reactNativeAppState: appState });
    }
  }

  private handleLocale(nextProps: Props): void {
    if (nextProps.settings.appStatus === AppStatus.Ready && this.props.settings.appStatus !== AppStatus.Ready) {
      const retailLocations = nextProps.retailLocations.retailLocations;
      const retailLocationId = nextProps.settings.deviceIdentity.retailLocationId;
      // FIXME - You can't reliably get store name this way. Retail locations only loaded during terminal provisioning.
      const store = retailLocations.find((storeToCheck: IRetailLocation) =>
          storeToCheck.retailLocationId === retailLocationId);

      if (nextProps.settings.translations) {
        initI18n(nextProps.settings.translations, nextProps.settings.primaryLanguage || (store && store.language));
      } else if (nextProps.settings.primaryLanguage || (store && store.language)) {
        this.loadTranslations(
          nextProps.settings.primaryLanguage ? nextProps.settings.primaryLanguage : store.language,
          nextProps);
      }
    } else if (!this.props.businessState.stateValues && nextProps.businessState.stateValues) {
      const preferredLanguage = nextProps.businessState.stateValues.get("UserSession.user.preferredLanguage");
      if (preferredLanguage) {
        this.loadTranslations(preferredLanguage, nextProps, false, undefined, true);
      }
    } else if (this.props.businessState.stateValues && nextProps.businessState.stateValues) {
      this.handleLocaleForBusinessStateChange(nextProps);
    }
  }

  private handleLocaleForBusinessStateChange(nextProps: Props): void {
    const prevPreferredLanguage = this.props.businessState.stateValues.get("UserSession.user.preferredLanguage");
    const userPreferredLanguage = nextProps.businessState.stateValues.get("UserSession.user.preferredLanguage");
    const prevLogOnStatus = this.props.businessState.stateValues.get("UserSession.loggedOn");
    const logOnStatus = nextProps.businessState.stateValues.get("UserSession.loggedOn");
    if (!!logOnStatus && userPreferredLanguage && userPreferredLanguage !== null) {
          const langChanged = prevPreferredLanguage !== undefined && prevPreferredLanguage !== null
            && prevPreferredLanguage !== userPreferredLanguage;
          const updateUserPrefEvent = userPreferredLanguage && !prevPreferredLanguage &&
            logOnStatus && !prevLogOnStatus;
          this.loadTranslations(userPreferredLanguage, nextProps, langChanged, prevPreferredLanguage,
            updateUserPrefEvent);
    } else if (!!!logOnStatus && prevLogOnStatus !== logOnStatus && nextProps.settings.primaryLanguage &&
      nextProps.settings.primaryLanguage !== null) {
      this.loadTranslations(nextProps.settings.primaryLanguage, nextProps);
    }
  }

  private loadTranslations(localeId: string, nextProps: Props, languageChanged: boolean = false,
                           previousLocaleId: string = undefined, updateUserPrefEvent: boolean = false): void {
    if (languageChanged || localeId !== I18n.locale || (previousLocaleId && localeId !== previousLocaleId)) {
      if (getTranslationsFromI18Translations(localeId)) {
        initI18n(I18n.translations, localeId);
      } else if (!previousLocaleId || previousLocaleId !== localeId) {
        // if translations for the previous selected language exist in cache or embedded json's,
        // then the fallback to that previous language should take place rather than the fallback to English
        initI18n(undefined, "en");
      }

      const diContainer = nextProps.settings.diContainer;
      if (diContainer) {
        const translationManager = diContainer.get<ITranslationManager>(CORE_DI_TYPES.ITranslationManager);
        if (translationManager) {
          translationManager.loadTranslations({
            "appId": "SSA",
            "language": localeId,
            "previousLanguage": previousLocaleId
          }, initI18n, getTranslationsFromEmbeddedJson)
          .then(() => {
            if (updateUserPrefEvent) {
              const uiInputs: UiInput[] = [];
              uiInputs.push(new UiInput(UiInputKey.PREFERREDLANGUAGE, localeId));
              nextProps.performBusinessOperation(nextProps.settings.deviceIdentity, UPDATE_USER_PREFERENCES_EVENT,
                uiInputs);
            }
          })
          .catch((error) => {
            logger.warn(`Failed to retrieve translations for '${localeId}'/'SSA': ${error}`);
          });
        }
      }
    }
  }

  private getMenuComponent(): JSX.Element {
    if (!this.isGiftCardDevice) {
      try {
        this.isGiftCardDevice = getIsGiftCardDeviceFilter(this.props.settings.configurationManager,
            this.props.settings.deviceIdentity.deviceId);
      } catch (error) {
          this.isGiftCardDevice = (paymentStatus: IPaymentStatus): boolean => true;
      }
    } else {
      this.giftCardDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isGiftCardDevice);
    }
    this.isGiftCardAvailable = this.giftCardDevices?.length > 0 ||
        isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
            this.props.businessState.stateValues &&
            this.props.businessState.stateValues.get("StoredValueCardSession.state"), ValueCardAction.Inquiry);
    this.isValueCertAvailable = isStoredValueCertificateServiceAvailable(this.props.settings.configurationManager,
        this.props.businessState.stateValues &&
        this.props.businessState.stateValues.get("StoredValueCertificateSession.state"),
        ValueCertSubType.GiftCertificate, ValueCertificateAction.Inquiry);
    if (this.props.uiState.isAllowed(LOG_OFF_EVENT)) {
      return this.notInTransactionMenu(this.isGiftCardAvailable, this.isValueCertAvailable);
    } else {
      return this.inTransactionMenu(this.isGiftCardAvailable, this.isValueCertAvailable);
    }
  }

  private notInTransactionMenu(isGiftCardAvailable: boolean, isValueCertInquiryAvailable: boolean): JSX.Element {
    const isReprintable: boolean = this.props.businessState.lastPrintableTransactionInfo &&
        this.props.businessState.lastPrintableTransactionInfo.reprintable;
    const userComponentConfig = this.props && this.props.settings &&
        this.props.settings.configurationManager.getConfigurationValues(ConfigurationBlockKey.userComponent);
    const allowUserChangePassword: boolean = userComponentConfig && userComponentConfig.allowUserChangePassword;
    const reprintReceiptFeatureEnabled: boolean = this.props.uiState.isAllowed(REPRINT_LAST_RECEIPT_EVENT);

    return (
      <BaseView style={this.styles.sideBar}>
        <ScrollView>
          {
            this.renderSideMenuButton(this.toggle, "Close", this.styles.closeLogo)
          }
          {
            this.props.businessState.stateValues.get("TerminalSession.isOpen") &&
            <>
              <View style={this.styles.separator} />
              <Text style={this.styles.commerce}>{I18n.t("commerceCaps")}</Text>
              {
                this.isCustomerSearchAvailable &&
                this.renderSideMenuButton(this.onCustomerSearch, "SearchCustomer", this.styles.searchCustomerLogo,
                    "customerSearch")
              }
              {
                this.renderSideMenuButton(this.onProductInquiry, "ProductInquiry", this.styles.productInquiryLogo,
                    "productInquiry")
              }
              {
                this.isOrderInquiryEnabled &&
                this.renderSideMenuButton(this.onOrderInquiry, "OrderInquiry", this.styles.orderInquiryLogo,
                    "orderInquiry", null, null, null, "OrderInquiry")
              }
              {
                this.renderSideMenuButton(this.onSalesHistory, "SalesHistory", this.styles.salesHistoryLogo,
                    "salesHistory")
              }
              {
                (isGiftCardAvailable || isValueCertInquiryAvailable) &&
                this.renderSideMenuButton(this.onBalanceInquiry, "GiftCard", this.styles.giftCardLogo,
                    balanceSideMenuI18nCode(isGiftCardAvailable, isValueCertInquiryAvailable),
                    false, !(isGiftCardAvailable || isValueCertInquiryAvailable))
              }
              {
                isReprintable && reprintReceiptFeatureEnabled &&
                this.renderSideMenuButton(this.onReprintReceipt, "Reprint", this.styles.reprintLogo,
                    "reprintReceiptTransaction")
              }
            </>
          }
          <View style={this.styles.separator} />
          {this.storeOperationButtonValue &&
            this.renderSideMenuButton(this.onStoreOperations, "Forward", this.styles.chevronIcon,
                "storeOperations", true)
          }
          { this.storeOperationButtonValue && <View style={this.styles.separator} /> }
          <Text style={this.styles.commerce}>{I18n.t("generalCaps")}</Text>
          {
            this.renderSideMenuButton(this.onInformation, undefined, undefined, "information",
            false, false, true)
          }
          {allowUserChangePassword &&
            this.renderSideMenuButton(this.onChangePassword, undefined, undefined, "changePassword")
          }
          {
            this.renderSideMenuButton(this.onPreference, undefined, undefined, "preference")
          }
          {
            this.renderSideMenuButton(this.selfCheckoutModeConfigEnabled ?
                this.handleApplicationModeToggle.bind(this) : this.onSignOut,
                undefined, undefined, this.selfCheckoutModeConfigEnabled ? "customerMode" : "signOut")
          }
        </ScrollView>
      </BaseView>
    );
  }

  private inTransactionMenu(isGiftCardAvailable: boolean, isValueCertInquiryAvailable: boolean): JSX.Element {
    return (
      <BaseView style={this.styles.sideBar}>
        <ScrollView>
          {
            this.renderSideMenuButton(this.toggle, "Close", this.styles.closeLogo)
          }
          <View style={this.styles.separator} />
          <Text style={this.styles.commerce}>{I18n.t("commerceCaps")}</Text>
          {
            this.renderSideMenuButton(this.onProductInquiry, "ProductInquiry", this.styles.productInquiryLogo,
                "productInquiry")
          }
          {
            (isGiftCardAvailable || isValueCertInquiryAvailable) &&
            this.renderSideMenuButton(this.onBalanceInquiry, "GiftCard", this.styles.giftCardLogo,
                balanceSideMenuI18nCode(isGiftCardAvailable, isValueCertInquiryAvailable),
                false, !(isGiftCardAvailable || isValueCertInquiryAvailable))
          }
          <View style={this.styles.separator} />
          <Text style={this.styles.commerce}>{I18n.t("generalCaps")}</Text>
          {
            this.renderSideMenuButton(this.onInformation, undefined, undefined, "information",
                false, false, true)
          }
          {
            this.renderSideMenuButton(this.onPreference, undefined, undefined, "preference")
          }
          {
            Theme.isTablet && this.selfCheckoutModeConfigEnabled && this.currentScreen === "main" &&
            <>
              <View style={this.styles.separator} />
              {
                this.renderSideMenuButton(this.handleApplicationModeToggle.bind(this), "SignOut",
                    this.styles.sideBarIcon, "customerMode")
              }
            </>
          }
        </ScrollView>
      </BaseView>
    );
  }

  private renderSideMenuButton = (buttonAction: () => void, iconName: string, iconStyle: any, buttonText?: string,
                                  iconAlignRight?: boolean, disabled?: boolean, isInfo?: boolean,
                                  testID?: string): JSX.Element => {
    return (
      <TouchableHighlight
        activeOpacity={1}
        {...getTestIdProperties(testID, "side-menu-button")}
        style={!isInfo ? this.styles.sideBarButton : this.styles.sideBarButtonInfo}
        underlayColor={this.styles.sideBarActiveButton}
        disabled={disabled}
        onPress={() => {
          if (this.currentScreen === "landing" && iconName !== "Close" && buttonText !== "signOut") {
            dispatchWithNavigationRef(replace("main"));
          }
          buttonAction();
        }}
      >
        <View style={!isInfo ? this.styles.sideBarButtonWrapper : this.styles.sideBarButtonWrapperInfo}>
          {iconName && !iconAlignRight && <VectorIcon
              name={iconName}
              fill={iconStyle.color}
              height={iconStyle.height}
              width={iconStyle.width}
              stroke={iconStyle.backgroundColor}
              strokeWidth={iconStyle.fontSize}
          />
          }
          {
            buttonText &&
            <Text
              {...getTestIdProperties(testID, "side-menu-button-text")}
              style={iconName && !iconAlignRight ? this.styles.sideBarTextWithIcon : this.styles.sideBarText}>
                {I18n.t(buttonText)}
            </Text>
          }
          {iconName && iconAlignRight &&
          <View style={this.styles.fontLogo}>
            <VectorIcon
                name={iconName}
                fill={iconStyle.color}
                height={iconStyle.height}
                width={iconStyle.width}
                stroke={iconStyle.backgroundColor}
                strokeWidth={iconStyle.fontSize}
            />
          </View>
          }
          {isInfo && this.props.settings.deviceIdentity &&
          <Text
            {...getTestIdProperties(testID, "side-menu-info-text")}
            style={this.styles.terminalText}>
              {`(${I18n.t("device")} ${(this.props.settings.deviceIdentity.deviceId)})`}
          </Text>
          }
        </View>
      </TouchableHighlight>
    );
  }

  private toggle = (): void => {
    this.currentScreen = getCurrentRouteNameWithNavigationRef();
    if (!this.disableGestureOrClick()) {
      this.setState({isOpen: !this.state.isOpen});
    }
  }

  private onScreenAction = (screenAction: ScreenAction): void => {
    switch (screenAction) {
      case ScreenAction.main:
        dispatchWithNavigationRef(popTo("main"));
        break;
      case ScreenAction.resumeSuspendedTransactions:
        dispatchWithNavigationRef(replace("resumeSuspendedTransactions"));
        break;
      case ScreenAction.customer:
        this.onCustomerSearch();
        break;
      case ScreenAction.productInquiry:
        dispatchWithNavigationRef(replace("productInquiry"));
        break;
      case ScreenAction.orderInquiry:
        dispatchWithNavigationRef(replace("orderInquiry"));
        break;
      case ScreenAction.salesHistory:
        dispatchWithNavigationRef(replace("salesHistory"));
        break;
      case ScreenAction.balanceInquiry:
        dispatchWithNavigationRef(replace("balanceInquiry",
            {
              isGiftCardAvailable: this.isGiftCardAvailable,
              isValueCertAvailable: this.isValueCertAvailable
            }
        ));
        break;
      case ScreenAction.storeOperations:
        dispatchWithNavigationRef(replace("storeOperations"));
        break;
      default:
        break;
    }
  }

  private get isCustomerSearchAvailable(): boolean {
    return this.props.settings.configurationManager && this.props.settings.configurationManager.
        getFunctionalBehaviorValues().customerFunctionChoices.customerHamburgerButton.visible;
  }

  private get isOrderInquiryEnabled(): boolean {
    const functionalBehavior = this.props.settings.configurationManager &&
        this.props.settings.configurationManager.getFunctionalBehaviorValues();
    const omniChannelBehaviors = functionalBehavior && functionalBehavior.omniChannelBehaviors;
    const orders = omniChannelBehaviors && omniChannelBehaviors.orders;
    return orders && orders.orderInquiry && orders.orderInquiry.enabled;
  }

  private onCustomerSearch = (continueWithCustomerSearch: boolean = false): void => {
    this.setState({isOpen: false});
    navigate("customer", {
      isTransactionStarting: false,
      assignCustomer: false,
      continueWithCustomerSearch,
      onExit: () => dispatchWithNavigationRef(popTo("main")),
      onCancel: () => dispatchWithNavigationRef(popTo("main"))
    });
  }

  private async sendRequestToExternalClientelingApp(): Promise<void> {
    const url: string = `${clientelingAppUrl(this.props.settings.configurationManager)}${
      buildExternalClientelingAppRequest(this.props.businessState, ExternalClientelingAppInboundAction.NotifyNotInReadyState)
    }`;
    try {
      await Linking.openUrl(url, undefined, false)
    } catch (error) {
      this.setState({isOpen: !this.state.isOpen})
      Alert.alert(I18n.t("unableToOpen"), I18n.t("externalClientelingAppNotFoundErrorMessage"), [
        { text: I18n.t("cancel"), style: "cancel"},
        { text: I18n.t("continue"), onPress: () => this.onCustomerSearch(true) }
      ], {cancelable: true});
    }
  }

  private onInvocationByExternalClientelingApp = async (event?: UrlEvent): Promise<void> => {
    this.setState({isOpen : false});
    const url = event?.url;
    if (url) {
      const action = getExternalClientelingAppAction(url);
      if(action !== ExternalClientelingAppOutboundAction.CancelCustomerActivity){
        if (!this.state.loggedIn ||
            !(( this.props.uiState.logicalState === NOT_IN_TRANSACTION && this.currentScreen === "main" ) ||
            this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION)){
          await this.sendRequestToExternalClientelingApp();
        }else if(action === ExternalClientelingAppOutboundAction.NotifyError){
          const error: ResponseError = JSON.parse(await Linking.fetchDataFromClipboard());
          logger.warn(`onInvocationByExternalClientelingApp : error ${error.message}`);
          Alert.alert(I18n.t("unableToConnect"), I18n.t("externalClientelingAppErrorResponse"), [
            { text: I18n.t("cancel"), style: "cancel"},
            { text: I18n.t("retry"), onPress: () => this.onCustomerSearch() },
            { text: I18n.t("continue"), onPress: () => this.onCustomerSearch(true) }
          ], {cancelable: true});
        }else if (action === ExternalClientelingAppOutboundAction.ApplySelectedCustomer &&
          (( this.props.uiState.logicalState === NOT_IN_TRANSACTION && this.currentScreen === "main" ) ||
          this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION)){
          const payload: CustomerResponse = JSON.parse(await Linking.fetchDataFromClipboard());
          this.props.searchCustomer(this.props.settings.deviceIdentity, {customerKey: payload.customerKey});
        }
      }
    }
  };

  private callExternalCustomerAppToFindCustomer(): void {
    try {
      this.setState({isExternalClientelingAppRequestInProgress: true});
      Linking.addUrlListener(
        getExternalClientelingAppComponent(clientelingAppUrl(this.props.settings.configurationManager)).domain,
        this.onInvocationByExternalClientelingApp
      );
    } catch (error) {
      logger.warn(`Error caught while calling Linking.addUrlListener for the url: ${clientelingAppUrl(this.props.settings.configurationManager)}`, error);
    }
  }

  private onProductInquiry = (): void => {
    this.toggle();
    navigate("productInquiry");
  }

  private onOrderInquiry = (): void => {
    this.toggle();
    navigate("orderInquiry");
  }

  private onSalesHistory = (): void => {
    this.toggle();
    navigate("salesHistory");
  }

  private onBalanceInquiry = (): void => {
    this.toggle();
    navigate("balanceInquiry",
      {
        isGiftCardAvailable: this.isGiftCardAvailable,
        isValueCertAvailable: this.isValueCertAvailable
      }
    );
  }

  private onReprintReceipt = (): void => {
    this.toggle();
    navigate("reprintReceipt");
  }

  private onStoreOperations = (): void => {
    this.toggle();
    navigate("storeOperations");
  }

  private onChangePassword = (): void => {
    this.toggle();
    navigate("changePassword");
  }

  private onPreference = (): void => {
    this.toggle();
    navigate("preferenceScreen");
  }

  private onInformation = (): void => {
    this.toggle();
    navigate("information");
  }

  private onSignOut = (): void => {
    this.props.checkIsAppVersionBlocked();
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, LOG_OFF_EVENT, []);
    this.toggle();
  }

  private globalJSErrorHandler = (error: Error, isFatal: boolean): void => {
    // if the error is undefined, it is causing the app to crash due to a Maximum call stack size exceeded.
    if (!error || !(error instanceof Error)) {
      return;
    }

    const entryMessage: ILogEntryMessage = logger.traceEntry("globalJSErrorHandler");

    let errorMessage: ILocalizableMessage;
    if (isDeviceServiceError(error)) {
      logger.error("Global error handler caught a DeviceServiceError", {}, error);
      errorMessage = {
        defaultMessage: "External device has error-ed, if this persists please contact support.",
        i18nCode: error.errorCode,
        parameters: new Map<string, any>([["ErrorMessage", error && error.message]])
      };
    } else { // This must be something we haven't expected / don't know how to deal with, work with it accordingly.
      logger.error("Global Error Handler received unexpected error type", {}, error);
      errorMessage = {
        defaultMessage: "Application has experienced an error, if this persists please contact support.",
        i18nCode: CLIENT_UNEXPECTED_ERROR_I18N_CODE,
        parameters: new Map<string, any>([["ErrorMessage", error && error.message]])
      };
    }

    this.props.userNotification(errorMessage, error);

    logger.traceExit(entryMessage);
  }

  private globalNativeErrorHandler = (nativeErrorString: string): void => {
    const entryMessage: ILogEntryMessage = logger.traceEntry("globalNativeErrorHandler");

    // Can do more here, but this is only executed when app is in a Production Bundle
    logger.error(() => `Native error occurred, caught in globalNativeErrorHandler: ${nativeErrorString}`);

    const userMessage: ILocalizableMessage = {
      defaultMessage: "Application has experienced an internal error, the development team has been notified.",
      i18nCode: CLIENT_UNEXPECTED_ERROR_I18N_CODE
    };

    this.props.userNotification({ message: userMessage, error: new Error(nativeErrorString) });

    logger.traceExit(entryMessage);
  }

  //FIXME: Find a way to transition the capitalizeNextKey functionality here to react native code on android.
  private sendKeyEvent(keyEvent: any): void {
    if (keyEvent.pressedKey.match("^[A-Za-z0-9\r\n!@#$%&*^(){}\\-_=+,.<>/?;:'\"|\\[\\]~`\\\\]+$")) {
      if ((keyEvent.pressedKey === "\r" || keyEvent.pressedKey === "\n")) {
        if (this.barcodeData) {
          this.addBarcodeData("\n");
          this.setKeyEventDataTimeout();
        }
      } else {
        if (this.capitalizeNextKey) {
          this.addBarcodeData(keyEvent.pressedKey.toUpperCase());
        } else {
          this.addBarcodeData(keyEvent.pressedKey);
        }
      }
      this.capitalizeNextKey = false;
      // keyCodes for left and right shift, respectively.
    } else if (keyEvent.keyCode === 59 || keyEvent.keyCode === 60) {
      this.capitalizeNextKey = true;
    } else {
      this.capitalizeNextKey = false;
    }
  }

  private addBarcodeData(data: string): void {
    if (this.keyEventTimeout) {
      clearTimeout(this.keyEventTimeout);
      this.keyEventTimeout = undefined;
    }
    this.barcodeData += data;
  }

  private setKeyEventDataTimeout(): void {
    this.keyEventTimeout = setTimeout(() => {
      const data: IKeyListenerData = {
        inputText: this.barcodeData.slice(0, -1)
      };
      this.props.dataEvent(DataEventType.KeyListenerData, data);
      this.barcodeData = "";
      this.keyEventTimeout = undefined;
    }, KEY_EVENT_TIMEOUT) as any;
  }

  private handleApplicationModeToggle(): void {
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, EXIT_ATTENDANT_MODE_EVENT, []);
  }

  private handleSCOConfigErrorPopUp(): void {
    this.props.uiModeFailure(UI_MODE_FATAL_ERROR, new Error( Theme.isTablet ?
      I18n.t("terminalSettingChangedNeedReinstalled") : I18n.t("applicationInSCOAndLoadedOnPhone")));
  }

  private handleSCOConfigError(error: PosError): void {
    this.props.uiModeFailure(UI_MODE_FATAL_ERROR, error);
  }

  private handleTerminalStateSync(prevProps: Props, prevState: State): void {
    const settingsAppStatusIsReady: boolean = this.props.settings.appStatus === AppStatus.Ready;

    const shouldSyncAfterAppSetToActive: boolean = prevState.reactNativeAppState !== this.state.reactNativeAppState &&
        this.state.reactNativeAppState === "active" && settingsAppStatusIsReady;

    const settingsAppStatusNowReady: boolean = prevProps.settings.appStatus !== AppStatus.Ready &&
        settingsAppStatusIsReady && this.state.reactNativeAppState === "active";

    const isAuthDeviceActive = this.props.businessState && this.props.businessState.stateValues &&
        this.props.businessState.stateValues.get("TenderAuthorizationSession.isAuthorizationDeviceActive");

    if ((shouldSyncAfterAppSetToActive || settingsAppStatusNowReady) && this.props.terminalStateSyncEnabled &&
        !isAuthDeviceActive) {
      this.fireTerminalStateSync();
    }
  }

  private handleTerminalPendingUpdate(prevProps: Props): void {
    const prevStateValues: Readonly<Map<string, any>> = prevProps.businessState && prevProps.businessState.stateValues;
    const prevTransactionId: string = prevStateValues && prevStateValues.get("transaction.id");
    const prevTerminalStateOpen: boolean = prevStateValues && prevStateValues.get("TerminalSession.isOpen");

    const currentStateValues: Readonly<Map<string, any>> = this.props.businessState && this.props.businessState.
        stateValues;
    const currentTransactionId: string = currentStateValues && currentStateValues.get("transaction.id");

    const hasPendingUpdate: boolean = currentStateValues && currentStateValues.get("TerminalSession.hasPendingUpdate");
    const pendingUpdate: TerminalPendingUpdate =
        currentStateValues && currentStateValues.get("TerminalSession.pendingUpdate");
    const currentTerminalStateClosed: boolean = currentStateValues &&
        currentStateValues.get("TerminalSession.isClosed");

    const transactionClosed: boolean = prevTransactionId && !currentTransactionId;

    const promptForChangeTerminalState: boolean = hasPendingUpdate && transactionClosed &&
        pendingUpdate === TerminalPendingUpdate.Closed;
    const automaticallySyncForTerminalState: boolean = hasPendingUpdate && prevTerminalStateOpen
        && currentTerminalStateClosed;

    if (promptForChangeTerminalState) {
      setTimeout(() => Alert.alert(
        I18n.t("closeTerminalRequested"),
        I18n.t("backOfficeSystemHasRequestedThisTerminalBeClosed"),
        [
          { text: I18n.t("ignore"), style: "cancel" },
          { text: I18n.t("close"), onPress: this.fireTerminalStateSync }
        ]
      ), 250);
    } else if (automaticallySyncForTerminalState || (hasPendingUpdate && transactionClosed)) {
      this.fireTerminalStateSync();
    }
  }

  private fireTerminalStateSync = (): void => {
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, TERMINAL_STATE_SYNC_EVENT, []);
  }
}

function balanceSideMenuI18nCode(isGiftCardAvailable: boolean, isValueCertAvailable: boolean): string {
  if (isGiftCardAvailable && isValueCertAvailable) {
    return "balanceInquiry";
  } else if (isGiftCardAvailable) {
    return "giftCardBalance";
  } else if (isValueCertAvailable) {
    return "valueCertificateBalance";
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    itemSelectionMode: state.itemSelectionState.itemSelectionMode,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    retailLocations: state.retailLocations,
    sceneTitles: state.sceneTitlesState.sceneTitles,
    selfCheckoutModeState: state.selfCheckoutState,
    settings: state.settings,
    terminalStateSyncEnabled: state.terminalSyncState.terminalStateSyncEnabled,
    uiState: state.uiState,
    countries: state.countries,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  dataEvent: dataEvent.request,
  initAppSettings: initAppSettingsAction,
  performBusinessOperation: businessOperation.request,
  clearSelectedItemLines: clearSelectedItemLines.request,
  uiModeFailure: updateUiMode.failure,
  updateUiMode: updateUiMode.request,
  userNotification: userNotification.request,
  loadRewardReasons: loadRewardReasons.request,
  searchCustomer: searchCustomer.request,
  setLastSCOSceneKey: setLastSCOSceneKey.request,
  loadAppResource: loadAppResource.request,
  checkIsAppVersionBlocked: checkIfAppVersionIsBlocked.request,
  loadCountries: loadCountries.request,
  loadI18nLocation: loadI18nLocation.request
})(RootContainer);
