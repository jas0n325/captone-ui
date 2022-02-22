import { RequestState } from "./reducers";


export interface TimersState extends RequestState {}

const INITIAL_STATE: TimersState = {};

export default (state: TimersState = INITIAL_STATE, action: any): TimersState => {
  return state;
};
