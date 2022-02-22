import {
  IFiscalStatus,
  IPaymentStatus,
  IPrinterStatus,
  IScannerStatus
} from "@aptos-scp/scp-types-commerce-devices";

import { DEVICE_STATUS, SHOULD_RESET_FISCAL_DEVICE_STATUS } from "../actions/deviceStatus";
import { FiscalReportStatus, ReportType } from "../components/fiscalPrinter/constants";
import { RequestState } from "./reducers";


export interface DeviceStatusState extends RequestState {
  paymentStatus: Map<string, IPaymentStatus>;
  printerStatus: IPrinterStatus;
  scannerStatus: IScannerStatus;
  fiscalStatus?: IFiscalStatus;
  zRepNumber?: string;
  statusCode?: string;
  reportType?: string;
}

const INITIAL_STATE: DeviceStatusState = {
  paymentStatus: new Map<string, IPaymentStatus>(),
  printerStatus: undefined,
  scannerStatus: undefined,
  zRepNumber: undefined,
  fiscalStatus: undefined,
  statusCode: undefined,
  reportType: undefined
};

function onPaymentDeviceStatusUpdate(currentStatus: Map<string, IPaymentStatus>,
                                     payload: IPaymentStatus): Map<string, IPaymentStatus> {
  return new Map<string, IPaymentStatus>(currentStatus).set(payload.deviceId, payload);
}

export default (state: DeviceStatusState = INITIAL_STATE, action: any) => {
  if (action.type === DEVICE_STATUS) {
      // FIXME: maintaining maps of statuses should be moved or revisited.
      // In order to not overwrite the existing status, the new state is being constructed manually. The prior solution
      // was to `||` default all of them to the value on the previous state if they were not included. In the future,
      // this should be managed somewhere else. Potential candidates are the saga, inside the individual device
      // services, or via separated actions.

      // return Object.assign(
      //   {},
      //   state
      //   {
      //     paymentStatus : (action.payload && action.payload.paymentStatus) || state.paymentStatus,
      //     printerStatus : (action.payload && action.payload.printerStatus) || state.printerStatus,
      //     scannerStatus : (action.payload && action.payload.scannerStatus) || state.scannerStatus
      //   }
      // );

      if (!action.payload) {
        return state;
      }

      const nextState: DeviceStatusState = {} as DeviceStatusState;

      if (action.payload.paymentStatus) {
        nextState.paymentStatus = onPaymentDeviceStatusUpdate(state.paymentStatus, action.payload.paymentStatus);
      }

      if (action.payload.fiscalStatus) {
        nextState.statusCode = action.payload.fiscalStatus.statusCode ?
          action.payload.fiscalStatus.statusCode : undefined;
        nextState.reportType = action.payload.fiscalStatus.reportType ?
          action.payload.fiscalStatus.reportType : undefined;
        if (action.payload.fiscalStatus && action.payload.fiscalStatus.statusCode === FiscalReportStatus.Success) {
             if (action.payload.fiscalStatus.requestType === ReportType.Report) {
              nextState.zRepNumber = action.payload.fiscalStatus.zReportNumber ?
                action.payload.fiscalStatus.zReportNumber : undefined;
            }
        }
        nextState.fiscalStatus = action.payload.fiscalStatus;
      }


      if (action.payload.scannerStatus) {
        nextState.scannerStatus = action.payload.scannerStatus;
      }

      return Object.assign({}, state, nextState);
  } else if (action.type === SHOULD_RESET_FISCAL_DEVICE_STATUS) {
      return {
        ...state,
        fiscalStatus: undefined,
        zRepNumber: undefined,
        statusCode: undefined,
        reportType: undefined
      };
  }
  return state;
};
