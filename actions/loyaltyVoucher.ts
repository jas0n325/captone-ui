import {DeviceIdentity, UiInput} from "@aptos-scp/scp-component-store-selling-core";
import { ILoyaltyVoucher } from "@aptos-scp/scp-component-store-selling-features";
import { defineRequestType, RequestType, StandardAction } from "./actions";

export const SEARCH_LOYALTY_VOUCHER: RequestType = defineRequestType("SEARCH_LOYALTY_VOUCHER");

export const searchLoyaltyVouchers = {
  request: (deviceIdentity: DeviceIdentity, uiInputs: UiInput[]): StandardAction => {
    return {
      type: SEARCH_LOYALTY_VOUCHER.REQUEST,
      payload: {
        deviceIdentity,
        uiInputs
      }
    };
  },
  success: (loyaltyVouchers: ILoyaltyVoucher[]): StandardAction => {
    return {
      type: SEARCH_LOYALTY_VOUCHER.SUCCESS,
      payload: {
        loyaltyVouchers,
        error: undefined
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: SEARCH_LOYALTY_VOUCHER.FAILURE,
      payload: {
        error
      }
    };
  }
};
