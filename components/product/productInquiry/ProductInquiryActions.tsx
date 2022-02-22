import * as React from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import { FormInstance, formValueSelector, InjectedFormProps, reduxForm, SubmissionError } from "redux-form";

import { Quantity } from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  IRetailLocation,
  isFeatureConfigPresentAndEnabled,
  isMixedBasketRestricted,
  MixedBasketState,
  PriceInquiry,
  QUANTITY_CHANGE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { FulfillmentType } from "@aptos-scp/scp-types-commerce-transaction";
import { DeliveryMethodResult } from "@aptos-scp/scp-types-inventory";

import I18n from "../../../../config/I18n";
import { AppState, RetailLocationsState } from "../../../reducers";
import { FeedbackNoteType } from "../../../reducers/feedbackNote";
import FeedbackNote from "../../common/FeedbackNote";
import VectorIcon from "../../common/VectorIcon";
import { productInquiryDetailStyle } from "../styles";
import Theme from "../../../styles";
import { ProductInquiryButtonType, ProductInquiryInventory, ProductInquiryQuantityField } from "./";

interface StateProps {
  quantity: string;
  hasInventoryError: boolean;
  configurationManager: IConfigurationManager;
  retailLocations: RetailLocationsState;
}

interface Props extends StateProps {
  testID: string;
  item: PriceInquiry;
  handleAddToBasket: (quantity: number, fulfillmentType?: FulfillmentType) => void;
  localAvailableInventory: number;
  networkAvailableInventory: DeliveryMethodResult[];
  carryoutEnabled: boolean;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  validateInventory: boolean;
  displayInventoryCounts: boolean;
  mixedBasketState: MixedBasketState;
  unavailableItem?: boolean;
  nearbyLocationEnabled?: boolean;
  onFindNearbyLocation: () => void;
  selectedRetailLocation?: IRetailLocation;
  selectedInventory?: number;
}

export interface ProductInquiryForm {
  quantity: string;
  fulfillmentType?: FulfillmentType;
  availableQuantity: number;
}

type ProductInquiryActionsFormProps = Props & InjectedFormProps<ProductInquiryForm, Props> &
    FormInstance<ProductInquiryForm, undefined>;

class ProductInquiryActions extends React.PureComponent<ProductInquiryActionsFormProps> {
  private allowQuantityChange: boolean;
  private styles: any;

  constructor(props: ProductInquiryActionsFormProps) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.allowQuantityChange = isFeatureConfigPresentAndEnabled(QUANTITY_CHANGE_EVENT, props.configurationManager);
    this.styles = Theme.getStyles(productInquiryDetailStyle());
  }

  public onSubmit(data: ProductInquiryForm, fulfillmentType: FulfillmentType, availableQuantity: number): void {
    if (this.props.validateInventory &&
      ((availableQuantity && parseInt(data.quantity, 10) > availableQuantity) ||
      this.props.hasInventoryError)) {
      throw new SubmissionError({quantity: I18n.t("insufficientQuantity")});
    } else {
      this.props.handleAddToBasket(parseInt(data.quantity, 10), fulfillmentType);
      this.props.reset();
    }
  }

  public render(): React.ReactNode {
    return (
      <>
        <ProductInquiryQuantityField
          quantity={this.props.quantity}
          onChange={(param: string) => this.props.change("quantity", param)}
          isValid={this.props.valid}
          allowQuantityChange={this.allowQuantityChange}
        />
        {
          this.renderMixedBasketMessage()
        }
        {
          this.props.item &&
          <>
            {
              this.renderFindNearby()
            }
            {
              this.renderFulfillmentButtons()
            }
            <View style={this.styles.borderLine}></View>
          </>
        }
      </>
    );
  }

  private renderFindNearby(): JSX.Element {
    return (this.props.nearbyLocationEnabled &&
      <View style={this.styles.buttonContainerForfindNearby}>
        <ProductInquiryInventory
          testID={this.props.testID}
          buttonType={ProductInquiryButtonType.secondary}
          text={I18n.t("findNearby")}
          icon={(fill: string) => <VectorIcon name="Location" height={28} fill={fill} />}
          onPress={() => this.props.onFindNearbyLocation()}
          availableInventory={this.pickupQuantity}
          inventoryEnabled={false}
          displayInventoryCounts={this.props.displayInventoryCounts}
          mixedBasketState={this.props.mixedBasketState}
          findNearby={true}
        /></View>);
  }

  private renderFulfillmentButtons(): JSX.Element {
    return (
      <View style={this.styles.buttonContainer}>
        <>
          <><ProductInquiryInventory
            testID={this.props.testID}
            buttonType={ProductInquiryButtonType.primary}
            text={I18n.t("carryout")}
            icon={(fill: string) => <VectorIcon name="Basket" height={28} fill={fill} />}
            onPress={() => {
              this.props.handleAddToBasket(parseInt(this.props.quantity, 10));
              this.props.reset();
            }}
            availableInventory={this.props.localAvailableInventory}
            inventoryEnabled={this.props.validateInventory}
            displayInventoryCounts={this.props.displayInventoryCounts}
            fulfillmentType={FulfillmentType.cashAndCarry}
            mixedBasketState={this.props.mixedBasketState}
            unavailableItem={this.props.unavailableItem}
            findNearby={false} />
            {(this.props.pickupEnabled || this.props.deliveryEnabled) && <View style={this.styles.borderLine}></View>}
          </>
          <>{this.props.pickupEnabled &&
            <><ProductInquiryInventory
              testID={this.props.testID}
              buttonType={ProductInquiryButtonType.secondary}
              text={I18n.t("orderPickupModeTitle")}
              icon={(fill: string) => <VectorIcon name="Store" height={28} fill={fill} />}
              onPress={this.props.handleSubmit((data: ProductInquiryForm) => this.onSubmit(data, FulfillmentType.shipToStore, this.props.selectedInventory ?
                this.props.selectedInventory : this.pickupQuantity))}
              availableInventory={this.props.selectedInventory ? this.props.selectedInventory : this.pickupQuantity}
              inventoryEnabled={this.props.validateInventory}
              displayInventoryCounts={this.props.displayInventoryCounts}
              fulfillmentType={FulfillmentType.shipToStore}
              mixedBasketState={this.props.mixedBasketState}
              unavailableItem={this.props.unavailableItem}
              storeName={this.getStoreName()}
              findNearby={false} />
              {this.props.deliveryEnabled && <View style={this.styles.borderLine}></View>}
            </>}
          </>
          <>{this.props.deliveryEnabled &&
            <><ProductInquiryInventory
              testID={this.props.testID}
              buttonType={ProductInquiryButtonType.secondary}
              text={I18n.t("deliverIt")}
              icon={(fill: string) => <VectorIcon name="DeliveryTruck" height={28} fill={fill} />}
              onPress={this.props.handleSubmit((data: ProductInquiryForm) => this.onSubmit(data, FulfillmentType.shipToCustomer, this.deliveryQuantity))}
              availableInventory={this.deliveryQuantity}
              inventoryEnabled={this.props.validateInventory}
              displayInventoryCounts={this.props.displayInventoryCounts}
              fulfillmentType={FulfillmentType.shipToCustomer}
              mixedBasketState={this.props.mixedBasketState}
              unavailableItem={this.props.unavailableItem}
              findNearby={false} />
            </>}
          </>
        </>
      </View>);
  }

  private getStoreName(): string {
    const retailLocation: IRetailLocation = this.props.selectedRetailLocation ?
      this.props.selectedRetailLocation : this.props.retailLocations.retailLocation;
    if (retailLocation) {
      return `${retailLocation.name} (${retailLocation.retailLocationId})`;
    }
    return undefined;
  }

  private renderMixedBasketMessage(): JSX.Element {
    if (isMixedBasketRestricted(this.props.mixedBasketState)) {
      const title: string = I18n.t("mixedBasketTitle");
      const message: string =I18n.t("mixedBasketNotAllowedMsgForPDP");
      return <View style={{marginHorizontal: 4, paddingHorizontal: 6}}>
        <FeedbackNote
          messageTitle={title}
          message={message}
          messageType={FeedbackNoteType.Info}/>
        </View>;
    }
  }

  private get pickupQuantity(): number {
    const { networkAvailableInventory } = this.props;

    const pickupInventory = networkAvailableInventory &&
        this.props.networkAvailableInventory.find((deliveryMethod: DeliveryMethodResult) => {
          return deliveryMethod.deliveryMethod === FulfillmentType.shipToStore;
        });

    return pickupInventory && new Quantity(pickupInventory.quantities[0].quantity.amount).amount;
  }

  private get deliveryQuantity(): number {
    const { networkAvailableInventory } = this.props;

    const deliveryInventory = networkAvailableInventory &&
        networkAvailableInventory.find((deliveryMethod: DeliveryMethodResult) => {
          return deliveryMethod.deliveryMethod === FulfillmentType.shipToCustomer;
        });

    return deliveryInventory && new Quantity(deliveryInventory.quantities[0].quantity.amount).amount;
  }
}

const selector = formValueSelector("productInquiryForm");

const mapStateToProps = (state: AppState) => {
  const quantity = selector(state, "quantity");
  const hasInventoryError: boolean = !!state.inventory.error;

  return {
    quantity,
    hasInventoryError,
    configurationManager: state.settings.configurationManager,
    retailLocations: state.retailLocations
  };
};

const ProductInquiryReduxForm = reduxForm<ProductInquiryForm, Props>({
  form: "productInquiryForm",
  initialValues: {
    quantity: "1"
  }
})(ProductInquiryActions);

export default connect(mapStateToProps)(ProductInquiryReduxForm);
