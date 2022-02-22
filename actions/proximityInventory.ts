import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { InventoryItem } from "@aptos-scp/scp-types-inventory";

import { defineRequestType, RequestType, StandardAction } from "./actions";

export const GET_PROXIMITY_INVENTORY: RequestType = defineRequestType("GET_PROXIMITY_INVENTORY");

export const getProximityInventory = {
  request: (deviceIdentity: DeviceIdentity, uiInputs: UiInput[]): StandardAction => {
    return {
      type: GET_PROXIMITY_INVENTORY.REQUEST,
      payload: {
        deviceIdentity,
        uiInputs
      }
    };
  },
  success: (inventory?: InventoryItem[]): StandardAction => {
    return {
      type: GET_PROXIMITY_INVENTORY.SUCCESS,
      payload: { inventory }
    };
  },
  failure: (error?: Error): StandardAction => {
    return {
      type: GET_PROXIMITY_INVENTORY.FAILURE,
      payload: {
        error
      }
    };
  }
};
