import { IDeviceStatus } from "@aptos-scp/scp-types-commerce-devices";

import { StandardAction } from "./actions";


export const DEVICE_STATUS: string = "DEVICE_STATUS";
export const SHOULD_RESET_FISCAL_DEVICE_STATUS: string = "SHOULD_RESET_FISCAL_DEVICE_STATUS";

export const deviceStatusUpdate = (deviceStatus: IDeviceStatus): StandardAction => {
  return {
    type: DEVICE_STATUS,
    payload: {
      deviceStatus
    }
  };
};

export const resetFiscalDeviceStatus = {
  request: (): StandardAction => {
    return {
      type: SHOULD_RESET_FISCAL_DEVICE_STATUS
    };
  }
};
