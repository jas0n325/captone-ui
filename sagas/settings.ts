import { Database } from "@aptos-scp/react-native-couchbaselite";

import { ILogEntryMessage, ILogger, ILoggingContext, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { TenantConfig } from "@aptos-scp/scp-component-rn-auth";
import { AuthInstance, discoverTenant } from "@aptos-scp/scp-component-rn-auth";
import { initAuthRedux } from "@aptos-scp/scp-component-rn-auth/redux-saga";
import {
  DeviceIdentity,
  DI_TYPES as CORE_DI_TYPES,
  IAppLocalCoreStorage,
  IConfigurationManager,
  IConfigurationValues,
  IPepsWriteAheadLogger,
  LanguageFields,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  DI_TYPES as FEATURES_DI_TYPES,
  IAppLocalFeaturesStorage,
  IResourceRepository,
  ISequenceAdapter,
  ISequences,
  ITransactionAdapter,
  SYNC_STATE_EVENT,
  I18nLocationProvider
} from "@aptos-scp/scp-component-store-selling-features";
import { TransactionService as TransactionPostingService } from "@aptos-scp/scp-component-transaction";
import { Container } from "inversify";
import EnvFileDefinitions from "react-native-config";
import * as Device from "react-native-device-detection";
import MobileDeviceManager from "react-native-mdm";
import RNRestart from "react-native-restart";
import { SagaIterator } from "redux-saga";
import { call, fork, put, select, takeEvery } from "redux-saga/effects";

import * as CB from "@aptos-scp/scp-component-rn-circuit-breaker";
import {
  bindTerminalDIContainer,
  clearTenantDIContainer,
  clearTerminalDIContainer,
  createBindingsInAppDIContainer,
  createBindingsInTenantDIContainer,
  createDIContainer,
  DI_TYPES,
  initializeTerminalDIContainer,
  ApplicationRetriever
} from "../../config";
import { configureBackgroundFetch } from "../../config/BackgroundFetch";
import I18n from "../../config/I18n";
import { IAppLocalDeviceStorage } from "../../persistence/IAppLocalDeviceStorage";
import {
  AppConfiguration,
  appSettingsChangeActions,
  AppStatus,
  APP_SETTING_GET_LAST_TRANSACTION_NUMBER_ACTION,
  businessOperation,
  checkIfAppVersionIsBlocked,
  getLastTransactionNumberAction,
  INIT_APP_SETTINGS_ACTION,
  PREPARE_TERMINAL_SETTINGS_CHANGE_ACTION,
  Settings,
  SET_TENANT_SETTINGS_ACTION,
  SET_TERMINAL_SETTINGS_ACTION,
  StandardAction,
  TENANT_SETTINGS_INITIALIZED_ACTION,
  TERMINAL_SETTINGS_INITIALIZED_ACTION,
  UiStyling,
  updateAppAccessLock,
  updateUiMode,
  UPDATE_PENDING_TRX_COUNT
} from "../actions";
import { envCircuitBreaker } from "../components/common/utilities";
import { SettingsState, UI_MODE_FATAL_ERROR } from "../reducers";
import store from "../reduxStore";
import { getAppSettingsState } from "../selectors";
import { configureAdminUserAuthentication, configureTerminalAuthentication } from "./auth";
import { ClientSettings, getClientDbDownloadUrl, registerClient } from "./clientRegistration";
import { downloadDatabase } from "./downloadDatabase";
import { getExchangeRates } from "./exchangeRates";
import { getLanguages } from "./languages";
import { LastValueDetails } from "@aptos-scp/scp-types-transaction";
import { bindDatabases, shutdownMasterDb } from "../../config/inversify/inversify.terminal.config/database.config";
import { dispatchWithNavigationRef } from "../components/RootNavigation";
import { pop } from "../components/common/utilities/navigationUtils";
import { initializeTaskDispatcher } from "./tasks";
import { TaskHandlerRegistry } from "@aptos-scp/scp-component-task-dispatcher";
import { watchOnDataSyncStatusNotifications } from "./dataSyncStatus";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.settings");

const loadAppConfiguration = async (): Promise<AppConfiguration> => {
  let appConfiguration: AppConfiguration;
  try {
    appConfiguration = await MobileDeviceManager.getConfiguration();
    logger.info(`AppConfig data: ${JSON.stringify(appConfiguration)}`);
  } catch (err) {
    logger.catching(err, "Error while getting the application configuration from MDM");
  }

  return appConfiguration;
};

const loadSettings = async (diContainer: Container): Promise<Settings> => {
  const appLocalDeviceStorage: IAppLocalDeviceStorage =
    diContainer.get<IAppLocalDeviceStorage>(DI_TYPES.IAppLocalDeviceStorage);
  const appLocalCoreStorage: IAppLocalCoreStorage =
    diContainer.get<IAppLocalCoreStorage>(CORE_DI_TYPES.IAppLocalCoreStorage);
  const appLocalFeaturesStorage: IAppLocalFeaturesStorage =
    diContainer.get<IAppLocalFeaturesStorage>(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);

  const appConfiguration = await loadAppConfiguration();
  const domain = await appLocalDeviceStorage.loadDomain();
  const tenantConfig = await appLocalDeviceStorage.loadTenantConfig();
  const deviceIdentity = await appLocalDeviceStorage.loadDeviceIdentity();
  const userAuthRealm = await appLocalDeviceStorage.loadUserAuthRealm();
  const transactionNumber = await appLocalCoreStorage.loadTransactionNumber();
  const configurationProfileName = await appLocalDeviceStorage.loadConfigurationProfileName();
  const primaryLanguage = await appLocalFeaturesStorage.loadRetailLocationLocale();
  const retailLocationCurrency = await appLocalDeviceStorage.loadRetailLocationCurrency();

  return {
    domain,
    appConfiguration,
    tenantConfig,
    deviceIdentity,
    userAuthRealm,
    transactionNumber,
    configurationProfileName,
    primaryLanguage,
    retailLocationCurrency
  };
};


const loadClientId = (settings: SettingsState): string => {
  const clientId: string = settings.appConfiguration && settings.appConfiguration.clientId;
  const clientSecret: string = settings.appConfiguration && settings.appConfiguration.clientSecret;
  if (clientId && clientSecret) {
    return clientId;
  }

  return undefined;
};

const loadLanguages = async (diContainer: Container): Promise<LanguageFields[]> => {
  try {
    const languages  = await getLanguages(diContainer);
    return languages;
  } catch (error) {
    logger.error("Failed build list of languages loaded from API ", error);
    return [];
  }
};

const configureCircuitBreaker = (): void => {
  const enableCB = envCircuitBreaker();
  logger.trace(() => `CircuitBreaker feature will be ${enableCB}`);
  CB.setCircuitBreakerFeatureEnabled(enableCB);
};

const loadUiStyling = async (diContainer: Container, isTablet: boolean): Promise<UiStyling> => {
  const configurationManager: IConfigurationManager = diContainer.get<IConfigurationManager>(
      CORE_DI_TYPES.IConfigurationManager);
  const resourceRepository: IResourceRepository = diContainer.get<IResourceRepository>(
      FEATURES_DI_TYPES.IResourceRepository);

  const uiStyling: UiStyling = {
    styles: undefined,
    appLogo: undefined,
    loginLogo: undefined,
    attendantModeToggleButtonImage: undefined
  };

  // Load configuration values and verify the application logo is valid
  const configurationValues: IConfigurationValues = configurationManager.getBrandingValues();
  if (configurationValues.uiStyling) {
    uiStyling.styles = configurationValues.uiStyling;

    const deviceUIStyling = isTablet ? uiStyling.styles.tablet : uiStyling.styles.phone;
    if (deviceUIStyling && deviceUIStyling.images) {
      const logoSize = isTablet ? "Medium" : "Small";
      const appLogo = await resourceRepository.get(
        {
          uri: deviceUIStyling.images.appLogo,
          headers: {
            size: logoSize,
            type: "Main"
          }
        }
      );
      if (appLogo) {
        uiStyling.appLogo = {uri: appLogo};
      }
    }
    if (deviceUIStyling && deviceUIStyling.images) {
      const logoSize = isTablet ? "Medium" : "Small";
      const loginLogo = await resourceRepository.get(
        {
          uri: deviceUIStyling.images.loginLogo,
          headers: {
            size: logoSize,
            type: "Login"
          }
        }
      );
      if (loginLogo) {
        uiStyling.loginLogo = {uri: loginLogo};
      }
    }
    if (deviceUIStyling && deviceUIStyling.images) {
      if (deviceUIStyling.images.attendantModeToggleButtonImage) {
        try {
          const checkForSCOLogo: boolean =
              await resourceRepository.exists(deviceUIStyling.images.attendantModeToggleButtonImage);

          if (checkForSCOLogo) {
            const attendantModeToggleButtonImage: string =
                await resourceRepository.get({uri: deviceUIStyling.images.attendantModeToggleButtonImage});
            uiStyling.attendantModeToggleButtonImage = {uri: attendantModeToggleButtonImage};
          } else {
            uiStyling.attendantModeToggleButtonImage = {uri: undefined};
          }
        } catch (err) {
          logger.catching(err,
              `Error while getting the sco logo: ${deviceUIStyling.images.attendantModeToggleButtonImage}`);
        }
      }
    }
  }

  return uiStyling;
};

const loadAppAccessLock = async (diContainer: Container): Promise<void> => {
  try {
    const appLocalDeviceStorage: IAppLocalDeviceStorage =
      diContainer.get<IAppLocalDeviceStorage>(DI_TYPES.IAppLocalDeviceStorage);
    const accessLock = await appLocalDeviceStorage.loadAppAccessLock();
    store.dispatch(updateAppAccessLock.success(accessLock.appLocked, false, accessLock.accessError));
    logger.info(() => `Local device storage loadAppAccessLock called. Locked status: ${accessLock.appLocked}`);
  } catch (err) {
    logger.catching(err, "Error while getting local device storage in loadAppAccessLock");
  }
};

function* resetMasterCouchbaseDatabase(diContainer: Container, settings: Settings, appStatus: AppStatus): IterableIterator<{}> {
  const appLocalDeviceStorage: IAppLocalDeviceStorage =
  diContainer.get<IAppLocalDeviceStorage>(DI_TYPES.IAppLocalDeviceStorage);
  const resetFlag = yield call([appLocalDeviceStorage, "loadCouchbaseResetFlag"]);
  try{
    if (resetFlag === "true") {
      let couchbaseDbDownloadUrl: string;
      let databaseDownloaded = false;

      if (!(EnvFileDefinitions.SKIP_PREBUILT_DB_DOWNLOAD &&
        EnvFileDefinitions.SKIP_PREBUILT_DB_DOWNLOAD.toLowerCase() === "true")) {
          const clientFilters = {
            appId: settings.deviceIdentity.applicationId,
            location: settings.deviceIdentity.retailLocationId,
            terminalId: settings.deviceIdentity.deviceId
          };

          try {
            couchbaseDbDownloadUrl = yield call(getClientDbDownloadUrl, diContainer, clientFilters);
            logger.info(`Retrieved couchbaseDbDownloadUrl: ${couchbaseDbDownloadUrl.split("?")[0]} for client: ${JSON.stringify(clientFilters)}`);
          } catch (err) {
            logger.warn(`Error getting couchbaseDbDownloadUrl for client: ${JSON.stringify(clientFilters)}, DB reset will continue with data sync replication`);
          }
      }

      yield call(shutdownMasterDb, diContainer, logger);
      if (couchbaseDbDownloadUrl) {
        databaseDownloaded = yield call(downloadDatabase, "master", couchbaseDbDownloadUrl);
        logger.info(() => `Master database downloaded`);
      }
      yield call(bindDatabases, diContainer, logger, false, false, store);
      if (couchbaseDbDownloadUrl && databaseDownloaded) {
        yield call(dispatchWithNavigationRef, pop());
      }
      yield fork(watchOnDataSyncStatusNotifications);
      yield put(appSettingsChangeActions.success({ appStatus, diContainer, ...settings }));
      yield call([appLocalDeviceStorage, "storeCouchbaseResetFlag"], "false");
      yield call([TaskHandlerRegistry, "setTaskCompleted"],"db-reset","db-reset-correlationId")
    }
  } catch (error) {
    if (resetFlag === "true") {
      yield call([TaskHandlerRegistry, "setTaskFailed"],"db-reset",error,"db-reset-correlationId")
    }
    throw error;
  }
};

function* configureTerminal(diContainer: Container, deviceIdentity: DeviceIdentity,
                            eraseMasterDb?: boolean): IterableIterator<{}> {
  yield call(configureTerminalAuthentication, diContainer);
  yield call(bindTerminalDIContainer, eraseMasterDb);
  // Load configuration values and, if new values were loaded (and therefore updated in AsyncStore), restart app
  const newValuesLoaded = yield call(
    [diContainer.get<IConfigurationManager>(CORE_DI_TYPES.IConfigurationManager), "loadConfigurationValues"],
    deviceIdentity
  );
  if (newValuesLoaded) {
    // Removes the resource cache so it is reloaded
    const resourceRepository: IResourceRepository = diContainer.get<IResourceRepository>(
        FEATURES_DI_TYPES.IResourceRepository);
    yield call([resourceRepository, "clear"]);

    RNRestart.Restart();
  }
  //
  // Knowing all bindings are complete, give the bound elements in the terminal-level DI container an
  // opportunity to initialize themselves with any now-available information (such as configuration values).
  //
  //TODO: ZSPFLD-2278: Consider more generally/formally designing this process.
  //      Rather than just calling a specific initialization method here, perhaps raise a new type of notification
  //      (perhaps DomainNotification?), so interested parties including but also beyond these DIContainer-bound
  //      entities can subscribe and fully initialize themselves with reliable loaded data.  Such initialization
  //      will include use of loaded configuration values, but shouldn't be limited to that.
  yield call(initializeTerminalDIContainer);

  yield call(updatePendingTransactionCount, diContainer);
  yield call(fetchLastInvoiceSequenceNumber, diContainer, deviceIdentity.retailLocationId, deviceIdentity.deviceId);
  yield call(loadApplicationRetriever , diContainer, deviceIdentity);
}

async function loadApplicationRetriever (diContainer: Container, deviceIdentity: DeviceIdentity): Promise<void> {
  const applicationRetriever: ApplicationRetriever = diContainer.get(CORE_DI_TYPES.IApplication);
  const i18nLocationProvider: I18nLocationProvider = diContainer.get(FEATURES_DI_TYPES.II18nLocationProvider);

  await i18nLocationProvider.initialize(deviceIdentity);

  applicationRetriever.i18nLocation = i18nLocationProvider.i18nLocation;
}

function* storeTransactionLastValues(lastValues: LastValueDetails[],
                                     appLocalFeaturesStorage: IAppLocalFeaturesStorage): IterableIterator<any> {
  for (const lastValue of lastValues) {
    yield call([appLocalFeaturesStorage, "storeTransactionLastValue"], lastValue);
  }
}

async function updatePendingTransactionCount(diContainer: Container, isBackground?: boolean): Promise<void> {
  // update pending transaction count
  const transactionPostingService =
            diContainer.get<TransactionPostingService>(FEATURES_DI_TYPES.TransactionPostingService);

  if (isBackground && Device.isAndroid) {
    // updating redux updateTrxCount doesn't trigger transaction posting on Android, instead using public method in
    // transaction component. But using this direct method on iOS cause transactions to be posted twice. With 30+s to
    // complete background tasks, it is better to trigger transaction posting via redux-saga put on updateTrxCount.
    // we're not doing getPendingTransactionCount() because backgroundPostPendingTransactions() will do that.
    await transactionPostingService.backgroundPostPendingTransactions();
  } else {
    const pendingTransactionCount = await transactionPostingService.getPendingTransactionCount();

    put({ type: UPDATE_PENDING_TRX_COUNT.REQUEST, payload: { pendingTransactionCount } });
  }
}

function* dispatchPostTerminalConfigActions(deviceIdentity: DeviceIdentity): IterableIterator<{}> {
  const uiInputs: UiInput[] = [];
  uiInputs.push(new UiInput("appStartup", true));

  // sync business state from the domain layer into the redux state
  yield put(businessOperation.request(deviceIdentity, SYNC_STATE_EVENT, uiInputs));

  // notify that the terminal is ready via an action
  yield put({ type: TERMINAL_SETTINGS_INITIALIZED_ACTION, payload: { }});
}

/**
 * Load settings from storage and initialize the IoC container and objects/classes bound to it. If the app has been
 * fully provisioned it will then be ready to operate, otherwise it will be awaiting tenant and/or terminal
 * provisioning.
 */
export function* initAppSettings(action: any): IterableIterator<any> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("initAppSettings");
  let appStatus = AppStatus.PendingTenantSettings;
  const {isTablet} = action.payload;
  yield put(appSettingsChangeActions.request());

  try {
    configureCircuitBreaker();

    // First locate the IoC container from redux state, and if not there, create one.
    // We bind the diContainer into the Redux state instead of using a global variable, which caused problems.

    const settingsState: SettingsState = yield select(getAppSettingsState);
    let diContainer: Container = settingsState.diContainer;

    if (diContainer) {

      // clear out any potentially stale components from the IoC container
      yield call(clearTerminalDIContainer);
      logger.trace(() => "In initAppSettings(): clearing terminal IoC container.");

      yield call(clearTenantDIContainer);
      logger.trace(() => "In initAppSettings(): clearing tenant IoC container.");
    } else {

      // create the IoC container and setup application scope components

      diContainer = createDIContainer();
      yield call(createBindingsInAppDIContainer);
      logger.trace(() => "In initAppSettings(): initializing app IoC container.");

      // Connect auth to redux

      initAuthRedux(store, diContainer.get<AuthInstance>(DI_TYPES.AuthClient));
    }

    // now load settings from storage.
    const settings: Settings = yield call(loadSettings, diContainer);

    if (settings.domain) {

      // initialize the tenant IoC container since we have a domain

      yield call(createBindingsInTenantDIContainer);
      appStatus = AppStatus.PendingTerminalSettings;
      logger.trace("In initAppSettings(): initialize tenant configuration");

      if (settings.deviceIdentity.deviceId) {

        // initialize the terminal IoC container if we have those settings
        yield call(configureTerminal, diContainer, settings.deviceIdentity);

        settings.uiStyling = yield call(loadUiStyling, diContainer, isTablet);
        settings.languages = yield call(loadLanguages, diContainer);

        appStatus = AppStatus.Ready;
        settings.configurationManager = diContainer.get<IConfigurationManager>(CORE_DI_TYPES.IConfigurationManager);
        logger.trace("In initAppSettings(): initialize terminal configuration");
      } else {
        const clientId = yield call(loadClientId, settings);

        // we use a different authentication scheme to login the admin user for terminal provisioning

        yield call(configureAdminUserAuthentication, diContainer, settings.userAuthRealm, clientId);
      }
    }

    // update redux state

    yield put(appSettingsChangeActions.success({ appStatus, diContainer, ...settings }));

    // dispatch actions to trigger other post-init sagas.

    if (appStatus === AppStatus.Ready) {
      // setup background process to check for pending transactions
      configureBackgroundFetch( async () => {
        try {
          await updatePendingTransactionCount(diContainer, true);
          logger.info(`BackgroundTaskExecuted : checking pending transactions completed`);

          // FIXME: https://jira.aptos.com/browse/DAOP-252 re-add background data-sync
          // await backgroundDataSync(diContainer);
        } catch (err) {
          logger.warn(`BackgroundTaskExecuted : error ${err}`);
        }
      }).catch((err) => { logger.warn(`BackgroundTaskExecuted : error ${err}`); });

      // Work with pepsWriteAheadLogger after start up of the application
      const pepsWriteAheadLogger: IPepsWriteAheadLogger = diContainer.get(CORE_DI_TYPES.IPepsWriteAheadLogger);
      yield call([pepsWriteAheadLogger, "handleStartup"]);
      yield call(dispatchPostTerminalConfigActions, settings.deviceIdentity);
      yield call(getExchangeRates, diContainer);
      yield call(loadAppAccessLock, diContainer);
      yield put(checkIfAppVersionIsBlocked.request());
      yield call(initializeTaskDispatcher, diContainer, settings);
      yield call(resetMasterCouchbaseDatabase, diContainer, settings, appStatus);
    } else if (appStatus === AppStatus.PendingTerminalSettings) {
      yield put({ type: TENANT_SETTINGS_INITIALIZED_ACTION, payload: { }});
    }
  } catch (err) {
    // if there is any error occurred prior to the app logger  has been initialized, the app will not be able to report
    // any failure to the log service.
    // See ticket: https://jira.aptos.com/browse/ZSPFLD-2538
    logger.catching(err, entryMethod, LogLevel.FATAL);

    yield put(appSettingsChangeActions.failure(err));
    let errorMessage = err.message;
    if (err.localizableMessage) {
      const params = {};
      const parameters: Map<string, any> = err.localizableMessage.parameters || new Map<string, any>();
      for (const [key, value] of parameters.entries()) {
        params[key] = value;
      }
      errorMessage = I18n.t(err.localizableMessage.i18nCode, params);
    }
    yield put(updateUiMode.failure(UI_MODE_FATAL_ERROR, {name: "SettingsError", message: errorMessage}));
  }
  logger.traceExit(entryMethod);
}

/**
 * Save the domain and initialize any components and configuration related to the tenant. This should be invoked after
 * the user has entered a domain in the tenant settings.
 */
export function* setTenantSettings(action: StandardAction): IterableIterator<any> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("setTenantSettings");

  const { domain } = action.payload;
  const settings: SettingsState = (yield select(getAppSettingsState));
  const diContainer: Container = settings.diContainer;
  const appLocalDeviceStorage: IAppLocalDeviceStorage =
            diContainer.get<IAppLocalDeviceStorage>(DI_TYPES.IAppLocalDeviceStorage);

  yield put(appSettingsChangeActions.request());

  try {

    // call the tenant service to get the tenant configuration

    const tenantConfig: TenantConfig =
        yield call(discoverTenant, { hostname: domain, isRootDomain: true });

    const clientId = yield call(loadClientId, settings);
    let userAuthRealm = tenantConfig.userRealm;
    if (settings.appConfiguration && settings.appConfiguration.realm) {
      userAuthRealm = settings.appConfiguration.realm;
    } else if (clientId) {
      userAuthRealm = `${tenantConfig.tenantId}_clients`;
    }

    // persist tenant related settings

    yield call([appLocalDeviceStorage, "storeDomain"], domain);
    yield call([appLocalDeviceStorage, "storeTenantConfig"], tenantConfig);
    yield call([appLocalDeviceStorage, "storeAuthUrl"], tenantConfig.authUrl);
    yield call([appLocalDeviceStorage, "storeUserAuthRealm"], userAuthRealm);
    yield call([appLocalDeviceStorage, "storeServicesBaseUrl"], tenantConfig.servicesUrl);
    yield call([appLocalDeviceStorage, "storeNotificationsUrl"], tenantConfig.eventsUrl);
    yield call([appLocalDeviceStorage, "storeDataSyncUrl"], tenantConfig.dataSyncUrl);

    // configure the tenant bindings in the IoC container, etc.

    yield call(createBindingsInTenantDIContainer);
    yield call(configureAdminUserAuthentication, diContainer, userAuthRealm, clientId);

    yield put(appSettingsChangeActions.success({
      appStatus: AppStatus.PendingTerminalSettings,
      domain,
      tenantConfig,
      userAuthRealm
    }));
    yield put({ type: TENANT_SETTINGS_INITIALIZED_ACTION, payload: { }});
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(appSettingsChangeActions.failure(err));
  }
  logger.traceExit(entryMethod);
}

/**
 * Prepare the app for changing terminal settings. All terminal-level services will be stopped
 * and associated bindings removed from the IoC container. Authentication will be configured for admin
 * user authentication.
 */
export function* prepareTerminalSettingsChange(): IterableIterator<any> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("prepareTerminalSettingsChange");
  const settings: SettingsState = (yield select(getAppSettingsState));
  const diContainer: Container = settings.diContainer;
  const appLocalDeviceStorage: IAppLocalDeviceStorage =
            diContainer.get<IAppLocalDeviceStorage>(DI_TYPES.IAppLocalDeviceStorage);

  yield put(appSettingsChangeActions.request());

  try {
    const clientId = yield call(loadClientId, settings);
    const authRealm = yield call([appLocalDeviceStorage, "loadUserAuthRealm"]);

    yield call(clearTerminalDIContainer);
    yield call(configureAdminUserAuthentication, diContainer, authRealm, clientId);
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(appSettingsChangeActions.failure(err));
  }

  yield put(appSettingsChangeActions.success({
    appStatus: AppStatus.PendingTerminalSettings
  }));
  logger.traceExit(entryMethod);
}

/**
 * Get the last transaction number for the given retail location and device. It requires the TransactionAdapter so
 * the its initialization with the TransactionApi has to be done on the Tenant DI Container.
 */
export function* fetchLastTransactionNumber(action: any): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchLastTransactionNumber");
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer = settings.diContainer;
  const transactionAdapter: ITransactionAdapter = diContainer.get(FEATURES_DI_TYPES.ITransactionAdapter);

  try {
    const {retailLocationId, deviceId} = action.payload;
    const lastTransactionNumber = yield call([transactionAdapter, "getLastTransactionNumber"],
        retailLocationId, deviceId);
    if (!lastTransactionNumber || isNaN(lastTransactionNumber)) {
      yield put(getLastTransactionNumberAction.success(0));
    } else {
      yield put(getLastTransactionNumberAction.success(parseInt(lastTransactionNumber, 10)));
    }
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getLastTransactionNumberAction.failure(err));
  }
  logger.traceExit(entryMethod);
}

/**
 * Get the last sequence number for the given retail location and device for generating InvoiceNumber.
 */
async function fetchLastInvoiceSequenceNumber(diContainer: Container, retailLocationId: string,
                                              deviceId: string): Promise<void> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchLastInvoiceSequenceNumber");
  const appLocalFeaturesStorage: IAppLocalFeaturesStorage =
      diContainer.get(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);
  const sequenceAdapter: ISequenceAdapter = diContainer.get(FEATURES_DI_TYPES.ISequenceAdapter);

  try {
    const sequences = await appLocalFeaturesStorage.loadInvoiceSequenceNumber();
    if(!sequences) {
      const lastSequenceNumbers: ISequences = await sequenceAdapter.getLastInvoiceSequenceNumber(
          retailLocationId, deviceId);

      // Store the sequenceNumber in localAppStorage.
      await appLocalFeaturesStorage.storeInvoiceSequenceNumber(lastSequenceNumbers);
    }
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
  }
  logger.traceExit(entryMethod);
}

/**
 * Save the terminal settings. The terminal IoC container will be initialized, API authorization
 * will be configured to use the device credentials, and if the retail location has changed, the master
 * database will be deleted.
 */
export function* setTerminalSettings(action: StandardAction): IterableIterator<any> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("setTerminalSettings");

  const currentSettings: SettingsState = (yield select(getAppSettingsState));
  const diContainer = currentSettings.diContainer;
  const { deviceIdentity,
          configurationProfileName,
          transactionNumber,
          primaryLanguage,
          retailLocationCurrency }: Settings = action.payload;
  const replaceExistingClientRegistration: boolean = action.payload.replaceExistingClientRegistration;
  const appLocalDeviceStorage: IAppLocalDeviceStorage =
            diContainer.get<IAppLocalDeviceStorage>(DI_TYPES.IAppLocalDeviceStorage);
  const appLocalCoreStorage: IAppLocalCoreStorage =
            diContainer.get<IAppLocalCoreStorage>(CORE_DI_TYPES.IAppLocalCoreStorage);
  const appLocalFeaturesStorage: IAppLocalFeaturesStorage =
            diContainer.get<IAppLocalFeaturesStorage>(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);
  const transactionAdapter: ITransactionAdapter = diContainer.get(FEATURES_DI_TYPES.ITransactionAdapter);

  yield put(appSettingsChangeActions.request());

  try {

    // register with the client registration service
    const clientSettings: ClientSettings =
        yield call(registerClient, {diContainer, deviceIdentity}, replaceExistingClientRegistration);
    const storeChanged = currentSettings.deviceIdentity.retailLocationId &&
        deviceIdentity.retailLocationId !== currentSettings.deviceIdentity.retailLocationId;
    // persist terminal related settings
    yield call([appLocalDeviceStorage, "storeRetailLocationCurrency"], retailLocationCurrency);
    if (primaryLanguage) {
      yield call([appLocalFeaturesStorage, "storeRetailLocationLocale"], primaryLanguage);
    }
    yield call([appLocalDeviceStorage, "storeDeviceIdentity"], deviceIdentity);
    yield call([appLocalDeviceStorage, "storeConfigurationProfileName"], configurationProfileName);
    yield call([appLocalCoreStorage, "storeTransactionNumber"], transactionNumber - 1);
    yield call([appLocalDeviceStorage, "storeClientApiCredentials"], clientSettings.clientApiCredentials);
    yield call([appLocalDeviceStorage, "storeCouchbaseCredentials"], clientSettings.couchbaseCredentials);
    yield call([appLocalDeviceStorage, "storeCouchbaseEncryptionKey"], clientSettings.couchbaseEncryptionKey);
    if (clientSettings.fiscalSignatureKey) {
      yield call([appLocalFeaturesStorage, "storeFiscalSignatureKey"], clientSettings.fiscalSignatureKey);
    }
    const lastTransactionValues: LastValueDetails[] =
        yield call([transactionAdapter, "getLastTransactionValues"], deviceIdentity.deviceId,
        deviceIdentity.retailLocationId);
    if (lastTransactionValues && lastTransactionValues.length > 0) {
      yield storeTransactionLastValues(lastTransactionValues, appLocalFeaturesStorage);
    }

    const skipDbDownload = EnvFileDefinitions.SKIP_PREBUILT_DB_DOWNLOAD &&
        EnvFileDefinitions.SKIP_PREBUILT_DB_DOWNLOAD.toLowerCase() === "true";
    if (!skipDbDownload && !(yield call(Database.exists, "master"))) {
      const databaseDownloadUrl = EnvFileDefinitions.MASTER_DB_DOWNLOAD_URL || clientSettings.couchbaseDbDownloadUrl;

      yield call(downloadDatabase, "master", databaseDownloadUrl);
    }

    // bind the IoC container and initialize all terminal related services and objects
    yield call(configureTerminal, diContainer, deviceIdentity, storeChanged);
    yield put(appSettingsChangeActions.success({
      appStatus: AppStatus.Ready,
      ...action.payload,
      transactionNumber: Number(transactionNumber - 1).toString(10),
      primaryLanguage,
      retailLocationCurrency,
      configurationManager: diContainer.get<IConfigurationManager>(CORE_DI_TYPES.IConfigurationManager)
    }));

    yield call(dispatchPostTerminalConfigActions, deviceIdentity);

    yield call(getExchangeRates, diContainer);

    //set terminal settings to LogManager. The  below information with log with all messages
    const loggingContext: ILoggingContext = {
      retailLocationId: deviceIdentity.retailLocationId,
      deviceId: deviceIdentity.deviceId,
      tenantId: deviceIdentity.tenantId
    };
    LogManager.setLoggingContext(loggingContext);
    logger.debug("Terminal Settings Done !!");
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(appSettingsChangeActions.failure(err));
  }

  logger.traceExit(entryMethod);
}

export function* watchInitAppSettings(): SagaIterator {
  yield takeEvery(INIT_APP_SETTINGS_ACTION, initAppSettings);
}

export function* watchSetTenantSettings(): SagaIterator {
  yield takeEvery(SET_TENANT_SETTINGS_ACTION, setTenantSettings);
}

export function* watchPrepareTerminalSettingsChange(): SagaIterator {
  yield takeEvery(PREPARE_TERMINAL_SETTINGS_CHANGE_ACTION, prepareTerminalSettingsChange);
}

export function* watchGetLastTransactionNumber(): SagaIterator {
  yield takeEvery(APP_SETTING_GET_LAST_TRANSACTION_NUMBER_ACTION.REQUEST, fetchLastTransactionNumber);
}

export function* watchSetTerminalSettings(): SagaIterator {
  yield takeEvery(SET_TERMINAL_SETTINGS_ACTION, setTerminalSettings);
}
