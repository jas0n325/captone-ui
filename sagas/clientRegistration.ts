import EnvFileDefinitions from "react-native-config";
import { getUniqueId } from "react-native-device-info";
import * as uuid from "uuid";

import { LocalizableMessage } from "@aptos-scp/scp-component-business-core";
import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { PosBusinessError, SSC_SERVICE_TIMEOUT_ERROR_CODE } from "@aptos-scp/scp-component-store-selling-core";
import {
  Client,
  ClientFilters,
  ClientRegistrationRequestBody,
  DI_TYPES as FEATURES_DI_TYPES,
  IClientRegistrationApi
} from "@aptos-scp/scp-component-store-selling-features";
import { PublicPrivateKeyPair } from "@aptos-scp/scp-types-client-registration";

import { DI_TYPES } from "../../config";
import { AuthClientApiCredentials } from "../../config/ClientApiCredentials";
import {
  CLIENT_REGISTRATION_ERROR_CODE,
  CLIENT_REGISTRATION_ERROR_I18N_CODE,
  CLIENT_REGISTRATION_ERROR_TIMEOUT_I18N_CODE,
  CLIENT_REGISTRATION_TIMEOUT_ERROR_CODE,
  GET_CLIENT_REGISTRATION_ERROR_CODE,
  GET_CLIENT_REGISTRATION_ERROR_I18N_CODE,
  GET_CLIENT_REGISTRATION_ERROR_TIMEOUT_I18N_CODE,
  GET_CLIENT_REGISTRATION_TIMEOUT_ERROR_CODE
} from "../../config/ErrorCodes";
import { IAppLocalDeviceStorage } from "../../persistence/IAppLocalDeviceStorage";
import { Settings } from "../actions";
import { Container } from "inversify";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.registerClient");

export async function registerClient(currentSettings: Settings,
                                     replaceExistingClientRegistration?: boolean): Promise<ClientSettings> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("registerClient", currentSettings);
  const diContainer = currentSettings.diContainer;
  const clientRegistrationApi: IClientRegistrationApi = diContainer.get(FEATURES_DI_TYPES.IClientRegistrationApi);
  const getCouchbaseEncryptionKey = async (): Promise<string> => {
    const appLocalDeviceStorage = diContainer.get<IAppLocalDeviceStorage>(DI_TYPES.IAppLocalDeviceStorage);
    let encryptionKey = await appLocalDeviceStorage.loadCouchbaseEncryptionKey();
    if (!encryptionKey) {
      encryptionKey = uuid.v4();
    }
    return encryptionKey;
  };
  const registrationRequest: ClientRegistrationRequestBody = {
    appId: currentSettings.deviceIdentity.applicationId,
    location: currentSettings.deviceIdentity.retailLocationId,
    terminalId: currentSettings.deviceIdentity.deviceId,
    physicalDeviceId: getUniqueId(),
    replaceExisting: replaceExistingClientRegistration || false
  };

  try {
    const result: Client = await clientRegistrationApi.registerClient(registrationRequest);
    const couchbaseEncryptionKey: string = await getCouchbaseEncryptionKey();
    // EnvFileDefinitions.P2PUSERNAME & P2PPASSWORD are only for dev use only and can be set in .env.dev
    const clientSettings = {
      clientApiCredentials: {
        realm: result.tenantId + "_clients",
        grantType: result.authCredentials.grantType,
        id: result.authCredentials.id,
        authorization: result.authCredentials.secret
      },
      couchbaseCredentials: {
        syncGateway: {
          username: result.syncCredentials.username,
          password: result.syncCredentials.password
        },
        local: {
          username: EnvFileDefinitions.P2PUSERNAME || result.p2pCredentials.username,
          password: EnvFileDefinitions.P2PPASSWORD || result.p2pCredentials.password
        }
      },
      couchbaseEncryptionKey,
      couchbaseDbDownloadUrl: result.dbDownloadUrl,
      fiscalSignatureKey: result.fiscalSignatureKey
    };

    const cloneClientSettings = JSON.parse(JSON.stringify(clientSettings));
    delete cloneClientSettings.clientApiCredentials.authorization;
    delete cloneClientSettings.couchbaseCredentials;
    delete cloneClientSettings.couchbaseEncryptionKey;
    delete cloneClientSettings.fiscalSignatureKey;
    logger.debug(`after ==> calling adaptor.registerClient ==> ${JSON.stringify(cloneClientSettings)}`);

    return logger.traceExit(entryMethod, clientSettings);
  } catch (err) {
    if (err.cause?.errorCode === SSC_SERVICE_TIMEOUT_ERROR_CODE) {
      throw logger.throwing(new PosBusinessError(new LocalizableMessage(CLIENT_REGISTRATION_ERROR_TIMEOUT_I18N_CODE),
        err.message, CLIENT_REGISTRATION_TIMEOUT_ERROR_CODE, err), entryMethod);
    } else {
      throw logger.throwing(new PosBusinessError(new LocalizableMessage(CLIENT_REGISTRATION_ERROR_I18N_CODE),
        `Error caught while registering the client: ${err}`, CLIENT_REGISTRATION_ERROR_CODE, err), entryMethod);
    }
  }
}

export async function getClientDbDownloadUrl(diContainer: Container, clientFilters: ClientFilters): Promise<ClientSettings> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("getClientDbDownloadUrl", clientFilters);
  const clientRegistrationApi: IClientRegistrationApi = diContainer.get(FEATURES_DI_TYPES.IClientRegistrationApi);

  try {
    const includeDbDownloadUrl = true;
    const result = await clientRegistrationApi.getClients(clientFilters, includeDbDownloadUrl);
    if (!result || result.totalCount < 1 || result.data.length < 1) {
      logger.error(`unable to retrieve client registration using filter: ${JSON.stringify(clientFilters)}`);
    }
    let couchbaseDbDownloadUrl: string;

    if (result.data[0]) {
      couchbaseDbDownloadUrl = result.data[0].dbDownloadUrl;
    }

    logger.debug(`after ==> calling adaptor.getClient ==> couchbaseDbDownloadUrl: ${couchbaseDbDownloadUrl.split("?")[0]}`);
    return logger.traceExit(entryMethod, couchbaseDbDownloadUrl);
  } catch (err) {
    if (err.cause?.errorCode === SSC_SERVICE_TIMEOUT_ERROR_CODE) {
      throw logger.throwing(new PosBusinessError(new LocalizableMessage(GET_CLIENT_REGISTRATION_ERROR_TIMEOUT_I18N_CODE),
        err.message, GET_CLIENT_REGISTRATION_TIMEOUT_ERROR_CODE, err), entryMethod);
    } else {
      throw logger.throwing(new PosBusinessError(new LocalizableMessage(GET_CLIENT_REGISTRATION_ERROR_I18N_CODE),
        `Error caught while getting the client: ${err}`, GET_CLIENT_REGISTRATION_ERROR_CODE, err), entryMethod);
    }
  }
}

export interface ClientSettings {
  clientApiCredentials: AuthClientApiCredentials;
  couchbaseCredentials: CouchbaseCredentials;
  couchbaseEncryptionKey: string;
  couchbaseDbDownloadUrl: string;
  fiscalSignatureKey?: PublicPrivateKeyPair;
}

/**
 * Represents the credentials used to login to Couchbase Sync gateway and to use for the local Couchbase Lite
 * Listener.
 */
export interface CouchbaseCredentials {
  syncGateway: {
    username: string;
    password: string;
  };
  local: {
    username: string;
    password: string;
  };
}


