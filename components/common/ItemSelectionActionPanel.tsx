import * as React from "react";
import { Alert, View } from "react-native";
import { connect } from "react-redux";

import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  GiftReceiptMode,
  GIFT_RECEIPT_ITEM_EVENT,
  IItemDisplayLine,
  MULTI_LINE_EVENT,
  UiInputKey,
  VOID_LINE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation } from "../../actions";
import { AppState, BusinessState, SettingsState, UiState } from "../../reducers";
import Theme from "../../styles";
import { NavigationProp } from "../StackNavigatorParams";
import ActionButton from "./ActionButton";
import ActionPanel from "./ActionPanel";
import { itemSelectionActionPanelStyle } from "./styles";
import { IFeatureActionButtonProps } from "./utilities";
import { popTo } from "./utilities/navigationUtils";


interface StateProps {
  businessState: BusinessState;
  featureActionButtonProps: IFeatureActionButtonProps;
  selectedItems: number[];
  settings: SettingsState;
  uiState: UiState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface Props extends StateProps, DispatchProps {
  horizontal: boolean;
  clearSelectedItemLines: () => void;
  onAssignSalesperson: () => void;
  onItemDiscount: () => void;
  onTaxPress: () => void;
  navigation: NavigationProp;
}

class ItemSelectionActionPanel extends React.PureComponent<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(itemSelectionActionPanelStyle());
  }

  public render(): JSX.Element {
    const hasItemSelected: boolean = this.props.selectedItems && this.props.selectedItems.length > 0;

    return (
      <ActionPanel>
        {
          this.props.featureActionButtonProps.isAssignSalespersonItemVisible &&
          <ActionButton
            style={this.styles.btnAction}
            icon={{icon: "Salesperson", size: this.styles.btnActionIcon.fontSize}}
            title={I18n.t("salesperson")}
            titleStyle={this.styles.btnActionText}
            allowTextWrap={true}
            onPress={this.props.onAssignSalesperson}
            disabled={!hasItemSelected || !this.props.featureActionButtonProps.isAssignSalespersonItemEnabled}
          />
        }
        { this.props.featureActionButtonProps.isItemDiscountVisible &&
          <ActionButton style={this.styles.btnAction}
                        icon={{icon: "Discount", size: this.styles.btnActionIcon.fontSize}}
                        title={I18n.t("discount")}
                        titleStyle={this.styles.btnActionText}
                        allowTextWrap={true}
                        onPress={this.props.onItemDiscount}
                        disabled={
                          !(hasItemSelected && this.isManualItemDiscountAllowed()) ||
                          !this.props.featureActionButtonProps.isItemDiscountEnabled
                        }/>
        }
        { this.props.featureActionButtonProps.isMarkGiftReceiptItemVisible &&
          <ActionButton
            style={this.styles.btnAction}
            icon={{icon: "GiftReceipt", size: this.styles.btnActionIcon.fontSize}}
            title={I18n.t("giftReceipt")}
            titleStyle={this.styles.btnActionText}
            allowTextWrap={true}
            onPress={() => this.onGiftModeSelection()}
            disabled={!hasItemSelected || !this.props.featureActionButtonProps.isMarkGiftReceiptItemEnabled}
          />
        }
        {
          (this.props.featureActionButtonProps.isMarkItemTaxOverrideVisible ||
              this.props.featureActionButtonProps.isItemTaxExemptVisible) &&
          <ActionButton
              style={this.styles.btnAction}
              icon={{icon: "TaxExempt", size: this.styles.btnActionIcon.fontSize}}
              title={I18n.t("tax")}
              titleStyle={this.styles.btnActionText}
              onPress={this.props.onTaxPress}
              allowTextWrap={true}
              disabled={!hasItemSelected || !(this.props.featureActionButtonProps.isItemTaxExemptEnabled ||
                  this.props.featureActionButtonProps.isItemTaxOverrideEnabled)}
          />
        }
        {/*
          Hide it for now (https://jira.aptos.com/browse/DSS-1818). If in the future it is required, it can be
          used again
         */}
        { this.props.featureActionButtonProps.isVoidItemVisible && false &&
          <ActionButton
            style={this.styles.btnAction}
            icon={{icon: "Void", size: this.styles.btnActionIcon.fontSize}}
            title={I18n.t("void")}
            titleStyle={this.styles.btnActionText}
            allowTextWrap={true}
            onPress={() => this.onVoid()}
            disabled={!hasItemSelected || !this.props.featureActionButtonProps.isVoidItemEnabled}
          />
        }
        { this.styles.lastBtn &&
          <View style={this.styles.lastBtn} />
        }
      </ActionPanel>
    );
  }

  private isManualItemDiscountAllowed(): boolean {
    const { displayInfo } = this.props.businessState;
    const selectedItems = this.props.selectedItems;
    const manualItemDiscountLines: IItemDisplayLine[] = displayInfo.itemDisplayLines.filter((itemLine) =>
        selectedItems.indexOf(itemLine.lineNumber) > -1 && itemLine.isManualItemDiscountAllowed);
    return manualItemDiscountLines.length > 0 && manualItemDiscountLines.length === selectedItems.length;
  }

  private onGiftModeSelection(): void {
    const { displayInfo, stateValues } = this.props.businessState;
    const selectedItems = this.props.selectedItems;
    const previouslyPresentGiftItems: IItemDisplayLine[] = displayInfo.itemDisplayLines.filter(
        (prevItemLine: IItemDisplayLine) =>
            selectedItems.indexOf(prevItemLine.lineNumber) > -1 && prevItemLine.giftReceipt);
    let itemLine: IItemDisplayLine = undefined;
    if (selectedItems.length === 1) {
      itemLine = displayInfo.itemDisplayLines.find((currItemLine) => currItemLine.lineNumber === selectedItems[0]);
    }

    const transactionHasGiftReceiptMode: boolean = stateValues.get("transaction.giftReceiptMode") &&
        stateValues.get("transaction.giftReceiptMode") !== GiftReceiptMode.None;

    // Check just when a single item is selected so it works the same way as in the Product Actions page
    if ((previouslyPresentGiftItems.length === 1 || (itemLine && itemLine.quantity > 1) || selectedItems.length > 1) &&
        !transactionHasGiftReceiptMode) {
      Alert.alert(I18n.t("giftReceipt"), I18n.t("giftReceiptTitle"),
          [
            { text: I18n.t("cancel"), style: "cancel" },
            { text: I18n.t("single"), onPress: () => this.onMarkAsGiftItem(GiftReceiptMode.Shared) },
            { text: I18n.t("multiple"), onPress: () => this.onMarkAsGiftItem(GiftReceiptMode.Individual) }
          ],
          { cancelable: false });
    } else {
      this.onMarkAsGiftItem(previouslyPresentGiftItems.length === selectedItems.length ?
          GiftReceiptMode.None : undefined);
    }
  }

  private onMarkAsGiftItem(giftReceiptMode: GiftReceiptMode): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.UI_BUSINESS_EVENT, GIFT_RECEIPT_ITEM_EVENT));
    uiInputs.push(new UiInput(UiInputKey.LINE_NUMBERS, this.props.selectedItems));
    if (giftReceiptMode) {
      uiInputs.push(new UiInput(UiInputKey.UI_INPUTS, [
        new UiInput(UiInputKey.GIFT_RECEIPT_MODE, giftReceiptMode)
      ]));
    }
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, MULTI_LINE_EVENT, uiInputs);
    this.props.clearSelectedItemLines();

    if (!Theme.isTablet) {
      this.props.navigation.dispatch(popTo("main"));
    }
  }

  private onVoid(): void {
    Alert.alert(I18n.t("voidItems"), I18n.t("voidItemsExplanation"), [
      { text: I18n.t("cancel"), style: "cancel" },
      { text: I18n.t("confirm"), onPress: () => {
        const uiInputs: UiInput[] = [];
        uiInputs.push(new UiInput(UiInputKey.UI_BUSINESS_EVENT, VOID_LINE_EVENT));
        uiInputs.push(new UiInput(UiInputKey.LINE_NUMBERS, this.props.selectedItems));
        this.props.performBusinessOperation(this.props.settings.deviceIdentity, MULTI_LINE_EVENT, uiInputs);
      } }
    ], { cancelable: true });
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    featureActionButtonProps: state.uiState.featureActionButtonProps,
    selectedItems: state.itemSelectionState.selectedItems,
    settings: state.settings,
    uiState: state.uiState
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})(ItemSelectionActionPanel);
