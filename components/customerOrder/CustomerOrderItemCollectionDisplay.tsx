import * as React from "react";
import {FlatList, Text, TouchableWithoutFeedback, View} from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import {
  CustomerOrderLineItem,
  CustomerOrderLineItemCollection,
  ItemAttribute,
  ItemAttributeCollection,
  Status
} from "@aptos-scp/scp-types-orders";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  gatherOrderItemSelections,
  OrderItemSelection,
  updateOrderItemQuantity,
  updateOrderItemSelections
} from "../../actions";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import StatusTag, { StatusType } from "../common/StatusTag";
import {
  formattedAmountFromPosted,
  getTestIdProperties,
  inActionMode, isPartialPickupFulfillmentEnabled,
  showCheckboxes
} from "../common/utilities";
import VectorIcon from "../common/VectorIcon";
import { customerOrderDisplayStyles } from "./styles";
import NumericInput from "../common/customInputs/NumericInput";
import { UI_MODE_CUSTOMER_ORDER_PICKUP } from "../../reducers/uiState";
import {IConfigurationManager} from "@aptos-scp/scp-component-store-selling-core";

interface StateProps {
  uiMode: string;
  workingSelection: OrderItemSelection[];
  configManager: IConfigurationManager;
}

interface Props extends StateProps, DispatchProps {
  customerLineItems: CustomerOrderLineItemCollection;
  preferredLanguage?: string;
}

interface DispatchProps {
  startOrderItemSelection: ActionCreator;
  updateOrderItemSelection: ActionCreator;
  updateOrderItemQuantity: ActionCreator;
}

class CustomerOrderItemCollectionDisplay extends React.PureComponent<Props, any> {
  private styles: any;
  private testID: string;
  private numericInputReferences: { [lineNumber: number]: { [sublineIndex: number]: any } } = {};

  constructor(props: Props) {
    super(props);
    this.testID = "CustomerOrderItemCollectionDisplay";
    this.styles = Theme.getStyles(customerOrderDisplayStyles());
    this.state = {
      uiState: undefined,
      workingSelection: [],
      enablePartialFulfillment: isPartialPickupFulfillmentEnabled(this.props.configManager)
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (inActionMode(this.props.uiMode) && !inActionMode(prevProps.uiMode))  {
      this.props.startOrderItemSelection();
    }
  }

  public render(): JSX.Element {
    return (
      <FlatList
        data={this.props.customerLineItems}
        extraData={this.props}
        keyExtractor={(item) => item.lineItemNumber.toString()}
        renderItem={({ item }) => this.renderCustomerLineItem(item)}
      />
    );
  }

  private getActiveQuantity(line: CustomerOrderLineItem): string {
    return (this.props.workingSelection &&
        this.props.workingSelection.find(i => i.lineNumber === line.lineItemNumber).selectedQuantity.toString()) ||
        (this.props.workingSelection &&
        this.props.workingSelection.find(i => i.lineNumber === line.lineItemNumber).quantity.toString());
  }

  private renderCustomerLineItem(line: CustomerOrderLineItem): JSX.Element {
    let unitPrice: string;
    let netLinePrice: string;
    if (line.actualUnitPrice) {
      unitPrice = formattedAmountFromPosted(Money.fromIMoney(line.actualUnitPrice).toIMoney());
    }
    if (line.extendedNetAmount) {
      netLinePrice = formattedAmountFromPosted(Money.fromIMoney(line.extendedNetAmount).toIMoney());
    }

    const itemAttributes = line.itemAttributes;
    const itemName = this.getTranslationItemName(line);

    const uiModeActive: boolean = inActionMode(this.props.uiMode);

    let selectedItem: OrderItemSelection;
    let quantityChanged: number;
    if (this.props.workingSelection){
      selectedItem = this.props.workingSelection.find(i => i.lineNumber === line.lineItemNumber);
      quantityChanged = this.props.workingSelection.find(i => i.lineNumber === line.lineItemNumber).selectedQuantity;
    }
    const selectable: boolean = selectedItem && selectedItem.selectable || false;
    const selected: boolean = selectedItem && selectedItem.selected || false;
    const bordered: boolean = this.state.enablePartialFulfillment &&
        this.shouldEnableCompletedBorder(quantityChanged, line.countableQuantity, selectable);

    return (
      <TouchableWithoutFeedback
          style={this.styles.fill}
          accessible={false}
          {...getTestIdProperties(this.testID, "item-selection")}
          onPress={() => this.props.updateOrderItemSelection(line)}
          disabled={!selectable}
      >
        <View style={this.styles.itemContainer}>
          {this.renderCheckBoxes(selected, selectable)}
          <View style={[this.styles.cardItem, bordered && this.styles.cardSelected,
            (uiModeActive && !selectable && this.styles.itemDisabled || {})]}>
            <View style={this.styles.descriptionCellLine}>
              {this.renderItemName(itemName)}
              {this.renderEditableQuantityArea(line, quantityChanged)}
            </View>
            <View style={this.styles.descriptionCellLine}>
              {this.renderMutedText(I18n.t(line.lookupCode.type.toLowerCase()), line.lookupCode.value)}
              {this.renderQuantityArea(line)}
            </View>
            <View style={this.styles.itemSection}>
              {this.renderItemAttributes(itemAttributes)}
              {this.renderItemPrices(unitPrice, netLinePrice)}
            </View>
            <View style={[this.styles.tagLine, !!line.status && this.styles.separatorLineTop]}>
              {!!line.status && this.renderCustomerOrderItemStatusTag(line.status) }
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  private shouldEnableCompletedBorder = (
      quantityChanged: number,
      countableQuantity: number,
      selectable: boolean
  ): boolean => {
    return (this.props.uiMode === UI_MODE_CUSTOMER_ORDER_PICKUP && selectable) ?
        quantityChanged === countableQuantity : false;
  }

  private renderItemPrices(unitPrice: string, netLinePrice: string): JSX.Element {
    return(
        <View style={this.styles.priceSection}>
          <Text style={[this.styles.itemDetailsText, this.styles.tar]}>
            {unitPrice}
          </Text>
          <Text style={this.styles.itemPriceText}>
            {netLinePrice}
          </Text>
        </View>);
  }

  private renderCheckBoxes(selected: boolean, selectable: boolean): JSX.Element {
    return(showCheckboxes(this.props.uiMode, this.state.enablePartialFulfillment) &&
        <View style={this.styles.checkBoxArea}>
          <VectorIcon
              name={selected ?
                  "CheckedBox" :
                  "UncheckedBox"}
              fill={selectable ?
                  this.styles.checkBox.enabledColor :
                  this.styles.checkBox.disabledColor}
              height={this.styles.checkBox.height}
              width={this.styles.checkBox.height}
          />
        </View>);
  }

  private renderItemName(itemName: string): JSX.Element {
    return(itemName &&
        <View style={this.styles.descriptionCellLine}>
          <Text style={[this.styles.fill, this.styles.itemDescriptionText]}
                numberOfLines={1}
                ellipsizeMode={"tail"}>
            {itemName}
          </Text>
        </View>);
  }

  private renderItemAttributes(itemAttributes: ItemAttributeCollection): JSX.Element {
    return(
        <View style={this.styles.attributeSection}>
        {
          itemAttributes && itemAttributes.length > 0 &&
          itemAttributes.map((attribute: ItemAttribute) => {
            return this.renderMutedText(this.getTranslationAttributeName(attribute),
                this.getTranslationAttributeValue(attribute));
          })
        }
    </View>);
  }
  private renderEditableQuantityArea(line: CustomerOrderLineItem,
                                     quantityChanged: number): JSX.Element {
    const activeQuantity: string = this.getActiveQuantity(line) ?? line.countableQuantity.toString();
    let isReadyForPickup: boolean = true;
    if (line.availableActions){
      isReadyForPickup = line.availableActions.isReadyForPickup ?? true;
    }
    return (
        (this.props.uiMode === UI_MODE_CUSTOMER_ORDER_PICKUP && this.state.enablePartialFulfillment) &&
            <View>

                <TouchableWithoutFeedback
                    {...getTestIdProperties(this.testID, "item-selected-quantity")}
                    onPress={() => this.goToNumericInput(line.lineItemNumber, 0)}
                >
                  <View style={[
                    this.styles.quantityButton,
                    this.styles.removePadding
                  ]}>
                    <NumericInput
                      onRef={(ref: any) => {
                        if (!this.numericInputReferences[line.lineItemNumber]) {
                          this.numericInputReferences[line.lineItemNumber] = {};
                        }

                        this.numericInputReferences[line.lineItemNumber][0] = ref;
                      }}
                      disabled={!isReadyForPickup}
                      style={[this.styles.numericInputStylesToUndo, this.styles.changeQuantityText]}
                      value={activeQuantity}
                      trimLeadingZeroes
                      onChangeText={(newQuantity: string) =>
                          this.props.updateOrderItemQuantity(line, parseInt(newQuantity, 10)
                      )}
                      maxValue={line.countableQuantity}
                      minValue={0}
                      clearOnFocus
                    />
                    <Text
                        style={[this.styles.numericInputStylesToUndo, this.styles.oldTransactionQuantityText]}>
                      {`/${line.countableQuantity}`}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
            </View>
    );
  }

  private goToNumericInput(lineNumber: number, sublineIndex: number): void {
    this.numericInputReferences[lineNumber][sublineIndex].focus();
  }

  private renderQuantityArea(line: CustomerOrderLineItem): JSX.Element {
    return (
          (this.props.uiMode !== UI_MODE_CUSTOMER_ORDER_PICKUP ||
              (this.props.uiMode === UI_MODE_CUSTOMER_ORDER_PICKUP && !this.state.enablePartialFulfillment)) &&
            <Text
                style={[this.styles.fill, this.styles.itemQuantityText]}
                {...getTestIdProperties(this.testID, "item-quantity-area")}
            >
              {`${I18n.t("quantityAbbreviation")}: `}{line.countableQuantity}
            </Text>
    );
  }

  private renderCustomerOrderItemStatusTag(status: Status): React.ReactNode {
    return (
      <StatusTag
        type={StatusType.Neutral}
        label={this.getTranslationStatusName(status)}
      />
    );
  }

  private renderMutedText(type: string, value: string) : JSX.Element {
    return (
      <Text style={this.styles.attributeText}
            numberOfLines={1} ellipsizeMode={"clip"} >{`${type}: ${value}`}</Text>
    );
  }

  private getTranslationItemName(item: any): string {
    // We're using 'any' instead of CustomerOrderLineItem here to support translation of the 'shortDescription'
    //  prop before the translation object contains it. This logic can be streamlined next time we're in here
    //  after the types are updated.
    if (!item) { return undefined; }
    if (item.language && this.props.preferredLanguage && item.language === this.props.preferredLanguage) {
      return item.shortDescription;
    } else if (item.translations && item.translations[this.props.preferredLanguage]){
      const itemTranslation: any = item.translations[this.props.preferredLanguage];
      if (itemTranslation.hasOwnProperty("shortDescription") && itemTranslation.shortDescription) {
        return itemTranslation.shortDescription;
      } else {
        return item.shortDescription;
      }
    } else {
      return item.shortDescription;
    }
  }

  private getTranslationAttributeName(attribute: ItemAttribute): string {
    if (!attribute) { return undefined; }
    if (attribute.language && this.props.preferredLanguage && attribute.language === this.props.preferredLanguage) {
      return attribute.name;
    } else if (attribute.translations && attribute.translations[this.props.preferredLanguage]){
      return attribute.translations[this.props.preferredLanguage].name || attribute.name;
    } else {
      return attribute.name;
    }
  }

  private getTranslationAttributeValue(attribute: any): string {
    // We're using 'any' instead of ItemAttribute here to support translation of the 'value' prop before
    //  it officially exists, hence usage of 'hasOwnProperty' function. This logic can be streamlined next
    //  time we're in here after the types are updated.
    if (!attribute) { return undefined; }
    if (attribute.language && this.props.preferredLanguage && attribute.language === this.props.preferredLanguage) {
      return attribute.value;
    } else if (attribute && (attribute.translations && attribute.translations[this.props.preferredLanguage])) {
      const attributeTranslation: any = attribute.translations[this.props.preferredLanguage];
      if (attributeTranslation.hasOwnProperty("value") && attributeTranslation.value) {
        return attributeTranslation.value;
      } else {
        return attribute.value;
      }
    } else {
      return attribute.value;
    }
  }

  private getTranslationStatusName(status: Status): string {
    if (!status) { return undefined; }
    if (status.language && this.props.preferredLanguage && status.language === this.props.preferredLanguage) {
      return status.name;
    } else if (status.translations && status.translations[this.props.preferredLanguage]){
      return status.translations[this.props.preferredLanguage].name || status.name;
    } else {
      return status.name;
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    uiMode: state.uiState.mode,
    workingSelection: state.orders.workingSelection ? state.orders.workingSelection : state.orders.startingSelection,
    configManager: state.settings.configurationManager
  };
};

const mapDispatchToProps: DispatchProps = {
  startOrderItemSelection: gatherOrderItemSelections.request,
  updateOrderItemSelection: updateOrderItemSelections.request,
  updateOrderItemQuantity: updateOrderItemQuantity.request
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomerOrderItemCollectionDisplay);
