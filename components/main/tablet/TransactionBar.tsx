import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { IDisplayInfo } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { ActionCreator, clearSelectedItemLines, ItemSelectionMode } from "../../../actions";
import { AppState } from "../../../reducers";
import Theme from "../../../styles";
import { countOfAllItems, getTransactionIsOpen } from "../../common/utilities";
import VectorIcon from "../../common/VectorIcon";
import { mainStyle } from "./styles";


interface StateProps {
  displayInfo: IDisplayInfo;
  itemSelectionMode: ItemSelectionMode;
  transactionIsOpen: boolean;
  transactionNumber: string;
}

interface DispatchProps {
  clearSelectedItemLines: ActionCreator;
}

interface Props extends StateProps, DispatchProps {
  allItemsSelected: boolean;
  choseMultiSelectAction: boolean;
  multiSelectEnabled: boolean;
  onSelectionModePress: () => void;
  selectedItemsCount: number;
  shouldShowSelectionPanel: boolean;
}

const TransactionBar: React.FunctionComponent<Props> = (props: Props): React.ReactElement => {
  const styles: any = Theme.getStyles(mainStyle());
  const totalItems = (props.transactionIsOpen && countOfAllItems(props.displayInfo)) || 0;

  const isMultipleSelectionMode: boolean = props.itemSelectionMode === ItemSelectionMode.Multiple;
  const isAllSelectionMode: boolean = props.itemSelectionMode === ItemSelectionMode.All;
  const didNotSelectMultipleItems: boolean = !isMultipleSelectionMode && !isAllSelectionMode;
  const showTransactionPanel = props.choseMultiSelectAction || didNotSelectMultipleItems;

  const getSelectItemIcon = (): string => {
    if (isMultipleSelectionMode && !props.allItemsSelected && props.selectedItemsCount > 0) {
      return "MinusBox";
    } else if (props.allItemsSelected) {
      return "CheckedBox";
    }
    return "UncheckedBox";
  };

  const getSelectItemText = (): string => {
    if (props.itemSelectionMode === ItemSelectionMode.None) {
      return "selectItems";
    } else if (props.allItemsSelected) {
      return "unselectAll";
    }
    return "selectAll";
  };

  const renderIconButton = (onPress: () => void, name: string, fill: string, disabled?: boolean): React.ReactNode => {
    return (
      <View style={styles.multiSelect}>
        <TouchableOpacity activeOpacity={1} onPress={onPress} disabled={disabled}>
          <VectorIcon name={name} fill={fill} height={styles.transactionBarIcon.fontSize} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSelectionButton = (): React.ReactNode => {
    const iconName: string = getSelectItemIcon();
    const iconText: string = getSelectItemText();

    return (
      <TouchableOpacity activeOpacity={1} onPress={props.onSelectionModePress}>
        <View style={styles.selectItemBtn}>
          <View style={styles.checkboxArea}>
            <VectorIcon
              name={iconName}
              fill={styles.transactionBarIcon.color}
              height={styles.transactionBarIcon.fontSize}
            />
          </View>
          <Text style={styles.selectItemText}>
            { I18n.t(iconText) }
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLeftPanel = (): React.ReactNode => {
    if (showTransactionPanel) {
      const transactionNumberStyle = !!props.transactionNumber && styles.transactionNumber;
      return (
        <View style={styles.transactionPanel}>
          <VectorIcon
            name="Transaction"
            fill={styles.transactionBarDisabledIcon.color}
            height={styles.transactionBarIcon.fontSize}
          />
          <Text style={[styles.transactionTextValue, transactionNumberStyle, styles.tal]}>
            { props.transactionNumber || "--" }
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.transactionPanel}>
        { renderSelectionButton() }
      </View>
    );
  };

  const renderRightPanel = (): React.ReactNode => {
    if (showTransactionPanel) {
      return (
        <View style={styles.transactionPanel}>
          <Text style={[ styles.transactionTextValue, styles.itemCount, styles.tar ]}>
            { totalItems }
          </Text>
          {
            renderIconButton(
              props.onSelectionModePress,
              "MultiSelect",
              props.multiSelectEnabled ? styles.transactionBarIcon.color : styles.transactionBarDisabledIcon.color,
              !props.multiSelectEnabled
            )
          }
        </View>
      );
    }

    return (
      <View style={styles.transactionPanel}>
        { renderIconButton(props.clearSelectedItemLines, "Cancel", styles.transactionBarIcon.color) }
      </View>
    );
  };

  return (
    <View style={styles.transaction}>
      <View style={styles.transactionLeft}>
        { renderLeftPanel() }
      </View>
      <View style={styles.transactionRight}>
        { renderRightPanel() }
      </View>
    </View>
  );
};

const mapStateToProps = (state: AppState) => {
  const { stateValues } = state.businessState;

  return {
    transactionNumber: stateValues ? stateValues.get("transaction.type") &&
        stateValues.get("transaction.number") : undefined,
    displayInfo: state.businessState.displayInfo,
    transactionIsOpen: getTransactionIsOpen(stateValues),
    itemSelectionMode: state.itemSelectionState.itemSelectionMode
  };
};

const mapDispatchToProps = {
  clearSelectedItemLines: clearSelectedItemLines.request
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionBar);
