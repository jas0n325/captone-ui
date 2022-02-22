import { defineRequestType, RequestType, StandardAction } from "./actions";
import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";

export const SEARCH_VALUE_CERTIFICATE: RequestType = defineRequestType("SEARCH_VALUE_CERTIFICATE");

export const searchValueCertificates = {
  request: (deviceIdentity: DeviceIdentity, uiInputs: UiInput[]): StandardAction => {
    return {
      type: SEARCH_VALUE_CERTIFICATE.REQUEST,
      payload: {
        deviceIdentity,
        uiInputs
      }
    };
  },
  success: (): StandardAction => {
    return {
      type: SEARCH_VALUE_CERTIFICATE.SUCCESS,
      payload: {
        error: undefined
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: SEARCH_VALUE_CERTIFICATE.FAILURE,
      payload: {
        error
      }
    };
  }
};
