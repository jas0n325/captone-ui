import * as React from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_ITEM_SUBSCRIPTION_EVENT,
  APTOS_ITEM_COMMENTS_FORM,
  GiftReceiptMode,
  GIFT_RECEIPT_ITEM_EVENT,
  IDisplayInfo,
  IItemDisplayLine,
  ITEM_ORDER_LINE_TYPE,
  ITEM_RETURN_LINE_TYPE,
  ITEM_SALE_LINE_TYPE,
  UiInputKey,
  VOID_LINE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  dataEvent,
  DataEventType,
  IUIData,
  updateUiMode
} from "../../actions";
import {
  AppState,
  SettingsState,
  UI_MODE_PRODUCT_DETAIL,
  UI_MODE_PRODUCT_SCREEN
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import ItemLine from "../common/ItemLine";
import ProductActionPanel from "../common/ProductActionPanel";
import { isTenderLineAvailable, itemDisplayLineHasValidExtensibilityForms } from "../common/utilities";
import {
  isDeliveryFulfillmentGroup,
  isPickupFulfillmentGroup
} from "../common/utilities/subscriptionUtils";
import { NavigationProp } from "../StackNavigatorParams";
import { ProductProps } from "./interfaces";
import { productScreenStyle } from "./styles";

interface StateProps {
  businessEventType: string;
  businessStateError: Error;
  businessStateInProgress: boolean;
  deviceIdentity: DeviceIdentity;
  displayInfo: IDisplayInfo;
  stateValues: Map<string, any>;
  uiMode: string;
  settings: SettingsState;
}

interface DispatchProps {
  dataEvent: ActionCreator;
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends ProductProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

class Product extends React.PureComponent<React.PropsWithChildren<Props>> {
  private styles: any;

  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(productScreenStyle());
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_PRODUCT_SCREEN);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (
      prevProps.businessStateInProgress &&
      !this.props.businessStateInProgress &&
      !this.props.businessStateError &&
      (prevProps.businessEventType === VOID_LINE_EVENT ||
        this.props.businessEventType === VOID_LINE_EVENT ||
        this.props.businessEventType === GIFT_RECEIPT_ITEM_EVENT ||
        this.props.businessEventType === APPLY_ITEM_SUBSCRIPTION_EVENT)
    ) {
      this.props.onExit();
    }
  }

  public componentWillUnmount(): void {
    // Need to set uiMode to UI_MODE_PRODUCT_DETAIL to get detail for the item, undo this when closing
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    const itemLine: IItemDisplayLine = this.getItemLine();
    const isTenderLine: boolean = isTenderLineAvailable(this.props.displayInfo);
    const isReturnItem: boolean =
      itemLine && itemLine.lineType === ITEM_RETURN_LINE_TYPE;
    const isOfflineReturnItem: boolean =
      isReturnItem && itemLine && !!itemLine.offlineReturnReferenceNumber;
    const isReturnWithTransactionItem: boolean = isReturnItem && this.isReturnWithTransactionItem(itemLine);

    const order = this.props.stateValues.get("transaction.order");
    const isPickup: boolean = isPickupFulfillmentGroup(
      order,
      itemLine && itemLine.fulfillmentGroupId
    );
    const isDelivery: boolean = isDeliveryFulfillmentGroup(
      order,
      itemLine && itemLine.fulfillmentGroupId
    );
    const hasOrderItem: boolean = this.props.displayInfo &&
      this.props.displayInfo.itemDisplayLines &&
      this.props.displayInfo.itemDisplayLines.some((line) =>
        line.lineType === ITEM_ORDER_LINE_TYPE);
    const hasFulfilledItem: boolean = this.props.displayInfo &&
      this.props.displayInfo.itemDisplayLines &&
      this.props.displayInfo.itemDisplayLines.some((line) =>
        line.lineType === ITEM_SALE_LINE_TYPE && line.fulfillmentGroupId > 0 && !line.subscribed);
    const isSubscriptionItem: boolean =
      itemLine && itemLine.eligibleForSubscription;
    const isItemWithExtensibilityForms: boolean = itemLine && itemDisplayLineHasValidExtensibilityForms(itemLine);
    return (
      <BaseView style={this.styles.root}>
        <Header
          title={I18n.t("lineItemActions")}
          backButton={{ name: "Back", action: this.props.onExit }}
          returnMode={isReturnItem}
        />
        {
          // Prevent rerender error after item void
          this.props.showLine && itemLine && <ItemLine line={itemLine} />
        }
        <ProductActionPanel
          isReturn={isReturnItem}
          isReturnWithTransactionItem={isReturnWithTransactionItem}
          isOfflineReturnItem={isOfflineReturnItem}
          isEligibleForSubscription={
            isSubscriptionItem && !isPickup && !isDelivery && !hasFulfilledItem && !hasOrderItem
          }
          isTenderLineAvailable={isTenderLine}
          isItemWithExtensibilityForms={isItemWithExtensibilityForms}
          onProductInformation={this.onProductInformation}
          onChangeQuantity={this.onChangeQuantity}
          onChangePrice={this.onChangePrice}
          onItemDiscount={this.onItemDiscount}
          markAsGift={this.markAsGift}
          onAssignSalesperson={this.onAssignSalesperson}
          onVoidItem={this.onVoidItem}
          onCommentItem={this.onItemComments}
          onTaxPress={this.onItemTaxPress}
          onReturnReasonChange={this.onReturnReasonChange}
          onItemSubscription={this.onItemSubscription}
          onAdditionalInfo={this.onAdditionalInfo}
        >
          {this.props.children}
        </ProductActionPanel>
      </BaseView>
    );
  }

  private getItemLine(): IItemDisplayLine {
    // Method needed to show updates to the item line in the redux-state
    return this.props.displayInfo.itemDisplayLines.find(
      (itemDisplayLine: IItemDisplayLine) => {
        return itemDisplayLine.lineNumber === this.props.lineNumber;
      }
    );
  }

  private isReturnWithTransactionItem(itemLine: IItemDisplayLine): boolean {
    return itemLine.lineNumberFromReturnTransaction !== undefined &&
        itemLine.sublineIndexFromReturnItem !== undefined;
  }

  private onItemComments = (): void =>
    this.props.onItemComments(this.getItemLine());

  private onProductInformation = (): void => {
    this.props.updateUiMode(UI_MODE_PRODUCT_DETAIL);
    this.props.onProductInformation(this.getItemLine());
  };

  private onChangeQuantity = (): void => {
    this.props.onChangeQuantity(this.getItemLine());
  };

  private onItemTaxPress = (): void => {
    this.props.onItemTaxPress(this.getItemLine());
  };

  private onChangePrice = (): void => {
    this.props.onChangePrice(this.getItemLine());
  };

  private onItemDiscount = (): void => {
    this.props.onItemDiscount(this.getItemLine());
  };

  private onItemSubscription = (): void => {
    this.props.onItemSubscription(this.getItemLine());
  };

  private onAdditionalInfo = (): void => {
    //TODO: DSS-13052 - adjust passed formName once more extensibility forms are available.
    this.props.onAdditionalInfo(this.getItemLine(), APTOS_ITEM_COMMENTS_FORM);
  }

  private markAsGift = (): void => {
    const currentItem: IItemDisplayLine = this.getItemLine();
    if (!currentItem.giftReceipt) {
      this.onGiftModeSelection();
    } else {
      //Item line is already a gift item turn gift off.
      this.onMarkAsGiftItem(GiftReceiptMode.None);
    }
  };

  private onGiftModeSelection(): void {
    const previouslyPresentGiftItem: IItemDisplayLine =
      this.props.displayInfo.itemDisplayLines.find(
        (itemLine: IItemDisplayLine) => itemLine.giftReceipt
      );

    const transactionHasGiftReceiptMode: boolean =
      this.props.stateValues.get("transaction.giftReceiptMode") &&
      this.props.stateValues.get("transaction.giftReceiptMode") !==
        GiftReceiptMode.None;

    if (
      (previouslyPresentGiftItem || this.getItemLine().quantity > 1) &&
      !transactionHasGiftReceiptMode
    ) {
      Alert.alert(
        I18n.t("giftReceipt"),
        I18n.t("giftReceiptTitle"),
        [
          { text: I18n.t("cancel"), style: "cancel" },
          {
            text: I18n.t("single"),
            onPress: () => this.onMarkAsGiftItem(GiftReceiptMode.Shared)
          },
          {
            text: I18n.t("multiple"),
            onPress: () => this.onMarkAsGiftItem(GiftReceiptMode.Individual)
          }
        ],
        { cancelable: true }
      );
    } else {
      this.onMarkAsGiftItem(undefined);
    }
  }

  private onMarkAsGiftItem(giftReceiptMode: GiftReceiptMode): void {
    this.props.performBusinessOperation(
      this.props.deviceIdentity,
      GIFT_RECEIPT_ITEM_EVENT,
      [
        new UiInput("lineNumber", this.props.lineNumber),
        new UiInput(UiInputKey.GIFT_RECEIPT_MODE, giftReceiptMode)
      ]
    );
  }

  private onAssignSalesperson = (): void => {
    this.props.onAssignSalesperson(this.getItemLine());
  };

  private onVoidItem = (): void => {
    Alert.alert(
      I18n.t("voidItem"),
      I18n.t("voidItemExplanation"),
      [
        { text: I18n.t("cancel"), style: "cancel" },
        {
          text: I18n.t("confirm"),
          onPress: () => {
            // FIXME: Rework this to call businessOperation.request: https://jira.aptos.com/browse/DSS-3186
            // This is an anti-pattern:  Everything that is needed to be known is known here, so there is no reason to
            // create a IUIData event, and then have the resolveDataEvent's handleUIData do what should have been done
            // here.  There is no value added in resolveDataEvent's handleUIData.
            const uiData: IUIData = {
              eventType: VOID_LINE_EVENT,
              data: { lineNumber: this.props.lineNumber }
            };
            this.props.dataEvent(DataEventType.IUIData, uiData);
          }
        }
      ],
      { cancelable: true }
    );
  };

  private onReturnReasonChange = (): void => {
    this.props.onReturnReasonChange(this.getItemLine());
  };
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessEventType: state.businessState.eventType,
    businessStateError: state.businessState.error,
    businessStateInProgress: state.businessState.inProgress,
    deviceIdentity: state.settings.deviceIdentity,
    displayInfo: state.businessState.displayInfo,
    stateValues: state.businessState.stateValues,
    uiMode: state.uiState.mode,
    settings: state.settings
  };
};

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  dataEvent: dataEvent.request,
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(Product);
