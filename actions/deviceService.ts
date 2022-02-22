import { defineRequestType, RequestType, StandardAction } from ".";


export const DEVICE_SERVICE: RequestType = defineRequestType("DEVICE_SERVICE");
export const UPDATE_DEVICE_FIRMWARE: RequestType = defineRequestType("UPDATE_DEVICE_FIRMWARE");

export enum DeviceServiceType {
  ScannerUpdate,
  PaymentDeviceFirmwareUpdate
}

export interface IScannerUpdate {
  enabled?: boolean;
  alertSuccess?: boolean;
  deviceId?: string;
}

export interface IPaymentDeviceFirmwareUpdate {
  deviceId?: string;
}

export interface IPaymentDeviceUploadLogs {
  deviceId?: string;
}

export type IDeviceServiceType = IScannerUpdate;
export type IUpdateDeviceFirmwareType = IPaymentDeviceFirmwareUpdate;

export interface IDeviceUpdateRequestPayload {
  eventType: DeviceServiceType;
  data: IDeviceServiceType;
}

export interface IUpdateDeviceFirmwareRequestPayload {
  eventType: DeviceServiceType;
  data: IUpdateDeviceFirmwareType;
}

export const deviceService = {
  request: (eventType: DeviceServiceType, data: IDeviceServiceType): StandardAction => {
    const deviceServiceEventPayload: IDeviceUpdateRequestPayload = {
      eventType,
      data
    };
    return {
      type: DEVICE_SERVICE.REQUEST,
      payload: deviceServiceEventPayload
    };
  }
};

export const updateDeviceFirmware = {
  request: (eventType: DeviceServiceType, data: IUpdateDeviceFirmwareType): StandardAction => {
    const updateDeviceFirmwareEventPayload: IUpdateDeviceFirmwareRequestPayload = {
      eventType,
      data
    };
    return {
      type: UPDATE_DEVICE_FIRMWARE.REQUEST,
      payload: updateDeviceFirmwareEventPayload
    };
  }
};
