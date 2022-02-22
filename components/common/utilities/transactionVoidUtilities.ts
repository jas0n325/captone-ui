import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { IFeatureAccessConfig, POST_VOID_TRANSACTION_EVENT } from "@aptos-scp/scp-component-store-selling-features";
import { getFeatureAccessConfig } from "./configurationUtils";


export function printVoidTransactionReceipt(configurationManager: IConfigurationManager): boolean {
  const event: IFeatureAccessConfig = getFeatureAccessConfig(configurationManager, "VoidTransaction");
  return event && event.printReceipt;
}

export function printPostVoidTransactionReceipt(configurationManager: IConfigurationManager): boolean {
  const event: IFeatureAccessConfig = getFeatureAccessConfig(configurationManager, POST_VOID_TRANSACTION_EVENT);
  return event && (event.printReceipt || event.printCustomerReceipt);
}
