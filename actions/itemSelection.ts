import { defineRequestType, RequestType, StandardAction } from "./actions";


export enum ItemSelectionMode {
  None = "None",
  Single = "Single",
  Multiple = "Multiple",
  All = "All"
}

export const CLEAR_SELECTED_ITEM_LINES: RequestType = defineRequestType("CLEAR_SELECTED_ITEM_LINES");
export const DISABLE_SELECTION: RequestType = defineRequestType("DISABLE_SELECTION");
export const SELECT_ALL_ITEM_LINES: RequestType = defineRequestType("SELECT_ALL_ITEM_LINES");
export const SELECT_ITEM_LINE: RequestType = defineRequestType("SELECT_ITEM_LINE");
export const SET_ITEM_SELECTION_MODE: RequestType = defineRequestType("SET_SELECTION_MODE");
export const SET_SELECTION_ENABLED: RequestType = defineRequestType("SET_SELECTION_ENABLED");
export const UNSELECT_ALL_ITEM_LINES: RequestType = defineRequestType("UNSELECT_ALL_ITEM_LINES");

export const clearSelectedItemLines = {
  request: (): StandardAction => {
    return {
      type: CLEAR_SELECTED_ITEM_LINES.REQUEST,
      payload: {}
    };
  }
};

export const setItemSelectionMode = {
  request: (itemSelectionMode: ItemSelectionMode): StandardAction => {
    return {
      type: SET_ITEM_SELECTION_MODE.REQUEST,
      payload: { itemSelectionMode }
    };
  }
};

export const selectItemLine = {
  request: (itemLineNumber: number): StandardAction => {
    return {
      type: SELECT_ITEM_LINE.REQUEST,
      payload: { itemLineNumber }
    };
  }
};

export const selectAllItemLines = {
  request: (): StandardAction => {
    return {
      type: SELECT_ALL_ITEM_LINES.REQUEST,
      payload: { itemSelectionMode: ItemSelectionMode.All }
    };
  }
};

export const setSelectionEnabled = {
  request: (selectionEnabled: boolean): StandardAction => {
    return {
      type: SET_SELECTION_ENABLED.REQUEST,
      payload: { selectionEnabled }
    };
  }
};

export const unselectAllItemLines = {
  request: (): StandardAction => {
    return {
      type: UNSELECT_ALL_ITEM_LINES.REQUEST,
      payload: {
        itemSelectionMode: ItemSelectionMode.Multiple,
        selectedItems: []
      }
    };
  }
};
