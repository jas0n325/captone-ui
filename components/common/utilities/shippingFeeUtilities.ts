import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { ShippingMethod } from "../../shipping/ShippingMethodScreen";

export function getShippingFeesConfig(configurationManager: IConfigurationManager): any {
  const feesConfig = configurationManager.getStoreShippingMethodsValues();
  let shippingFeesConfig: ShippingMethod[] = feesConfig && feesConfig.shippingMethods ? feesConfig.shippingMethods : undefined;
  if (shippingFeesConfig) {
      shippingFeesConfig = shippingFeesConfig.filter(x => x.enabled === true || x.enabled === undefined);
  }
  return shippingFeesConfig && shippingFeesConfig.sort((a,b) => {
    return a.displayOrder - b.displayOrder;
  });
}
