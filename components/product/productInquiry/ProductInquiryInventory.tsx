import * as React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import {
  PosApiError,
  PosBusinessError
} from "@aptos-scp/scp-component-store-selling-core";
import { MixedBasketState } from "@aptos-scp/scp-component-store-selling-features";
import { FulfillmentType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";
import { AppState } from "../../../reducers";
import Theme from "../../../styles";
import { productInquiryDetailStyle } from "../styles";
import { ProductInquiryButtonType } from "./constants";
import { activityIndicatorColor } from "../../styles";
import { getTestIdProperties } from "../../common/utilities";


interface StateProps {
  inventoryIsLoading?: boolean;
  isInventoryError?: boolean;
  inventoryError?: PosBusinessError | Error | PosApiError;
}

interface Props extends StateProps {
  buttonType: ProductInquiryButtonType;
  text: string;
  icon: (fill: string) => React.ReactNode;
  onPress: () => void;
  availableInventory: number;
  inventoryEnabled: boolean;
  displayInventoryCounts: boolean;
  fulfillmentType?: FulfillmentType;
  mixedBasketState: MixedBasketState;
  unavailableItem?: boolean;
  findNearby?: boolean;
  storeName?: string;
  testID: string;
}

interface State {
  mixedBasketDisabled: boolean;
}

class ProductInquiryInventory extends React.PureComponent<Props, State> {
  private styles: any;

  private readonly buttonStyle: any;
  private readonly buttonTextStyle: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(productInquiryDetailStyle());

    this.buttonStyle = this.isPrimaryButton ? this.styles.addButton : this.styles.shipmentButton;
    this.buttonTextStyle = this.isPrimaryButton ? this.styles.addButtonText : this.styles.shipmentButtonText;

    this.state = { mixedBasketDisabled: false };
  }

  public shouldComponentUpdate(nextProps: Props): boolean {
    let shouldUpdate: boolean =
     nextProps.mixedBasketState.allowedMixedBasketTypes.length <= 1 ||
     nextProps.mixedBasketState.allowedMixedBasketTypes !== this.props.mixedBasketState.allowedMixedBasketTypes;

    if (this.props.inventoryEnabled) {
      if (nextProps.inventoryIsLoading !== this.props.inventoryIsLoading ||
          nextProps.isInventoryError !== this.props.isInventoryError ||
          nextProps.availableInventory !== this.props.availableInventory) {
        shouldUpdate = true;
      }
    }
    return shouldUpdate;
  }

  private get isDisabled(): boolean {
    const { availableInventory, fulfillmentType, inventoryError, isInventoryError, inventoryIsLoading } = this.props;
    const actionIsAllowed = this.actionIsAllowed(fulfillmentType);

    if (!actionIsAllowed) {
      return true;
    }

    if (this.props.inventoryEnabled) {
      if (inventoryIsLoading) {
        return true;
      } else {
        if (fulfillmentType !== FulfillmentType.cashAndCarry) {
          if (isInventoryError && inventoryError instanceof PosBusinessError) {
            return true;
          } else if (availableInventory < 1) {
            return true;
          }
        }
      }
    }

    return false;
  }

  public render(): React.ReactNode {
    return (
      <View>
        <TouchableOpacity
          {...getTestIdProperties(this.props.testID,
            this.props.fulfillmentType ? `${this.props.fulfillmentType}-button` : `findNearby-button`)}
          style={[
            this.buttonStyle,
            this.isDisabled && this.styles.disabledButton,
            this.props.storeName && this.styles.pickupButtonHeight
          ]}
          onPress={this.props.onPress}
          disabled={this.isDisabled}
        >
          <View style={this.styles.buttonInner}>
            <View
              style={[
                this.styles.buttonIconContainer,
                this.isSecondaryButton && this.styles.shipmentButtonIconContainer,
                this.isDisabled && this.styles.disabledButtonIconContainer,
                this.props.storeName && this.styles.pickupIconSeparator
              ]}
            >
              {this.props.icon(this.iconColor)}
            </View>
            <View style={this.styles.buttonText}>
              <Text
                style={[
                  this.buttonTextStyle,
                  this.isDisabled && this.styles.disabledButtonText
                ]}
              >
                {this.props.text}
              </Text>
              {this.props.storeName &&
                <Text {...getTestIdProperties(this.props.testID, `pickupStore-text`)}
                  style={this.styles.pickupStoreText}>{this.props.storeName}</Text>}
            </View>
          </View>
        </TouchableOpacity>
        { this.props.inventoryEnabled && this.renderInventoryText()}
      </View>
    );
  }

  private get iconColor(): string {
    if (this.isDisabled) {
      return this.styles.disabledButtonIconContainer.color;
    } else if (this.isSecondaryButton) {
      return this.styles.shipmentButtonIconContainer.color;
    } else {
      return this.styles.buttonIconContainer.color;
    }
  }

  private renderInventoryText(): React.ReactNode {
    if (this.props.inventoryIsLoading) {
      return this.renderInventoryStatus(true, I18n.t("checkingInventory"));
    } else if (this.props.isInventoryError && this.props.inventoryError instanceof PosBusinessError) {
      const errorMessage = this.props.inventoryError.localizableMessage.i18nCode;
      return this.renderInventoryStatus(false, I18n.t(`${errorMessage}`));
    } else if (this.getPositiveAvailableInventory() >= 0) {
      return this.renderInventoryStatus(false, this.availableInventoryText);
    }
  }

  private renderInventoryStatus(showActivity: boolean, statusMessage: string): React.ReactNode {
    const textStyle = [
      showActivity ? this.styles.availableInventoryText : this.styles.checkingInventoryText,
      this.availabilityStyle
    ];

    return (
      <View style = {this.styles.availableButton}>
        { showActivity && <ActivityIndicator style={this.styles.activityIndicator} color={activityIndicatorColor} /> }
        <Text style={textStyle}>{ statusMessage }</Text>
      </View>
    );
  }

  private get isPrimaryButton(): boolean {
    return this.props.buttonType === ProductInquiryButtonType.primary;
  }

  private get isSecondaryButton(): boolean {
    return this.props.buttonType === ProductInquiryButtonType.secondary;
  }

  private get availabilityStyle(): any {
    const isAvailable: boolean = this.props.availableInventory > 0;

    if (this.props.inventoryIsLoading || this.props.isInventoryError) {
      return this.styles.unavailableInventoryText;
    }

    return isAvailable ? this.styles.availablePositive : this.styles.availableNegative;
  }

  private get availableInventoryText(): string {
    let availability: string;
    const count: string = this.props.displayInventoryCounts ? this.getPositiveAvailableInventory().toString() : "";

    if (this.props.displayInventoryCounts) {
      availability = I18n.t("inventoryCountAvailability", { count });
    } else {
      availability = I18n.t(this.getPositiveAvailableInventory() ? "available" : "unavailable");
    }

    return availability;
  }

  private getPositiveAvailableInventory(): number {
    return this.props.availableInventory && this.props.availableInventory > 0 ? this.props.availableInventory : 0;
  }

  private actionIsAllowed(fulfillmentType: FulfillmentType): boolean {
    const foundAction = this.props.mixedBasketState.allowedMixedBasketTypes.some(buttonType =>
      buttonType === fulfillmentType || this.props.findNearby);
    return !!foundAction;
  }
}

export const mapStateToProps = (state: AppState): StateProps => {
  const { error: inventoryError, inProgress: inventoryIsLoading } = state.inventory;
  return {
    inventoryIsLoading,
    inventoryError,
    isInventoryError: !!inventoryError
  };
};

export default connect(mapStateToProps)(ProductInquiryInventory);
