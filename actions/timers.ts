import { ITimer, TimerUpdateType } from "@aptos-scp/scp-component-store-selling-features";

import { StandardAction } from "./actions";


export const TimerReduxAction: string = "TimerReduxAction";

export enum TimerServiceMethods {
  Register = "Register",
  Unregister = "Unregister",
  Start = "Start",
  Stop = "Stop",
  Reset = "Reset",
  Update = "Update"
}

export const registerTimer = (key: string, timer: ITimer): StandardAction => {
  return {
    type: TimerReduxAction,
    payload: { timerServiceMethod: TimerServiceMethods.Register, key, timer }
  };
};

export const unregisterTimer = (key: string): StandardAction => {
  return {
    type: TimerReduxAction,
    payload: { timerServiceMethod: TimerServiceMethods.Unregister, key }
  };
};

export const startTimer = (key: string): StandardAction => {
  return {
    type: TimerReduxAction,
    payload: { timerServiceMethod: TimerServiceMethods.Start, key }
  };
};

export const stopTimer = (key: string): StandardAction => {
  return {
    type: TimerReduxAction,
    payload: { timerServiceMethod: TimerServiceMethods.Stop, key }
  };
};

export const resetTimer = (key: string): StandardAction => {
  return {
    type: TimerReduxAction,
    payload: { timerServiceMethod: TimerServiceMethods.Reset, key }
  };
};

export const updateTimers = (updateType: TimerUpdateType): StandardAction => {
  return {
    type: TimerReduxAction,
    payload: { timerServiceMethod: TimerServiceMethods.Update, updateType }
  };
};
