import { defineRequestType, RequestType, StandardAction } from "./actions";


export const DATA_EVENT: RequestType = defineRequestType("DATA_EVENT");

export enum DataEventType {
  KeyedData,
  ScanData,
  IUIData,
  PaymentData,
  KeyListenerData
}

export interface IPaginationMetadata {
  limit: number;
  offset: number;
  totalCount: number;
}

export interface IKeyedData {
  inputText: string;
  data?: any;
}

export interface IScannerData {
  encoding: string;
  data: string;
  deviceId?: string;
}

// FIXME: Remove this interface: https://jira.aptos.com/browse/DSS-3186
// This just obscures what needs to be done.
export interface IUIData {
  eventType: string;
  data?: any;
}

export interface IPaymentData {
  data?: any;
}

export interface IKeyListenerData {
  inputText: string;
  data?: any;
}

export type IDataEventData = IKeyedData | IScannerData | IUIData | IPaymentData | IKeyListenerData;

export interface IDataEventRequestPayload {
  eventType: DataEventType;
  data: IDataEventData;
  paginationMetadata?: IPaginationMetadata;
}

export interface IDataEventSuccessPayload extends IDataEventRequestPayload {
  businessProcessStarted: boolean;
}

export interface IDataEventFailurePayload extends IDataEventRequestPayload {
  error: Error;
}

export const dataEvent = {
  request: (eventType: DataEventType, data: IDataEventData,
            paginationMetadata?: IPaginationMetadata): StandardAction => {
    const dataEventPayload: IDataEventRequestPayload = {
      eventType,
      data,
      paginationMetadata
    };
    return {
      type: DATA_EVENT.REQUEST,
      payload: dataEventPayload
    };
  },
  // Success is mainly a notification that the data event was processed, in case something downstream needs to know.
  success: (dataEventRequestPayload: IDataEventRequestPayload, businessProcessStarted: boolean) => {
    const dataEventSuccessPayload: IDataEventSuccessPayload = {
      eventType: dataEventRequestPayload.eventType,
      data: dataEventRequestPayload.data,
      businessProcessStarted
    };
    return {
      type: DATA_EVENT.SUCCESS,
      payload: dataEventSuccessPayload
    };
  },
  failure: (dataEventRequestPayload: IDataEventRequestPayload, error: Error): StandardAction => {
    const dataEventFailurePayload: IDataEventFailurePayload = {
      eventType: dataEventRequestPayload.eventType,
      data: dataEventRequestPayload.data,
      error
    };
    return {
      type: DATA_EVENT.FAILURE,
      payload: dataEventFailurePayload
    };
  }
};
