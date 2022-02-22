import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { ITerminalSettingsManager } from "@aptos-scp/scp-component-store-selling-core";
import { SettingsSchema } from "@aptos-scp/scp-types-terminal-settings";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.common.utilities.terminalSettingsUtils");

const enum enCompareVersions {
  lessThan = -1,
  equalTo = 0,
  greaterThan = 1
}

export async function isSSAAppVersionBlocked(appVersion: string, terminalSettingsManager: ITerminalSettingsManager): Promise<boolean> {
  const tenantSettings: SettingsSchema[] = await terminalSettingsManager.getSettings("Terminal_Restrictions");
  const rangesToBlock: string[] = tenantSettings?.[0]?.settingsObject?.blockedAppVersions || [];
  for (const versions of rangesToBlock) {
    if (versions && doesVersionBelongToRange(appVersion, versions)) {
      return true;
    }
  }
  return false;
}

function doesVersionBelongToRange(version: string, ranges: string): boolean {
  const versions = ranges.split("-");
  if (versions.length === 1) {
    if (!isValidVersion(versions[0])) {
      logger.debug(() =>
          `Invalid version ${versions[0]} is retrieved from global settings, unable to compare it with app version`);
    }
    return version.trim() === versions[0].trim();
  } else if (versions.length === 2) {
    if (!isValidVersion(versions[0])) {
      logger.debug(() =>
          `Invalid version ${versions[0]} is retrieved from global settings, unable to compare it with app version`);
      return false;
    }
    if (!isValidVersion(versions[1])) {
      logger.debug(() =>
          `Invalid version ${versions[1]} is retrieved from global settings, unable to compare it with app version`);
      return false;
    }
    return compareVersions(version, versions[0]) !== enCompareVersions.lessThan &&
        compareVersions(versions[1], version) !== enCompareVersions.lessThan;
  } else {
    logger.warn(() =>
      `Invalid version range: ${ranges}, range should only contain a start and end (example 1.0.0-1.2.0)`);
  }
  return false;
}

function isValidVersion(version: string): boolean {
  const parts = version.split(".");
  let s: string;
  for (s in parts) {
    if (isNaN(parseInt(s, 10))) {
      return false;
    }
  }
  return true;
}

/**
 * compare 2 version numbers:
 * - if v1 > v2 return enCompareVersions.greaterThan (1)
 * - if v1 = v2 return enCompareVersions.equalTo (0)
 * - if v1 < v2 return enCompareVersions.lessThan (-1)
 * @param v1 the first version
 * @param v2 the second version
 */
function compareVersions(v1: string, v2: string): enCompareVersions {
  const parts1 = v1.split(".");
  const parts2 = v2.split(".");
  const noOfParts = Math.min(parts1.length, parts2.length);
  let i: number;
  for (i = 0; i < noOfParts; i++) {
    const n1 = parseInt(parts1[i], 10);
    const n2 = parseInt(parts2[i], 10);
    if (n1 > n2) {
      return enCompareVersions.greaterThan;
    }
    if (n1 < n2) {
      return enCompareVersions.lessThan;
    }
  }
  return parts1.length === parts2.length ? enCompareVersions.equalTo :
      parts1.length > parts2.length ? enCompareVersions.greaterThan : enCompareVersions.lessThan;
}
