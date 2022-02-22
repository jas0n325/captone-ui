import { Container } from "inversify";

import { TenantConfig } from "@aptos-scp/scp-component-rn-auth";
import { DeviceIdentity, IConfigurationManager, LanguageFields } from "@aptos-scp/scp-component-store-selling-core";
import { IRetailLocation } from "@aptos-scp/scp-component-store-selling-features";
import { ExchangeRate } from "@aptos-scp/scp-types-currency-conversion";

import { ITranslations } from "../../config";
import { defineRequestType, RequestType, StandardAction } from "./actions";

/*
on startup -
root container componentdidmount dispatches INIT_APP_SETTINGS_ACTION
- create container hierarchy
- init app container
- if we have tenant info init tenant container
- if we have device info init device container and device auth
root container componentwillreceiveprops waits on settings reducer succeeded, shows

if no tenant, show domain screen...

on select tenant - SET_TENANT_ACTION
- lookup tenant
- save domain
- init tenant container


if no terminal or user chooses settings...

PREPARE_TERMINAL_SETTINGS_CHANGE_ACTION
- clear terminal container
- init admin user auth
- get stores - GET_RETAIL_LOCATIONS_ACTION

show settings screen...

SET_TERMINAL_SETTINGS_ACTION
on change settings
- save settings
- init terminal container
- delete master DB if store changed
- init device auth
*/

/**
 * Action fired when the core app settings have been initialized.
 */
export const APP_SETTINGS_INITIALIZED_ACTION = "APP_INITIALIZED";

/**
 * Action fired when the tenant related settings have been initialized.
 */
export const TENANT_SETTINGS_INITIALIZED_ACTION = "TENANT_INITIALIZED";

/**
 * Action fired when the terminal related settings have been initialized.
 */
export const TERMINAL_SETTINGS_INITIALIZED_ACTION = "TERMINAL_INITIALIZED";

/**
 * See getLastTransactionNumberAction
 */
export const APP_SETTING_GET_LAST_TRANSACTION_NUMBER_ACTION: RequestType =
    defineRequestType("APP_SETTING_GET_LAST_TRANSACTION_NUMBER");

/**
 * See getLastSequenceNumberAction
 */
export const APP_SETTING_GET_LAST_SEQUENCE_NUMBER_ACTION: RequestType =
    defineRequestType("APP_SETTING_GET_LAST_SEQUENCE_NUMBER");

/**
 * See appSettingsChangeActions.
 */
export const APP_SETTING_CHANGE_ACTIONS: RequestType = defineRequestType("APP_SETTINGS_CHANGE_ACTION");

/**
 * See getExchangeRatesAction
 */
export const APP_SETTING_GET_EXCHANGE_RATES_ACTION: RequestType =
    defineRequestType("APP_SETTING_GET_EXCHANGE_RATES_ACTION");

/**
 * This app has a somewhat complicated initialization process, since we have to identify a tenant and then provision
 * the terminal (store, terminal number, etc.) before it's operational. These status codes provide a way to easily
 * determine the current initialization status of the app.
 */
export enum AppStatus {
  /**
   * The app is completely ininitialized.
   */
  Uninitialized = "UNINITIALIZED",

  /**
   * Core initialization is completed, but no tenant has been selected.
   */
  PendingTenantSettings = "PENDING_TENANT_SETTINGS",

  /**
   * The app is setup with a tenant association, but is pending changes to terminal-level settings.
   */
  PendingTerminalSettings = "PENDING_TERMINAL_SETTINGS",

  PendingDatabaseDownload = "PENDING_DATABASE_DOWNLOAD",

  PendingCouchabaseIndexesCreate = "PENDING_COUCHBASE_INDEXES_CREATE",

  ClearLastScreen = "CLEAR_LAST_SCREEN",
  /**
   * The app is fully setup and ready to operate.
   */
  Ready = "READY"
}

export interface UiStyling {
  styles: any;
  appLogo: string | { uri: string };
  loginLogo: string | { uri: string };
  attendantModeToggleButtonImage: string | { uri: string };
}

export interface AppConfiguration {
  realm?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  platformDomain?: string;
  retailLocationId?: string;
  deviceId?: string;
}

/**
 * The app settings state for appSettingsChangeActions.
 */
export interface Settings {
  appStatus?: AppStatus;
  appConfiguration?: AppConfiguration;
  domain?: string;
  tenantConfig?: TenantConfig;
  diContainer?: Container;
  deviceIdentity?: DeviceIdentity;
  userAuthRealm?: string;
  transactionNumber?: number;
  /** @deprecated Remove when config V1 is no longer supported */
  configurationProfileName?: string;
  configurationManager?: IConfigurationManager;
  retailLocation?: IRetailLocation;
  uiStyling?: UiStyling;
  primaryLanguage?: string;
  translations?: ITranslations;
  retailLocationCurrency?: string;
  languages?: LanguageFields[];
}

/**
 * An action that indicates app settings are being changed. You shouldn't normally invoke this directly. It
 * will be invoked as a side-effect of other settings/config related actions.
 */
export const appSettingsChangeActions = {
  request: (): StandardAction => {
    return {
      type: APP_SETTING_CHANGE_ACTIONS.REQUEST,
      payload: { }
    };
  },
  success: (settings: Settings): StandardAction => {
    return {
      type: APP_SETTING_CHANGE_ACTIONS.SUCCESS,
      payload: settings
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: APP_SETTING_CHANGE_ACTIONS.FAILURE,
      payload: {
        error
      }
    };
  }
};

/**
 * An action that returns the last transaction number for the given retail location and device Id.
 */
export const getLastTransactionNumberAction = {
  request: (retailLocationId: string, deviceId: string): StandardAction => {
    return {
      type: APP_SETTING_GET_LAST_TRANSACTION_NUMBER_ACTION.REQUEST,
      payload: {retailLocationId, deviceId}
    };
  },
  success: (transactionNumber: number): StandardAction => {
    return {
      type: APP_SETTING_GET_LAST_TRANSACTION_NUMBER_ACTION.SUCCESS,
      payload: {
        transactionNumber
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: APP_SETTING_GET_LAST_TRANSACTION_NUMBER_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};

/**
 * An action that returns the exchange rates for the local currency
 */
export const getExchangeRatesAction = {
  request: (currency: string): StandardAction => ({
      type: APP_SETTING_GET_EXCHANGE_RATES_ACTION.REQUEST,
      payload: { currency }
    }),
  success: (exchangeRates: ExchangeRate[]): StandardAction => ({
      type: APP_SETTING_GET_EXCHANGE_RATES_ACTION.SUCCESS,
      payload: { exchangeRates }
    }),
  failure: (error: Error): StandardAction => ({
      type: APP_SETTING_GET_EXCHANGE_RATES_ACTION.FAILURE,
      payload: { error }
    })
};

/**
 * Updates the transaction number in the redux state.
 */
export const updateTransactionNumberSettingsAction = (transactionNumber: number): StandardAction => {
  return {
    type: APP_SETTING_CHANGE_ACTIONS.SUCCESS,
    payload: {
      transactionNumber
    }
  };
};


/**
 * See initAppSettingsAction.
 */
export const INIT_APP_SETTINGS_ACTION = "INIT_APP_SETTINGS";

/**
 * An action to initialize the application settings, which will load settings from storage and
 * initialize IoC container and objects/classes bound to it. If the app has been fully provisioned
 * it will then be ready to operate, otherwise it will be awaiting tenant and/or terminal provisioning.
 */
export const initAppSettingsAction = (isTablet: boolean): StandardAction => {
  return {
    type: INIT_APP_SETTINGS_ACTION,
    payload: {isTablet}
  };
};

/**
 * See setTenantAction.
 */
export const SET_TENANT_SETTINGS_ACTION = "SET_TENANT";

/**
 * An action to set the tenant. This should be invoked after the user has entered a domain. This will
 * discover the tenant based on a provided DNS domain, save the domain if valid, and then initialize
 * the tenant-level bindings for the IoC container, at which point the app is ready for terminal provisioning.
 */
export const setTenantSettingsAction = (domain: string ): StandardAction => {
  return {
    type: SET_TENANT_SETTINGS_ACTION,
    payload: {
      domain
    }
  };
};

/**
 * See prepareTerminalSettingsChangeAction.
 */
export const PREPARE_TERMINAL_SETTINGS_CHANGE_ACTION = "PREPARE_TERMINAL_SETTINGS_CHANGE";

/**
 * An action to prepare the app for changing terminal settings. All terminal-level services will be stopped
 * and associated bindings removed from the IoC container. Authentication will be configured for admin
 * user authentication.
 */
export const prepareTerminalSettingsChangeAction = (): StandardAction => {
  return {
    type: PREPARE_TERMINAL_SETTINGS_CHANGE_ACTION,
    payload: { }
  };
};

/**
 * See setTerminalSettingsAction.
 */
export const SET_TERMINAL_SETTINGS_ACTION = "SET_TERMINAL_SETTINGS";

/**
 * An action to save the terminal settings. The terminal IoC container will be initialized, API authorization
 * will be configured to use the device credentials, and if the retail location has changed, the master
 * database will be deleted.
 */
export const setTerminalSettingsAction = (settings: {
  deviceIdentity: DeviceIdentity,
  transactionNumber: string,
  configurationProfileName: string,
  replaceExistingClientRegistration?: boolean
}): StandardAction => {
    return {
      type: SET_TERMINAL_SETTINGS_ACTION,
      payload: settings
    };
};

/**
 * See cancelTerminalSettingsActions.
 */
export const CANCEL_TERMINAL_SETTINGS_ACTION = "CANCEL_TERMINAL_SETTINGS";

/**
 * An action to cancel changes to terminal settings. This actually just dispatches the app settings init action,
 * which should restore the existing settings if they exist, or just log out the user otherwise.
 */
export const cancelTerminalSettingsAction = (): StandardAction => {
  return {
    type: INIT_APP_SETTINGS_ACTION,
    payload: { }
  };
};

