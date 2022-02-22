import { defineRequestType, RequestType, StandardAction } from "./actions";
import { RenderSelectOptions } from "../components/common/FieldValidation";
export const LOAD_COUNTRIES: RequestType = defineRequestType("LOAD_COUNTRIES");

export const loadCountries = {
  request: (): StandardAction => {
    return {
      type: LOAD_COUNTRIES.REQUEST,
      payload: {}
    };
  },
  success: (countries: RenderSelectOptions[]): StandardAction => {
    return {
      type: LOAD_COUNTRIES.SUCCESS,
      payload: {
        countries
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: LOAD_COUNTRIES.FAILURE,
      payload: {
        error
      }
    };
  }
};
