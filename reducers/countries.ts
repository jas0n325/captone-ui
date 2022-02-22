import { LOAD_COUNTRIES } from "../actions/countries";
import { RenderSelectOptions } from "../components/common/FieldValidation";

export interface CountriesState {
  countries?: RenderSelectOptions[];
}

const INITIAL_STATE: CountriesState = {};

export default (state: CountriesState = INITIAL_STATE, action: any): CountriesState => {
  if (action.type === LOAD_COUNTRIES.SUCCESS) {
    return Object.assign({}, state, action.payload);
  }
  return state;
}