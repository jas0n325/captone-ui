import { isEqual } from "lodash";
import * as React from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { connect } from "react-redux";

import { IItemDisplayLine, ITEM_RETURN_LINE_TYPE } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, ItemSelectionMode, selectItemLine } from "../../actions";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import ItemLine from "./ItemLine";
import { selectableItemLineStyles } from "./styles";
import VectorIcon from "./VectorIcon";
import { getItemQuantity, getTestIdProperties } from "./utilities";


interface OwnProps {
  style?: ViewStyle;
  itemLineNumber: number;
  returnMode: boolean;
  showReservedQuantity?: boolean;
  removeLineAction?: boolean;
  testID?: string;
}

interface StateProps {
  itemLine: IItemDisplayLine; // Get itemLine directly from redux so it refreshes after discounts
  itemSelectionMode: ItemSelectionMode;
  selectionEnabled: boolean;
  selectedItems: number[];
  stateValues: Readonly<Map<string, any>>;
}

interface DispatchProps {
  selectItemLine: ActionCreator;
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

interface State {
  adjustedRowWidth: number;
  adjustedRowHeight: number;
  itemLine: IItemDisplayLine; // Save the item line to the state to preserve information for voiding the transaction.
}

class SelectableItemLine extends React.PureComponent<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(selectableItemLineStyles());

    this.state = {
      adjustedRowWidth: undefined,
      adjustedRowHeight: undefined,
      itemLine: props.itemLine
    };
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevProps.itemSelectionMode !== this.props.itemSelectionMode &&
        this.props.itemSelectionMode === ItemSelectionMode.All && !this.itemIsSelected) {
      // Have each item line select itself if the user wants ALL selected
      // If the line is not a return line DSS-4022
      if (this.props.itemLine.lineType !== ITEM_RETURN_LINE_TYPE) {
        this.props.selectItemLine(this.props.itemLineNumber);
      }
    }

    if (this.props.itemLine && !this.props.stateValues.get("transaction.voided") &&
        !isEqual(this.props.itemLine, this.state.itemLine)) {
      this.setState({itemLine: this.props.itemLine});
    }
  }

  public render(): JSX.Element {
    const lineInMultiSelect: boolean = this.props.itemSelectionMode === ItemSelectionMode.Multiple ||
        this.props.itemSelectionMode === ItemSelectionMode.All;
    const isReturnItem: boolean = this.state.itemLine.lineType === ITEM_RETURN_LINE_TYPE;
    const testID = this.props.testID;

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[this.styles.itemLine, !lineInMultiSelect && this.styles.notInSelectMode]}
        {...getTestIdProperties(testID, "selectableItemLine")}
        onPress={!this.props.removeLineAction ? this.handlePress : undefined}
      >
        {
          lineInMultiSelect && !isReturnItem &&
          <View style={this.styles.selectCell}>
            <VectorIcon
              name={this.itemIsSelected ? "CheckedBox" : "UncheckedBox"}
              fill={this.styles.selectCellIcon.color}
              height={this.styles.selectCellIcon.fontSize}
            />
          </View>
        }
        <View style={[this.styles.itemAndQuantityArea, lineInMultiSelect && this.styles.inSelectMode]}>
          <ItemLine
            testID={`${testID}-selectableItemLine-itemLine`}
            style={Object.assign({}, this.styles.item, lineInMultiSelect && this.styles.itemIsSelected,
                lineInMultiSelect && isReturnItem && this.styles.itemDisabled)}
            hideImage={this.props.itemSelectionMode !== ItemSelectionMode.None}
            line={this.state.itemLine}
            showReservedQuantity={this.props.showReservedQuantity}
          />
          {
            Theme.isTablet && !lineInMultiSelect &&
            <>
              <View style={this.styles.arrowArea}>
                <VectorIcon name="Forward" height={this.styles.icon.fontSize} fill={this.styles.icon.color} />
              </View>
              <View style={this.styles.quantityCell}>
                <Text
                  {...getTestIdProperties(testID, "selectableItemLine-itemLine-quantity")}
                  style={this.styles.quantityText}>{I18n.t("qty")}
                </Text>
                <View style={[
                  this.styles.quantityAmountCell,
                  !this.props.selectionEnabled && this.styles.quantityAmountCellNotSelectable
                ]}>
                  <Text
                    {...getTestIdProperties(testID, "selectableItemLine-itemLine-quantityAmount")}
                    style={this.styles.quantityAmountText}>
                    {getItemQuantity(this.state.itemLine, this.props.showReservedQuantity)}
                  </Text>
                </View>
              </View>
            </>
          }
        </View>
      </TouchableOpacity>
    );
  }

  private get itemIsSelected(): boolean {
    return !!this.props.selectedItems.find((itemLineNumber: number) => itemLineNumber === this.props.itemLineNumber);
  }

  private handlePress = (): void => {
    const lineInMultiSelect: boolean = this.props.itemSelectionMode === ItemSelectionMode.Multiple ||
        this.props.itemSelectionMode === ItemSelectionMode.All;
    const isReturnItem: boolean = this.state.itemLine.lineType === ITEM_RETURN_LINE_TYPE;
    if (!(lineInMultiSelect && isReturnItem)) {
      this.props.selectItemLine(this.props.itemLineNumber);
    }
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return {
    itemLine: state.businessState.displayInfo?.itemDisplayLines?.find((line: IItemDisplayLine) =>
        line.lineNumber === ownProps.itemLineNumber),
    itemSelectionMode: state.itemSelectionState.itemSelectionMode,
    selectionEnabled: state.itemSelectionState.selectionEnabled,
    selectedItems: state.itemSelectionState.selectedItems,
    stateValues: state.businessState.stateValues
  };
};

export default connect(mapStateToProps, {
  selectItemLine: selectItemLine.request
})(SelectableItemLine);
