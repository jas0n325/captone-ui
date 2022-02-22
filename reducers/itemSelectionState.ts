
import {
  CLEAR_SELECTED_ITEM_LINES,
  ItemSelectionMode,
  SELECT_ALL_ITEM_LINES,
  SELECT_ITEM_LINE,
  SET_ITEM_SELECTION_MODE,
  SET_SELECTION_ENABLED,
  UNSELECT_ALL_ITEM_LINES
} from "../actions/itemSelection";
import { RequestState } from "./reducers";


export interface ItemSelectionState extends RequestState {
  itemSelectionMode: ItemSelectionMode;
  selectionEnabled: boolean;
  selectedItems: number[];
}

const INITIAL_STATE: ItemSelectionState = {
  itemSelectionMode: ItemSelectionMode.None,
  selectionEnabled: true,
  selectedItems: []
};

export default (state: ItemSelectionState = INITIAL_STATE, action: any): ItemSelectionState => {
  switch (action.type) {
    case CLEAR_SELECTED_ITEM_LINES.REQUEST:
      return Object.assign({}, state, {
        itemSelectionMode: ItemSelectionMode.None,
        selectionEnabled: true,
        selectedItems: []
      });
    case SET_SELECTION_ENABLED.REQUEST:
    case SET_ITEM_SELECTION_MODE.REQUEST:
      return Object.assign({}, state, action.payload);
    case SELECT_ITEM_LINE.REQUEST:
      return Object.assign({}, state, handleItemSelected(state, action.payload.itemLineNumber));
    case SELECT_ALL_ITEM_LINES.REQUEST:
      return Object.assign({}, state, { itemSelectionMode: action.payload.itemSelectionMode });
    case UNSELECT_ALL_ITEM_LINES.REQUEST:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};

const handleItemSelected = (state: ItemSelectionState, itemLineNumber: number): ItemSelectionState => {
  if (!state.selectionEnabled) {
    return state;
  }

  if (state.itemSelectionMode === ItemSelectionMode.Multiple) {
    return handleMultiSelect(state, itemLineNumber);
  } else if (state.itemSelectionMode === ItemSelectionMode.All) {
    return handleAllSelect(state, itemLineNumber);
  } else {
    return handleSingleItemSelected(state, itemLineNumber);
  }
};

const handleSingleItemSelected = (state: ItemSelectionState,
                                  selectedItemLineNumber: number): ItemSelectionState => {
  const itemIsAlreadySelected: boolean = state.itemSelectionMode === ItemSelectionMode.Single &&
      state.selectedItems.length === 1 &&
      !!state.selectedItems.find((itemNumber: number) => itemNumber === selectedItemLineNumber);

  return itemIsAlreadySelected
      ? { itemSelectionMode: ItemSelectionMode.None, selectionEnabled: true, selectedItems: [] }
      : {
        itemSelectionMode: ItemSelectionMode.Single,
        selectionEnabled: false,
        selectedItems: [ selectedItemLineNumber ]
      };
};

const handleMultiSelect = (state: ItemSelectionState, selectedItemLineNumber: number): ItemSelectionState => {
  const itemIsAlreadySelected: boolean = state.itemSelectionMode === ItemSelectionMode.Multiple &&
      state.selectedItems.length !== 0 &&
      !!state.selectedItems.find((itemNumber: number) => itemNumber === selectedItemLineNumber);

  return itemIsAlreadySelected
      ? {
        itemSelectionMode: ItemSelectionMode.Multiple,
        selectionEnabled: state.selectionEnabled,
        selectedItems: state.selectedItems.filter((itemLineNumber: number) => itemLineNumber !== selectedItemLineNumber)
      }
      : {
        itemSelectionMode: ItemSelectionMode.Multiple,
        selectionEnabled: state.selectionEnabled,
        selectedItems: state.selectedItems.concat([selectedItemLineNumber])
      };
};

const handleAllSelect = (state: ItemSelectionState, selectedItemLineNumber: number): ItemSelectionState => {
  const itemIsAlreadySelected: boolean = state.itemSelectionMode === ItemSelectionMode.All &&
      state.selectedItems.length !== 0 &&
      !!state.selectedItems.find((itemNumber: number) => itemNumber === selectedItemLineNumber);

  return itemIsAlreadySelected
      ? {
        itemSelectionMode: ItemSelectionMode.Multiple,
        selectionEnabled: state.selectionEnabled,
        selectedItems: state.selectedItems.filter((itemLineNumber: number) => itemLineNumber !== selectedItemLineNumber)
      }
      : {
        itemSelectionMode: ItemSelectionMode.All,
        selectionEnabled: state.selectionEnabled,
        selectedItems: state.selectedItems.concat([selectedItemLineNumber])
      };
};
