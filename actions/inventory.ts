import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { InventoryItem } from "@aptos-scp/scp-types-inventory";

import { defineRequestType, RequestType, StandardAction } from "./actions";

export const GET_INVENTORY: RequestType = defineRequestType("GET_INVENTORY");

export const getInventory = {
  request: (deviceIdentity: DeviceIdentity, uiInputs: UiInput[]): StandardAction => {
    return {
      type: GET_INVENTORY.REQUEST,
      payload: {
        deviceIdentity,
        uiInputs
      }
    };
  },
  success: (inventory?: InventoryItem[]): StandardAction => {
    return {
      type: GET_INVENTORY.SUCCESS,
      payload: { inventory }
    };
  },
  failure: (error?: Error): StandardAction => {
    return {
      type: GET_INVENTORY.FAILURE,
      payload: {
        error
      }
    };
  }
};
