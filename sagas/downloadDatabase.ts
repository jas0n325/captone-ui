import {LogManager} from "@aptos-scp/scp-component-logging";
import {
  addDatabaseDownloadListener,
  DatabaseDownloadProgress,
  DatabaseDownloadStatus,
  downloadDatabaseFile,
  installDatabaseFromFile
} from "@aptos-scp/scp-component-rn-datasync";
import {all, call, put } from "redux-saga/effects";
import {appSettingsChangeActions, AppStatus} from "../actions";

const logger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.downloaddatabase");

function monitorFirstDownloadProgressEvent(databaseName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const removeEventSubscription = addDatabaseDownloadListener((progress: DatabaseDownloadProgress): void => {
      if (progress.databaseName === databaseName) {
        removeEventSubscription();
        resolve(progress.status === DatabaseDownloadStatus.downloading);
      }
    });
  });
}

function* monitorDownloadStart(databaseName: string): IterableIterator<any> {
  if (yield call(monitorFirstDownloadProgressEvent, databaseName)) {
    yield put(appSettingsChangeActions.success({
      appStatus: AppStatus.PendingDatabaseDownload
    }));
  }
}

/**
 * Attempts to download a Couchbase Lite database from a URL, dispatching an app settings change action if
 * the download starts successfully.
 */
export function* downloadDatabase(databaseName: string, url: string): IterableIterator<any> {
  if (url) {
    const urlWithoutSignature = url.split("?")[0];
    logger.info(`Starting ${databaseName} database download from ${urlWithoutSignature}`);
    const results: any = yield all([
      call(monitorDownloadStart, "master"),
      call(downloadDatabaseFile, "master", url)
    ]);
    const databaseFile = results[1];
    if (databaseFile) {
      logger.info(`Installing ${databaseName} database file ${databaseFile}`);
      try {
        yield call(installDatabaseFromFile, "master", databaseFile);
      } catch (err) {
        logger.error(`Error installing ${databaseName} database downloaded from ${urlWithoutSignature}`, err);
        return false;
      }
    } else {
      logger.info(`${databaseName} database not downloaded from ${urlWithoutSignature}`);
      return false;
    }
    return true;
  }
}
