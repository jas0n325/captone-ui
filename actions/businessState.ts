import {
  DeviceIdentity,
  ILastTransactionInfo,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import { IDisplayInfo } from "@aptos-scp/scp-component-store-selling-features";

import { defineRequestType, RequestType, StandardAction } from "./actions";


export const BUSINESS_OPERATION: RequestType = defineRequestType("BUSINESS_OPERATION");

export const businessOperation = {
  request: (deviceIdentity: DeviceIdentity, eventType: string, inputs: UiInput[]): StandardAction => {
    return {
      type: BUSINESS_OPERATION.REQUEST,
      payload: {
        deviceIdentity,
        eventType,
        inputs
      }
    };
  },
  /**
   * ILastTransactionInfo: two fields transactionNumber and transactionType
   */
  success: (stateValues: Readonly<Map<string, any>>,
            lines: ReadonlyArray<string>,
            displayInfo: IDisplayInfo,
            nonContextualData: Readonly<Map<string, any>>,
            inputs: UiInput[],
            lastTransactionInfo: ILastTransactionInfo,
            lastPrintableTransactionInfo: ILastTransactionInfo,
            eventType: string):
      StandardAction => {

    return {
      type: BUSINESS_OPERATION.SUCCESS,
      payload: {
        stateValues,
        lines,
        displayInfo,
        nonContextualData,
        error: undefined,
        inputs,
        lastTransactionInfo,
        lastPrintableTransactionInfo,
        eventType
      }
    };
  },
  failure: (error: Error, inputs: UiInput[], eventType: string): StandardAction => {
    return {
      type: BUSINESS_OPERATION.FAILURE,
      payload: {
        error,
        inputs,
        eventType
      }
    };
  }
};
