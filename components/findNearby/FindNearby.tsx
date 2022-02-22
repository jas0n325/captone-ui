import _ from "lodash";
import * as React from "react";
import { ActivityIndicator, FlatList, Switch, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { PosApiError, PosBusinessError } from "@aptos-scp/scp-component-store-selling-core";
import {
  getAddressFormatorDefault,
  getDefaultPhoneFormat,
  SSF_ITEM_REQUIRES_PRICE_ENTRY,
  StoreItem
} from "@aptos-scp/scp-component-store-selling-features";
import { IAddress } from "@aptos-scp/scp-types-commerce-transaction";
import { InventoryItem } from "@aptos-scp/scp-types-inventory";

import I18n from "../../../config/I18n";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import { colors } from "../../styles/styles";
import BaseView from "../common/BaseView";
import { switchStyle } from "../common/styles";
import { getCarryoutAvailableInventoryByStore } from "../product/productInquiry/constants";
import { NavigationProp } from "../StackNavigatorParams";
import { activityIndicatorColor } from "../styles";
import { findNearbyStyles } from "./styles";
import { getTestIdProperties } from "../common/utilities";
import FeedbackNote from "../common/FeedbackNote";
import { FeedbackNoteType } from "../../reducers/feedbackNote";

interface StateProps {
  proximityIsLoading?: boolean;
  inventoryIsLoading?: boolean;
  isInventoryError?: boolean;
  inventoryError?: PosBusinessError | Error | PosApiError;
  i18nLocation: string;
}

interface Props extends StateProps {
  retailLocationList: RetailLocation[];
  item: StoreItem;
  navigation: NavigationProp;
  inventory: InventoryItem[];
  validateInventory: boolean;
  displayInventoryCounts: boolean;
  settings: SettingsState;
  availableSwitch?: (data: RetailLocation[], availableOnly: boolean) => void;
  setRetailLocationId?: (retailLocationId: string) => void;
  retailLocationId?: string;
  testID: string;
  isNotConnected: boolean;
  icon: (fill: string) => React.ReactNode;
  isVisiblePickup:boolean;
  selectedInventory?: (inventory: number) => void;
  selectedRetailLocationId?: string;
}

interface State {
  isAvailableOnly: boolean;
}

export interface RetailLocation {
  distanceFromOrigin: DistanceFromOrigin;
  locationData: LocationData;
  phoneNumbers: any;
  inventory: number;
}

interface LocationData {
  name: string;
  retailLocationId: string;
  address: IAddress;
  phoneNumbers: any;
  hoursOfOperationKey: string;
}

export class DistanceFromOrigin {
  value: string;
  unitOfMeasure: string;
}

class FindNearby extends React.Component<Props, State> {
  private styles: any;
  private flatList : any;
  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(findNearbyStyles());
    this.state = {
      isAvailableOnly: false
    };
    this.flatList = React.createRef();
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevState.isAvailableOnly !== this.state.isAvailableOnly) {
      if (Theme.isTablet && this.props.availableSwitch) {
        const data = this.state.isAvailableOnly ?
          this.props.retailLocationList.filter(z => z.inventory > 0) : this.props.retailLocationList;
        this.props.availableSwitch(data, this.state.isAvailableOnly);
        const selectedIndex = data.findIndex(x => x.locationData.retailLocationId === this.props.retailLocationId);
        if (selectedIndex !== -1) {
          this.flatList.scrollToIndex({ animated: true, index: selectedIndex });
        }
      }
    }
  }

  public render(): JSX.Element {
    this.mapInventoryToStore();
    return (
      <BaseView style={this.styles.root}>
        <View style={this.styles.optionsRoot}>
          <View style={this.styles.availableOnly}>
            <Text style={this.styles.availableOnlyText}>
              {I18n.t("availableOnly")}</Text>
            {this.renderSwitch()}
          </View>
        {this.props.isNotConnected ? this.renderNotConnected() :
          <FlatList
            {...getTestIdProperties(this.props.testID, "RetailLocation-list")}
            data={this.state.isAvailableOnly ?
              this.props.retailLocationList.filter(z => z.inventory > 0) :
              this.props.retailLocationList}
            renderItem={({ item, index }) => this.renderItemRow(item as RetailLocation, index + 1)}
            ref={(ref) => { this.flatList = ref; }}
          />
        }
        </View>
        {this.props.proximityIsLoading && <ActivityIndicator
          size="large"
          style={this.styles.spinnerStyle}
          color={activityIndicatorColor}
        />
        }
      </BaseView>
    );
  }

  private renderNotConnected(): JSX.Element {
    return (
      <View style={this.styles.notConnectedPanel}>
        <FeedbackNote
          messageType={FeedbackNoteType.Warning}
          message={I18n.t("notConnected")}
        />
      </View>
    );
  }

  private mapInventoryToStore(): void {
    if (this.props.retailLocationList?.length > 0) {
      this.props.retailLocationList.forEach((retailLocation: RetailLocation) => {
        if (this.props.inventory?.length > 0) {
          retailLocation.inventory =
              getCarryoutAvailableInventoryByStore(this.props.inventory, retailLocation.locationData.retailLocationId);
        }
      });
      if (this.props.retailLocationId && this.props.inventory?.length > 0) {
        const selectedStore = this.props.retailLocationList.find(x => x.locationData.retailLocationId === this.props.retailLocationId);
        this.props.selectedInventory(selectedStore.inventory);
      }
    }
  }

  private renderSwitch = (): JSX.Element => {
    const styles = Theme.getStyles(switchStyle());
    return (<View style={this.styles.switchContainer}>
      <Switch
        {...getTestIdProperties(this.props.testID, "AvailableOnly-switch")}
        style={styles.switch}
        trackColor={{ true: colors.action, false: colors.lightGrey }}
        thumbColor={styles.thumbColor.color}
        onValueChange={this.toggleSwitch}
        value={this.state.isAvailableOnly} />
    </View>
    );
  }

  private toggleSwitch = (): void => {
    this.setState({ isAvailableOnly: !this.state.isAvailableOnly });
  }

  private renderItemRow(item: RetailLocation, index: number): JSX.Element {
    if (this.props.retailLocationId && Theme.isTablet) {
      const retailLocationData = this.state.isAvailableOnly ?
        this.props.retailLocationList.filter(z => z.inventory > 0) :
        this.props.retailLocationList;
      const selectedIndex =
          retailLocationData.findIndex(x => x.locationData.retailLocationId === this.props.retailLocationId);
      if (selectedIndex !== -1) {
        if (selectedIndex <= this.flatList?.props?.data.length) {
          this.flatList.scrollToIndex({ animated: true, index: selectedIndex });
        }
      }
    }

    return (
      <View style={[
        this.styles.mainRowContainer,
        this.props.retailLocationId === item.locationData.retailLocationId ?
          [this.styles.retailLocationChoiceButton, this.styles.retailLocationChoiceButtonForTab] : this.styles.retailLocationChoiceButton
      ]}>
        <View style={this.styles.rowContainer}>
          <TouchableOpacity {...getTestIdProperties(this.props.testID, "RetailLocation-list-button")}
            onPress={() => !Theme.isTablet ? this.props.navigation.push("storeOperationDetails", {
              item: this.props.item,
              selectedRetailLocationId: this.props.selectedRetailLocationId ? this.props.selectedRetailLocationId : item.locationData.retailLocationId,
              selectedInventory: item.inventory,
              retailLocationAddress: item.locationData.address,
              name: item.locationData.name, phoneNumbers: item.locationData.phoneNumbers,
              addressFormat:
                getAddressFormatorDefault(this.props.settings.configurationManager, item.locationData.address.countryCode,
                    this.props.i18nLocation),
              phoneFormat:
                getDefaultPhoneFormat(this.props.settings.configurationManager, item.locationData.address.countryCode,
                    this.props.i18nLocation),
              hoursOfOperationKey: item.locationData?.hoursOfOperationKey,
              isVisiblePickup: this.props.isVisiblePickup,
              currentRetailLocationId: item.locationData.retailLocationId
            }) : this.props.setRetailLocationId(item.locationData.retailLocationId)}>
            <View>
              <Text style={this.styles.retailLocationChoiceButtonText}>
                {index}{`. `} {item.locationData.name} ({item.locationData.retailLocationId})
              </Text>
              {item.distanceFromOrigin.value && <Text style={this.styles.availableText}>
                {item.distanceFromOrigin.value} {item.distanceFromOrigin.unitOfMeasure}
              </Text>}
              {this.props.validateInventory && this.renderInventoryText(item.inventory)}
            </View>
          </TouchableOpacity>
        </View>
        <View style={this.styles.leftrowContainer}>
          {
            this.props.isVisiblePickup &&
            <TouchableOpacity {...getTestIdProperties(this.props.testID, "selectStore-icon")}
              style={this.styles.panelIcon}
              onPress={() =>
                this.props.navigation.navigate("productInquiryDetail",
                  {
                    item: this.props.item,
                    selectedRetailLocationId: item.locationData.retailLocationId,
                    selectedInventory: item.inventory
                  })}
              disabled={this.isDisabled(item.inventory, item.locationData.retailLocationId)}
            >
              {this.props.icon(this.iconColor(item.inventory, item.locationData.retailLocationId))}
            </TouchableOpacity>
          }
        </View>
      </View>
    );
  }

  private isDisabled(availableInventory: number, retailLocationId: string): boolean {
    if (this.props.selectedRetailLocationId && (this.props.selectedRetailLocationId !== retailLocationId) || availableInventory <= 0) {
      return true;
    } else {
      return false;
    }
  }

  private iconColor(availableInventory: number, retailLocationId: string): string {
    return (this.props.selectedRetailLocationId && (this.props.selectedRetailLocationId !== retailLocationId) || availableInventory <= 0) ?
      this.styles.disabledButton.color : this.styles.shipmentButtonIconContainer.color;
  }

  private getPositiveAvailableInventory(availableInventory: number): number {
    return availableInventory && availableInventory > 0 ? availableInventory : 0;
  }

  private availableInventoryText(availableInventory: number): string {
    let availability: string;
    const count: string = this.props.displayInventoryCounts ?
        this.getPositiveAvailableInventory(availableInventory).toString() : "";

    if (this.props.displayInventoryCounts) {
      availability = I18n.t("inventoryCountAvailability", { count });
    } else {
      availability = I18n.t(this.getPositiveAvailableInventory(availableInventory) ? "available" : "unavailable");
    }

    return availability;
  }

  private renderInventoryText(availableInventory: number): React.ReactNode {
    if (this.props.inventoryIsLoading) {
      return this.renderInventoryStatus(true, I18n.t("checkingInventory"), availableInventory);
    } else if (this.props.isInventoryError && this.props.inventoryError instanceof PosBusinessError) {
      const errorMessage = this.props.inventoryError.localizableMessage.i18nCode;
      if (errorMessage !== SSF_ITEM_REQUIRES_PRICE_ENTRY) {
        return this.renderInventoryStatus(false, I18n.t(errorMessage), availableInventory);
      } else {
        return this.renderInventoryStatus(false, this.availableInventoryText(availableInventory), availableInventory);
      }
    } else if (_.isNil(availableInventory)) {
      return this.renderInventoryStatus(false, I18n.t("inventoryApiError"), availableInventory);
    } else if (this.getPositiveAvailableInventory(availableInventory) >= 0) {
      return this.renderInventoryStatus(false, this.availableInventoryText(availableInventory), availableInventory);
    }
  }

  private availabilityStyle(availableInventory: number): any {
    const isAvailable: boolean = availableInventory > 0;

    if (_.isNil(availableInventory)) {
      return this.styles.unavailableInventoryText;
    }

    if (this.props.inventoryIsLoading || this.props.isInventoryError) {
      return this.styles.unavailableInventoryText;
    }

    return isAvailable ? this.styles.availablePositive : this.styles.availableNegative;
  }

  private renderInventoryStatus(showActivity: boolean, statusMessage: string,
                                availableInventory: number): React.ReactNode {
    const textStyle = [
      showActivity ? this.styles.availableInventoryText : this.styles.checkingInventoryText,
      this.availabilityStyle(availableInventory)
    ];

    return (
      <View style={this.styles.availableButton}>
        { showActivity && <ActivityIndicator style={this.styles.activityIndicator} color={activityIndicatorColor} />}
        <Text style={textStyle}>{statusMessage}</Text>
      </View>
    );
  }

}

export const mapStateToProps = (state: AppState): StateProps => {
  const { error: inventoryError, inProgress: inventoryIsLoading } = state.proximityInventory;
  const { inProgress: proximityIsLoading } = state.proximitySearch;
  return {
    inventoryIsLoading,
    inventoryError,
    isInventoryError: !!inventoryError,
    proximityIsLoading,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
};

export default connect(mapStateToProps)(FindNearby);
