import { Container } from "inversify";
import { isEmpty } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  DI_TYPES as FEATURE_DI_TYPES,
  ITaxAuthoritiesForExemption,
  ITaxAuthorityAdapter,
  ITaxBehaviorConfig
} from "@aptos-scp/scp-component-store-selling-features";

import {
  loadTaxAuthoritiesForExemption,
  LOAD_TAX_AUTHORITIES_FOR_EXEMPT,
  StandardAction
} from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.taxAuthorities");

function matchIds(checkIds: string[], lookupIds: string[]): boolean {
  return !!checkIds && !!lookupIds &&
      !checkIds.find((x: string) => !lookupIds.some((y: string) => x === y));
}

function* handleLoadTaxAuthorities(action: StandardAction): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("handleValidTaxAuthorities");
  try {
    const settings: SettingsState = yield select(getAppSettingsState);
    const diContainer: Container = settings.diContainer;
    const configurationManager: IConfigurationManager = settings.configurationManager;
    const taxAuthorityAdapter: ITaxAuthorityAdapter = diContainer.get(FEATURE_DI_TYPES.ITaxAuthorityAdapter);

    const taxBehavior = configurationManager.getFunctionalBehaviorValues().taxBehavior as ITaxBehaviorConfig;
    const taxAuthoritiesForExemption = taxBehavior && taxBehavior.taxAuthoritiesForExemption;
    let validTaxAuthorities: ITaxAuthoritiesForExemption[] = undefined;
    if (taxAuthoritiesForExemption) {
      const validAuthorityIds: string[] =
          yield(call([taxAuthorityAdapter, "getTaxAuthorities"], settings.deviceIdentity));
      if (validAuthorityIds) {
        validTaxAuthorities = taxAuthoritiesForExemption.filter((x: ITaxAuthoritiesForExemption) =>
            matchIds(x.taxAuthorityIds, validAuthorityIds));
        validTaxAuthorities = !isEmpty(validTaxAuthorities) ? validTaxAuthorities : undefined;
      }
    }
    yield put(loadTaxAuthoritiesForExemption.success(validTaxAuthorities));
  } catch (error) {
    yield put(loadTaxAuthoritiesForExemption.failure(error));
  }

  logger.traceExit(entryMethod);
}

export function* watchLoadTaxAuthorities(): SagaIterator {
  yield takeEvery(LOAD_TAX_AUTHORITIES_FOR_EXEMPT.REQUEST, handleLoadTaxAuthorities);
}
