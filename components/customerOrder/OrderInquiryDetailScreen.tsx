import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Menu, { MenuItem } from "react-native-material-menu";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {IConfigurationManager, UiInput} from "@aptos-scp/scp-component-store-selling-core";
import {
  isPrePaidOrder,
  mapOrderTypeCode,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { OrderType } from "@aptos-scp/scp-types-commerce-transaction";
import { CustomerOrder } from "@aptos-scp/scp-types-orders";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  cancelItems,
  getOrders, getTaxCustomerFromHistorical,
  OrderItemSelection,
  pickupItems,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  OrdersState
} from "../../reducers";
import {
  UI_MODE_CUSTOMER_ORDER_CANCEL,
  UI_MODE_CUSTOMER_ORDER_PICKUP
} from "../../reducers/uiState";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import {
  checkedLineItems,
  getTestIdProperties,
  getTransactionIsOpen,
  hasCancelableItems,
  hasReadyForPickupItems,
  inActionMode, isPartialPickupFulfillmentEnabled,
  shouldEnableDoneButton
} from "../common/utilities";
import VectorIcon from "../common/VectorIcon";
import { NavigationScreenProps } from "../StackNavigatorParams";
import CustomerOrderDisplay from "./CustomerOrderDisplay";
import { OrderInquiryDetailScreenProps } from "./interfaces";
import { orderDetailScreenStyle } from "./styles";

interface State {
  inProgress: boolean;
  isReservedOrder: boolean;
  currentScreen: string;
}

interface StateProps {
  orders: OrdersState;
  businessState: BusinessState;
  uiMode: string;
  workingSelection: OrderItemSelection[];
  configManager: IConfigurationManager;
}

interface DispatchProps {
  getLocalOrders: ActionCreator;
  updateUiMode: ActionCreator;
  performCancelItems: ActionCreator;
  performPickupItems: ActionCreator;
  getTaxCustomerFromHistorical: ActionCreator;
}

interface Props extends OrderInquiryDetailScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"orderInquiryDetail"> {}

interface CurrentState {
  hasOrder: boolean;
  hideKebab: boolean;
  itemsReadyForPickup: boolean;
  itemsReadyForCancel: boolean;
  enableDoneButton: boolean;
}

class OrderInquiryDetailScreen extends React.Component<Props, State> {
  private menu: any;
  private styles: any;
  private testID: string;

  public constructor(props: Props) {
    super(props);
    this.testID = "OrderInquiryDetailScreen";
    this.styles = Theme.getStyles(orderDetailScreenStyle());
    this.state = { inProgress: false, isReservedOrder: false, currentScreen: undefined };
  }

  public componentDidMount(): void {
    this.getOrders();
  }

  public componentWillUnmount(): void {
    if (inActionMode(this.props.uiMode)) {
      this.props.updateUiMode(undefined);
    }
  }

  public render(): JSX.Element {
    const currentState: {
      hasOrder: boolean;
      hideKebab: boolean;
      itemsReadyForPickup: boolean;
      itemsReadyForCancel: boolean;
      enableDoneButton: boolean;
    } = this.getCurrentState();

    return (
      <BaseView style={this.styles.fill}>
        <Header
          isVisibleTablet={true}
          title={this.getScreenTitle()}
          testID={this.testID}
          backButton={{
            name: "Back",
            title: this.getBackButtonTitle(),
            action: () => {
              if (inActionMode(this.props.uiMode)) {
                this.props.updateUiMode(undefined);
              } else {
                this.props.onExit();
              }
            }
          }}
          rightButton={currentState.hideKebab ? undefined :
            this.renderKebabMenu(currentState.itemsReadyForPickup, currentState.itemsReadyForCancel)}
        />
        <View style={this.styles.root}>
          {
            currentState.hasOrder &&
            <CustomerOrderDisplay
              customerOrder={this.getOrderFromStateProps()}
              preferredLanguage={this.props.businessState.stateValues.get("UserSession.user.preferredLanguage")}
            />
          }
          {
            currentState.hasOrder &&
            Theme.isTablet &&
            <View style={this.styles.rightPanel}>
              {
                !inActionMode(this.props.uiMode) &&
                this.renderTabletButton(currentState.itemsReadyForPickup, "pickupItems", this.handleMenuPickup)
              }
              {
                !inActionMode(this.props.uiMode) &&
                this.renderTabletButton(currentState.itemsReadyForCancel, "cancelItems", this.handleMenuCancel)
              }
              {
                inActionMode(this.props.uiMode) &&
                this.renderTabletButton(currentState.enableDoneButton, "done", this.handleDoneButton)
              }
            </View>
          }
          {
            currentState.hasOrder &&
            !Theme.isTablet &&
            inActionMode(this.props.uiMode) &&
            this.renderDoneButton(currentState.enableDoneButton)
          }
        </View>
      </BaseView>
    );
  }

  private renderTabletButton(enabled: boolean, buttonText: string, onPressEvent:() => void): JSX.Element {
    return(
      <TouchableOpacity
        {...getTestIdProperties(this.testID, `${buttonText}-button`)}
        style={[this.styles.btnPrimary, this.styles.button, !enabled && this.styles.btnDisabled]}
        disabled={!enabled}
        onPress={onPressEvent}
      >
        <Text
          {...getTestIdProperties(this.testID, `${buttonText}-button-text`)}
          style={[this.styles.btnPrimaryText, !enabled && this.styles.btnTextDisabled]}>
          {I18n.t(buttonText)}
        </Text>
      </TouchableOpacity>
    );
  }

  private renderDoneButton(enabled: boolean): JSX.Element {
    return (
      <View style={this.styles.doneArea}>
        <TouchableOpacity
          {...getTestIdProperties(this.testID, "done-button")}
          style={[this.styles.doneButton, this.styles.button, !enabled && this.styles.btnDisabled]}
          onPress={this.handleDoneButton}
          disabled={!enabled}
        >
          <Text
            {...getTestIdProperties(this.testID, "done-button-text")}
            style={[this.styles.btnPrimaryText, !enabled && this.styles.btnTextDisabled]}>
            {I18n.t("done")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  private renderKebabMenu(itemsReadyForPickup: boolean, itemsReadyForCancel: boolean): JSX.Element {
    return (
      <View>
        <Menu
          ref={this.setMenuRef}
          button={
            <TouchableOpacity style={this.styles.menuIcon}
              {...getTestIdProperties(this.testID, "menu-icon")}
              onPress={() => this.showMenu()}>
              <VectorIcon
                  name={"Kebab"}
                  fill={this.styles.menuIcon.color}
                  height={this.styles.menuIcon.fontSize}
              />
            </TouchableOpacity>}
        >
          <MenuItem
            onPress={this.handleMenuPickup}
            {...getTestIdProperties(this.testID, "pickupMenu")}
            disabled={!itemsReadyForPickup}>
              {I18n.t("pickupItems")}
          </MenuItem>
          <MenuItem
            onPress={this.handleMenuCancel}
            {...getTestIdProperties(this.testID, "cancelMenu")}
            disabled={!itemsReadyForCancel}>
              {I18n.t("cancelItems")}
          </MenuItem>
        </Menu>
      </View>);
  }

  private getCurrentState(): CurrentState {
    const hasOrder = this.hasOrder();
    const inTransaction: boolean = getTransactionIsOpen(this.props.businessState.stateValues);
    const hideKebab: boolean = Theme.isTablet || inActionMode(this.props.uiMode);
    let itemsReadyForPickup: boolean = false;
    let itemsReadyForCancel: boolean = false;
    let enableDoneButton: boolean = false;

    if (hasOrder) {
      const order = this.getOrderFromStateProps();
      const orderType = mapOrderTypeCode(order.orderTypeCode);
      const lineItems = order.lineItems;
      itemsReadyForPickup = !inTransaction &&
                            hasReadyForPickupItems(lineItems) &&
                            this.actionCanBeEnabled(order, orderType);
      itemsReadyForCancel = !inTransaction &&
                            hasCancelableItems(lineItems) &&
                            this.actionCanBeEnabled(order, orderType);

      if (this.props.workingSelection) {
        enableDoneButton = shouldEnableDoneButton(this.props.uiMode, this.props.workingSelection,
            isPartialPickupFulfillmentEnabled(this.props.configManager));
      }
    }
    return {
      hasOrder,
      hideKebab,
      itemsReadyForPickup,
      itemsReadyForCancel,
      enableDoneButton
    };
  }

  private actionCanBeEnabled(order: any,orderType: OrderType): boolean {
    return ((orderType === OrderType.Regular && isPrePaidOrder(order)) ||
    orderType === OrderType.Reservation);
  }

  private getScreenTitle(): string {
    if (this.props.uiMode === UI_MODE_CUSTOMER_ORDER_PICKUP || this.state.currentScreen === UI_MODE_CUSTOMER_ORDER_PICKUP) {
      return I18n.t("orderPickupModeTitle");
    } else if (this.props.uiMode === UI_MODE_CUSTOMER_ORDER_CANCEL || this.state.currentScreen === UI_MODE_CUSTOMER_ORDER_CANCEL) {
      return this.state.isReservedOrder ? I18n.t("cancel") : I18n.t("orderCancelModeTitle");
    } else {
      return I18n.t("orderInquiryDetail");
    }
  }

  private getBackButtonTitle(): string {
    if (Theme.isTablet){
      if (inActionMode(this.props.uiMode)) {
        return I18n.t("orderInquiryDetail");
      } else if(this.props.isCustomerOrder) {
        if (!this.props.isCustomerHistory){
          return I18n.t("salesHistory");
        } else {
          return I18n.t("customerHistory");
        }
      } else {
        return I18n.t("orderInquiry");
      }
    } else {
      return "";
    }
  }

  private setMenuRef = (ref: any) => {
    this.menu = ref;
  }

  private hideMenu = () => {
    this.menu.hide();
  }

  private showMenu = () => {
    this.menu.show();
  }

  // callable only if hasOrder() == true
  private getOrderFromStateProps(): CustomerOrder {
    return this.props.orders.orders[0];
  }

  // returns TRUE if the state has a customer order
  private hasOrder(): boolean {
    return this.state.inProgress
        && this.props.orders !== undefined
        && this.props.orders.orders !== undefined;
  }

  private getOrders(): void {
    const orderReferenceId = this.props.orderReferenceId;
    if (orderReferenceId && orderReferenceId.length > 0) {

      if (this.props.isCustomerOrder) {
        const uiInputs: UiInput[] = [];
        uiInputs.push(new UiInput(UiInputKey.ORDER_REFERENCE_ID, this.props.orderReferenceId));
        this.props.getLocalOrders(this.props.settings.deviceIdentity, uiInputs);
      }

      this.setState({ inProgress: true });
      if (this.props.orders && this.props.orders.orders) {
        const order = this.getOrderFromStateProps();
        if (order.orderTypeCode === OrderType.Reservation) {
          this.setState({ isReservedOrder: true });
        }
      }
    } else {
      // todo: DOMC-257 - handle when there is no order reference id
    }
  }

  private handleMenuPickup = () => {
    if (!Theme.isTablet) {
      this.hideMenu();
    }
    this.props.updateUiMode(UI_MODE_CUSTOMER_ORDER_PICKUP);
  }

  private handleMenuCancel = () => {
    if (!Theme.isTablet) {
      this.hideMenu();
    }
    this.props.updateUiMode(UI_MODE_CUSTOMER_ORDER_CANCEL);
  }

  private handleDoneButton = () => {
    const order = this.getOrderFromStateProps();
    const uiInputs: UiInput[] = [];
    let selectedOrderItems: OrderItemSelection[] = [];

    if (order && order.transactionReference) {
      this.props.getTaxCustomerFromHistorical(order.transactionReference.transactionId);
    }

    if (this.props.workingSelection) {
      selectedOrderItems = checkedLineItems(
          this.props.uiMode,
          this.props.workingSelection,
          isPartialPickupFulfillmentEnabled(this.props.configManager));
    }

    uiInputs.push(new UiInput(UiInputKey.ORDER, order));
    uiInputs.push(new UiInput(UiInputKey.CURRENCY_CODE, order.currencyCode));
    uiInputs.push(new UiInput(UiInputKey.SELECTED_ORDER_ITEMS, selectedOrderItems));

    if (this.props.uiMode === UI_MODE_CUSTOMER_ORDER_CANCEL) {
      this.setState({currentScreen: UI_MODE_CUSTOMER_ORDER_CANCEL})
      this.props.performCancelItems(this.props.settings.deviceIdentity, uiInputs);
    } else if (this.props.uiMode === UI_MODE_CUSTOMER_ORDER_PICKUP) {
      this.setState({currentScreen: UI_MODE_CUSTOMER_ORDER_PICKUP})
      this.props.performPickupItems(this.props.settings.deviceIdentity, uiInputs);
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    orders: state.orders,
    businessState: state.businessState,
    uiMode: state.uiState.mode,
    workingSelection: state.orders.workingSelection ? state.orders.workingSelection : state.orders.startingSelection,
    configManager: state.settings.configurationManager
  };
};

const mapDispatchToProps: DispatchProps = {
  getLocalOrders: getOrders.request,
  updateUiMode: updateUiMode.request,
  performCancelItems: cancelItems.request,
  performPickupItems: pickupItems.request,
  getTaxCustomerFromHistorical: getTaxCustomerFromHistorical.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof OrderInquiryDetailScreen>()(OrderInquiryDetailScreen));
