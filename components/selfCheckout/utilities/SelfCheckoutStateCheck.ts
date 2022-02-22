import { PosError } from "@aptos-scp/scp-component-store-selling-core";
import { INVALID_CLIENT_CONFIG_SCO_MACA_ERROR_CODE } from "../../../../config/ErrorCodes";
import { BusinessState } from "../../../reducers/businessState";
import { SettingsState } from "../../../reducers/settings";

interface BusinessStateProps {
  businessState: BusinessState;
}

interface SettingsStateProps {
  settings: SettingsState;
}

export function selfCheckoutModeActive(props: BusinessStateProps): boolean {
  return props.businessState && props.businessState.stateValues &&
      props.businessState.stateValues.get("UserSession.unattended");
}

export function selfCheckoutConfigured(props: SettingsStateProps): boolean {
  const functionalBehaviorsConfig = props.settings.configurationManager.getFunctionalBehaviorValues();
  const scoEnabled = functionalBehaviorsConfig.selfCheckoutModeBehaviors &&
      functionalBehaviorsConfig.selfCheckoutModeBehaviors.enabled;
  if (scoEnabled && functionalBehaviorsConfig.customerFunctionChoices &&
      functionalBehaviorsConfig.customerFunctionChoices.promptForCustomerAfterTransactionReceipts) {
    throw new PosError(
      "Invalid configurations. 'promptForCustomerAfterTransactionReceipts' cannot be configured when in self checkout mode.",
      INVALID_CLIENT_CONFIG_SCO_MACA_ERROR_CODE);
  }
  return scoEnabled;
}
