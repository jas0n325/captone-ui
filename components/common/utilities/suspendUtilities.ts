import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";


export function promptForReferenceIdOnSuspend(configurationManager: IConfigurationManager): boolean {
  try {
    return !!configurationManager.getFunctionalBehaviorValues().suspendResumeTransaction.promptForReferenceIdOnSuspend;
  } catch (error) {
    return true; // Default: Yes
  }
}

export function resumeTokenLength(configurationManager: IConfigurationManager): number {
  try {
    return configurationManager.getFunctionalBehaviorValues().suspendResumeTransaction.referenceIdFieldLength;
  } catch (error) {
    return 0; // Default: 0
  }
}

export function printSuspendedReceipt(configurationManager: IConfigurationManager): boolean {
  try {
    return !!configurationManager.getFunctionalBehaviorValues().suspendResumeTransaction.printSuspendReceipt;
  } catch (error) {
    return true; // Default: Yes
  }
}

// Resume Suspended Transactions
export function promptForConfirmationOnResume(configurationManager: IConfigurationManager): boolean {
  try {
    return true;
  } catch (error) {
    return true; // Default: Yes
  }
}
