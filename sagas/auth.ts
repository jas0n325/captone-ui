import { EventSubscription } from "fbemitter";
import { Container } from "inversify";
import EnvFileDefinitions from "react-native-config";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  AuthError,
  AuthInstance,
  ClientCredential,
  RNAuthLogoutOptions,
  UsernamePasswordCredential
} from "@aptos-scp/scp-component-rn-auth";
import { IUrlType } from "@aptos-scp/scp-component-store-selling-core";

import { AuthClientApiCredentials, PasswordClientApiCredentials } from "../../config/ClientApiCredentials";
import DI_TYPES from "../../config/DiTypes";
import { getUrlTypes } from "../../config/inversify/inversify.terminal.config/urls.config";
import { IAppLocalDeviceStorage } from "../../persistence/IAppLocalDeviceStorage";
import { updateAppAccessLock } from "../actions";
import store from "../reduxStore";

const MIN_REMAINING_TOKEN_VALIDITY_SEC = 10;	// get a fresh token if less than 10 sec remaining before expiry


let authLoginSubscription: EventSubscription;
let authLogoutSubscription: EventSubscription;
let authErrorSubscription: EventSubscription;
let authRefreshErrorSubscription: EventSubscription;

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.auth");

const addUrlPattern = (pattern: string, baseUrl: string, diContainer: Container, name: symbol): string => {
  const url = diContainer.get<string>(name);

  // if the service's URL isn't derived from the base service URL, add it to the regular expression

  if (url && url.indexOf(baseUrl) !== 0) {
    return `${pattern}|(^${url.replace(/\./g, "\\.")})`;
  }
  return pattern;
};

const createUrlPattern = (diContainer: Container, servicesUrl: string): string => {
  let pattern = `(^${servicesUrl.replace(/\./g, "\\.")})`;

  const authUrlTypes = getUrlTypes(true, (u: IUrlType) => u.requiresAuthInterceptor)
      .map((u: IUrlType) => u.type);

  authUrlTypes.forEach((authUrlType: symbol) => {
    pattern = addUrlPattern(pattern, servicesUrl, diContainer, authUrlType);
  });
  return pattern;
};

const interceptXhr = (auth: AuthInstance) => {
  const oldXHROpen =  XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function():any {
    const res = oldXHROpen.apply(this, arguments);
    if (auth.token) {
    this.setRequestHeader("Authorization", "Bearer " + auth.token);
    }
    return res;
  };
};

const ensureLoggedOut = (auth: AuthInstance, logoutOptions: RNAuthLogoutOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (auth.authenticated) {
      let errListener: EventSubscription;
      const listener = auth.addLogoutListener(() => {
        errListener.remove();
        listener.remove();
        resolve();
      });
      errListener = auth.addLogoutErrorListener(() => {
        errListener.remove();
        listener.remove();
        reject(new Error("Logout failed"));
      });
      auth.logout(logoutOptions);
    } else {
      resolve();
    }
  });
};

const removeListeners = (): void => {
  if (authLoginSubscription) {
    authLoginSubscription.remove();
    authLoginSubscription = undefined;
  }
  if (authLogoutSubscription) {
    authLogoutSubscription.remove();
    authLogoutSubscription = undefined;
  }
  if (authErrorSubscription) {
    authErrorSubscription.remove();
    authErrorSubscription = undefined;
  }
  if (authRefreshErrorSubscription) {
    authRefreshErrorSubscription.remove();
    authRefreshErrorSubscription = undefined;
  }
};

/**
 * Configures the auth client to perform "terminal" authentication using the client credentials provided
 * during client registration. This is the normal authentication scheme after the device has been provisioned.
 *
 * FIXME: This is wonky due to the fact that we actually have two different user sessions:
 * one using the device credentials, which is used by background transaction posting (and possibly other things), and
 * another for a logged in user (which is currently only used during the provisioning step.) There's currently no
 * way for the fetch interceptor to know which user session should be used for a given request, so we basically
 * kill all terminal services that depend on the device credential when we go into settings so the admin user can log
 * in and perform requests, and then restart them after done with settings. It would be better if we could handle the
 * two sessions and know which credential to apply to each request, perhaps via a flag added to the request metadata.
 */
export const configureTerminalAuthentication = async (diContainer: Container): Promise<void> => {
  // TODO - use secure storage for credentials
  const appLocalDeviceStorage = diContainer.get<IAppLocalDeviceStorage>(DI_TYPES.IAppLocalDeviceStorage);
  const clientApiCredentials = await appLocalDeviceStorage.loadClientApiCredentials();
  const servicesUrl = EnvFileDefinitions.SERVICES_BASE_URL || await appLocalDeviceStorage.loadServicesBaseUrl();
  const auth = diContainer.get<AuthInstance>(DI_TYPES.AuthClient);
  const url = diContainer.get<string>(DI_TYPES.AuthUrl);
  const pattern = createUrlPattern(diContainer, servicesUrl);

  await ensureLoggedOut(auth, {
    useDirectLogout: true,
    redirectUri: diContainer.get(DI_TYPES.AuthRedirectUrl)
  });
  removeListeners();

  let credentialsObject: UsernamePasswordCredential | ClientCredential;
  let credentialsId = null;
  if (clientApiCredentials.hasOwnProperty("password")) {
    // v1 clientRegistration
    const responseV1 = clientApiCredentials as PasswordClientApiCredentials;
    credentialsObject = {
      username: responseV1.username,
      password: responseV1.password
    };
  } else {
    //v2 clientRegistration
    const responseV2 = clientApiCredentials as AuthClientApiCredentials;
    credentialsObject = {
      clientSecret: responseV2.authorization
    };
    credentialsId = responseV2.id;
  }

  // Adds an interceptor to 'xmlHttpRequest' that adds the access token as a bearer token in the Authorization header
  // to matching requests.
  interceptXhr(auth);

  // Establish auth interceptor with credentials so it can perform login when token refreshing fails
  // On first remote request, this interceptor will detect stale/missing token and handle login for us.
  auth.interceptFetch(new RegExp(pattern), MIN_REMAINING_TOKEN_VALIDITY_SEC, {
    credentials: credentialsObject
  });

  authErrorSubscription = auth.addAuthErrorListener((err: AuthError) => {
    // FIXME: See JIRA ZSPFLD-2093.  Login failing b/c bad credentials?  Device should be reprovisioned.
    // FIXME: ZSPFLD-2188 - We can't log an error here because the logstash appender triggers another token refresh
    // err.stack on xcode shows stack only, while on chrome debugger shows message and stack.  Using message and
    // stack together even though it will be redundant to ensure we get the proper error information (only console.log)
//    logger.error(() => `Terminal user authentication error: ${err.stack}`);
    store.dispatch(updateAppAccessLock.request(err));
    // tslint:disable-next-line:no-console
    console.info(`Terminal user authentication error: ${err.message} ${err.stack}`);
  });

  authRefreshErrorSubscription = auth.addRefreshErrorListener((err: AuthError) => {
    // FIXME: ZSPFLD-2188 - We can't log an error here because the logstash appender triggers another token refresh
//    logger.error(() => `Terminal user authorization token refresh error: ${err.stack}`);
    store.dispatch(updateAppAccessLock.request(err));
    // tslint:disable-next-line:no-console
    console.info(`Terminal user authorization token refresh error: ${err.message} ${err.stack}`);
  });

  await auth.init({
    url,
    clientId: credentialsId || EnvFileDefinitions.AUTH_CLIENT_ID,
    realm: clientApiCredentials.realm
  });
};

/**
 * Configures the auth client to authenticate an "administrative" user who has permission to provision the
 * device. This is the authentication scheme used when changing device settings.
 */
export const configureAdminUserAuthentication = async (diContainer: Container, realm: string, clientId?: string):
    Promise<void> => {
  // TODO - use secure storage for credentials
  const appLocalDeviceStorage = diContainer.get<IAppLocalDeviceStorage>(DI_TYPES.IAppLocalDeviceStorage);
  const servicesUrl = EnvFileDefinitions.SERVICES_BASE_URL || await appLocalDeviceStorage.loadServicesBaseUrl();
  const url = diContainer.get<string>(DI_TYPES.AuthUrl);
  const auth = diContainer.get<AuthInstance>(DI_TYPES.AuthClient);
  const pattern = createUrlPattern(diContainer, servicesUrl);

  await ensureLoggedOut(auth, {
    useDirectLogout: true,
    redirectUri: diContainer.get(DI_TYPES.AuthRedirectUrl)
  });
  removeListeners();

  // Add a listener that re-establishes the fetch intercepter each time the user is logged in
  authLoginSubscription = auth.addAuthListener(() => {
    auth.interceptFetch(new RegExp(pattern), MIN_REMAINING_TOKEN_VALIDITY_SEC);
  });

  authErrorSubscription = auth.addAuthErrorListener((err: AuthError) => {
    logger.error(() => `Admin user authentication error: ${err.stack}`);
  });

  authRefreshErrorSubscription = auth.addRefreshErrorListener((err: AuthError) => {
    logger.error(() => `Admin user authorization token refresh error: ${err.stack}`);
  });

  await auth.init({
    url,
    clientId: clientId || EnvFileDefinitions.AUTH_CLIENT_ID,
    realm
  });
};
