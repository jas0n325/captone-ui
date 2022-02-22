import { ILocalizableMessage, Money} from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { IFeatureAccessConfig } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "./utils";

export function localize(message: ILocalizableMessage): string {
  const params = { defaultValue: message.defaultMessage };
  const parameters: Map<string, any> = message.parameters || new Map<string, any>();
  for (const [key, value] of parameters.entries()) {
    if (value instanceof Money) {
      params[key] = value.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions());
    } else {
      params[key] = I18n.t(value, { defaultValue: value });
    }
  }
  return I18n.t(message.i18nCode, params);
}

export function getConfiguredMessage(message: ILocalizableMessage, eventType: string,
                                     configManager: IConfigurationManager): string {
  try {

    const configuredFeatures: Array<IFeatureAccessConfig> = configManager &&
        configManager.getFeaturesValues() as Array<IFeatureAccessConfig>;
    const eventConfig: IFeatureAccessConfig = configuredFeatures.find((item: IFeatureAccessConfig) =>
        item.uiBusinessEventType === eventType);
    const postVoidAuthFailedMessage = eventConfig.errorMessages && eventConfig.errorMessages[message.i18nCode];

    return (postVoidAuthFailedMessage && postVoidAuthFailedMessage[I18n.currentLocale()]) || this.localize(message);

  } catch (error) {
    return this.localize(message);
  }
}
