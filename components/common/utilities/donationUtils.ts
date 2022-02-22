import {IConfigurationManager} from "@aptos-scp/scp-component-store-selling-core";
import {getFeatureAccessConfig} from "./configurationUtils";
import {IDonationDefinition, MAKE_DONATION_EVENT} from "@aptos-scp/scp-component-store-selling-features";

export function getDonationDefinition(configManager: IConfigurationManager): IDonationDefinition {
  const donationFeature = getFeatureAccessConfig(configManager, MAKE_DONATION_EVENT);
  if (donationFeature && donationFeature.enabled) {
    const donationDefinitions = configManager.getFunctionalBehaviorValues().donationBehaviors?.donationDefinitions;
    if (donationDefinitions) {
      const definitionKey = donationFeature.donationDefinitionKey.find((key) => !!donationDefinitions[key]);
      if (definitionKey) {
        return donationDefinitions[definitionKey];
      }
    }
  }
  return undefined;
}

export function isDonationVisible(configManager: IConfigurationManager): boolean {
  return !!getDonationDefinition(configManager);
}
