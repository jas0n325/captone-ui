import { defineRequestType, RequestType, StandardAction } from "./actions";


export const REMOTE_CALL: RequestType = defineRequestType("REMOTE_CAL");

export interface IRemoteCallPayload {
  name: string;
  isProcessing: boolean;
  sequenceNumber: number;
}

export const remoteCall = {
  success: (name: string, isProcessing: boolean, sequenceNumber: number): StandardAction => {
    const payload: IRemoteCallPayload = {
      name,
      isProcessing,
      sequenceNumber
    };

    return {
      type: REMOTE_CALL.SUCCESS,
      payload
    };
  }
};
