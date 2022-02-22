import EnvFileDefinitions from "react-native-config";

/**
 * @description circuit breaker
 * @default true
 * @returns {boolean}
 */
export const envCircuitBreaker = (): boolean => {
  return EnvFileDefinitions.DEFAULT_CB_ENABLED ? (EnvFileDefinitions.DEFAULT_CB_ENABLED.toLowerCase() === "true") : true;
}
