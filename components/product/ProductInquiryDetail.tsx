import * as _ from "lodash";
import * as React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { Price } from "@aptos-scp/scp-component-business-core";
import {
  ConfigurationBlockKey,
  IConfigurationManager,
  IConfigurationValues,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  getItemFilterBy,
  IItemSearchCriteria,
  IRetailLocation,
  isValidOrder,
  ItemLookupKey,
  MixedBasketState,
  Order,
  PriceInquiry,
  StoreItem,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { FulfillmentType, IFulfillmentGroup } from "@aptos-scp/scp-types-commerce-transaction";
import { ItemFilterBy } from "@aptos-scp/scp-types-inventory";

import I18n from "../../../config/I18n";
import { ActionCreator, getInventory, getRetailLocationAction, getRetailLocationsAction } from "../../actions";
import { AppState, InventoryState, RetailLocationsState, SettingsState, Variants } from "../../reducers";
import Theme from "../../styles";
import Carousel from "../common/Carousel";
import Header from "../common/Header";
import ItemVariants from "../common/ItemVariants";
import {
  colorAttributeType,
  getColorName,
  getDeliveryTypePresentAndEnabled,
  getNearbyLocationPresentAndEnabled,
  getSeasonName,
  getSizeName,
  getStoreLocale,
  getStoreLocaleCurrencyOptions,
  getStyleName,
  getTestIdProperties,
  seasonAttributeType,
  sizeAttributeType
} from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import VectorIcon from "../common/VectorIcon";
import { NavigationProp } from "../StackNavigatorParams";
import {
  BasketButton,
  getCarryoutAvailableInventory,
  getNetworkAvailableInventory,
  ProductInquiryActions,
  ProductInquiryAttribute,
  ProductInquiryInfoContainer
} from "./productInquiry";
import { productInquiryDetailStyle } from "./styles";

interface StateProps {
  inventory: InventoryState;
  retailLocations: RetailLocationsState;
  order: Order;
}

interface DispatchProps {
  getLocalInventory: ActionCreator;
  getRetailLocation: ActionCreator;
  getRetailLocations: ActionCreator;
}

interface Props extends StateProps, DispatchProps {
  addItemToBasket: (itemLookupKey: ItemLookupKey, quantity: number, fulfillmentType: FulfillmentType) => void;
  error: string;
  isReadOnly: boolean;
  showFinalPrice: boolean;
  item: PriceInquiry;
  settings: SettingsState;
  variants?: Variants;
  itemAttributesDisplayOrder: Set<string>;
  itemSearchCriteria?: IItemSearchCriteria;
  backButtonAction: () => void;
  mixedBasketState: MixedBasketState;
  unavailableItem?: boolean;
  backButtonTitle?: string;
  navigation: NavigationProp;
  selectedInventory?: number;
  selectedRetailLocationId?: string;
}

interface State {
  colorSelected: string;
  sizeSelected: string;
  seasonSelected: string;
  selectedStoreItem: StoreItem;
  selectedRetailLocation: IRetailLocation;
}

class ProductInquiryDetail extends React.Component<Props, State> {
  private styles: any;
  private readonly omniChannelConfig: IConfigurationValues;
  private testID: string;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(productInquiryDetailStyle());

    const functionalBehaviorValues = props.settings.configurationManager.getFunctionalBehaviorValues();
    this.omniChannelConfig = functionalBehaviorValues.omniChannelBehaviors;
    this.testID = "ProductInquiryDetail";

    this.state = this.getAttributes(this.props.item);

    this.getRightButton = this.getRightButton.bind(this);
    this.handleAddToBasket = this.handleAddToBasket.bind(this);
    this.handleInventoryRefresh = this.handleInventoryRefresh.bind(this);

    this.renderColorVariants = this.renderColorVariants.bind(this);
    this.renderSizeVariants = this.renderSizeVariants.bind(this);
    this.renderSeasonVariants = this.renderSeasonVariants.bind(this);
  }

  public componentDidUpdate(prevProps: Props): void {
    this.resetItemDetails(prevProps);
  }

  public componentDidMount(): void {
    if (this.shouldPickupAtAnotherStore) {
      if (this.props.retailLocations.retailLocations?.length === 0) {
        this.props.getRetailLocations();
      }
    }
    if (!this.props.inventory?.inventory) {
      //ensure inventory is fetched on first page load.
      this.handleInventoryRefresh();
    }
  }

  public componentWillMount(): void {
    if (!this.props.retailLocations?.retailLocation?.geocoordinates) {
      this.props.getRetailLocation();
    }
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        { this.renderHeader() }
        { !this.props.error && this.renderContent() }
        {
          this.props.error &&
          <View style={this.styles.errorContainer}>
            <Text style={this.styles.errorText}>{this.props.error}</Text>
          </View>
        }
      </View>
    );
  }

  private renderHeader(): JSX.Element {
    if (this.props.unavailableItem){
      return this.renderUnavailableProductHeader();
    } else{
      return this.renderProductHeader();
    }
  }

  private renderProductHeader(): JSX.Element {
    return (
        <Header
            testID={this.testID}
            isVisibleTablet={true}
            title={I18n.t(this.isProductInquiry ? "productInquiry" : "productDetails")}
            backButton={{name: "Back", action: this.props.backButtonAction,
              title: this.props.backButtonTitle }}
            rightButton={this.getRightButton()}
        />
    );
  }

  private renderUnavailableProductHeader(): JSX.Element {
    return (
        <Header
            testID={this.testID}
            isVisibleTablet={true}
            title={I18n.t("productInquiry")}
            backButton={{name: "Back", action: this.props.backButtonAction,
              title: this.props.backButtonTitle }}
            rightButton={this.getSearchButton()}
        />
    );
  }

  private handleInventoryRefresh(): void {
    if (this.shouldValidateInventory && this.props.item &&
      (this.carryoutEnabled || this.pickupEnabled || this.deliveryEnabled)) {
      this.fetchInventory();
    }
  }

  private renderContent(): JSX.Element {
    const item = this.state.selectedStoreItem || this.props.item;
    const styleName = getStyleName(item, this.props.settings.primaryLanguage);
    const itemAttributesOrderList = [...this.props.itemAttributesDisplayOrder];
    const itemsAttributeDataMapping = {"size" : "sizes", "season" : "seasons", "color" : "colors"};
    const retailLocation: IRetailLocation = this.setSelectedRetailLocation();

    return (
      <ScrollView style={this.styles.root}>
        <View style={this.styles.productDetail}>
          { this.renderImageViewer(item) }
          <View style={this.fillStyle}>
            <View style={this.styles.infoContainer}>
              <View style={this.styles.subInfoContainer}>
                <Text style={this.styles.title} numberOfLines={2} ellipsizeMode={"tail"}>
                  { item.name }
                </Text>
              </View>
              <View style={this.styles.priceContainer}>
                { this.renderPrice(item) }
              </View>
            </View>
            {
              !this.props.isReadOnly && this.props.variants && itemAttributesOrderList.length > 0 &&
              <View style={this.styles.variantContainer}>
                {
                  itemAttributesOrderList.map((attribute: string) =>
                    this.props.variants[itemsAttributeDataMapping[attribute.toLowerCase()]].size > 0 &&
                    this.getItemAttributesByOrder(attribute))
                }
              </View>
            }
            {
              this.props.isReadOnly && itemAttributesOrderList.length > 0 &&
              <View style={this.styles.infoContainer}>
                { itemAttributesOrderList.map((attribute: string) => this.getItemAttributesByOrder(attribute)) }
              </View>
            }
            {
              this.isProductInquiry &&
              <ProductInquiryActions
                testID={this.testID}
                item={this.props.item}
                handleAddToBasket={this.handleAddToBasket}
                selectedInventory={this.props.selectedInventory}
                selectedRetailLocation={retailLocation}
                localAvailableInventory={
                  this.carryoutEnabled && getCarryoutAvailableInventory(this.props.inventory.inventory)
                }
                networkAvailableInventory={
                  (this.pickupEnabled || this.deliveryEnabled) &&
                  getNetworkAvailableInventory(this.props.inventory.inventory)
                }
                carryoutEnabled={this.carryoutEnabled}
                pickupEnabled={this.pickupEnabled}
                deliveryEnabled={this.deliveryEnabled}
                nearbyLocationEnabled={
                  this.props.retailLocations?.retailLocation?.geocoordinates ? this.nearbyLocationEnabled : false}
                displayInventoryCounts={this.displayInventoryCounts}
                validateInventory={this.shouldValidateInventory}
                mixedBasketState={this.props.mixedBasketState}
                unavailableItem={this.props.unavailableItem}
                onFindNearbyLocation={this.pushFindNearbyLocation}
              />
            }
          </View>
        </View>
        <View style={this.styles.descriptionContainer}>
          <View style={this.styles.bottomTabs}>
            <View style={this.styles.tabs}>
              <View style={[this.styles.tab, this.styles.tabActive]}>
                <Text style={[this.styles.tabText, this.styles.tabTextActive]}>{I18n.t("description")}</Text>
              </View>
            </View>
            <Text style={this.styles.description} numberOfLines={2} ellipsizeMode={"tail"}>
              { item.shortDescription }
            </Text>
            <ProductInquiryInfoContainer label={`${I18n.t("style")}: `} value={styleName} />
          </View>
        </View>
      </ScrollView>
    );
  }

  private renderPrice(item:StoreItem): JSX.Element {
    const pricing = this.props.settings.configurationManager.getConfigurationValues(ConfigurationBlockKey.pricing);
    const treatTemporaryPriceAsSale = pricing?.pricingPolicies?.priceChange?.treatTemporaryPriceAsSale;
    if (!item.itemPermanentPrice && !item.itemTemporaryPrice) {
      return (<View style={this.styles.itemAmount}>
        <Text style={this.styles.itemPriceText}>{this.getUnitPrice(item.price)}</Text>
      </View>);
    } else if (!item.itemTemporaryPrice) {
      return (<View style={this.styles.itemAmount}>
        <Text style={this.styles.itemPriceText}>{this.getUnitPrice(item.itemPermanentPrice)}</Text>
      </View>);
    } else {
      if (treatTemporaryPriceAsSale && item.itemTemporaryPrice.amount.lt(item.itemPermanentPrice.amount)) {
        return (<View style={this.styles.itemAmount}>
          <Text style={this.styles.itemPriceTextOverridden}>{this.getUnitPrice(item.itemPermanentPrice)}</Text>
          <Text style={this.styles.itemSalePriceText}>{this.getUnitPrice(item.itemTemporaryPrice)}</Text>
        </View>);
      } else {
        return (<View style={this.styles.itemAmount}>
          <Text style={this.styles.itemPriceText}>{this.getUnitPrice(item.itemTemporaryPrice)}</Text>
        </View>);
      }
    }
  }

  private setSelectedRetailLocation(): IRetailLocation {
    let retailLocation: IRetailLocation;
    if (this.props.selectedRetailLocationId) {
      retailLocation = this.props.retailLocations.retailLocations?.length > 0 &&
        this.props.retailLocations.retailLocations.find(x => x.retailLocationId === this.props.selectedRetailLocationId)
    } else if (isValidOrder(this.props.order)) {
      this.props.order.fulfillmentGroups.forEach((fulfillmentGroup: IFulfillmentGroup) => {
        if (fulfillmentGroup?.deliveryLocation?.retailLocationId) {
          retailLocation = this.props.retailLocations.retailLocations?.length > 0 &&
            this.props.retailLocations.retailLocations.find(x => x.retailLocationId === fulfillmentGroup?.deliveryLocation?.retailLocationId)
        }
      });
    } else {
      retailLocation = this.props.retailLocations.retailLocation;
    }
    return retailLocation;
  }

  private fetchInventory(): void {
    const item: StoreItem = this.state.selectedStoreItem;
    const configMgr: IConfigurationManager =  this.props.settings.configurationManager;
    const itemFilterBy: ItemFilterBy[] = getItemFilterBy(item, configMgr);

    const networkDeliveryMethods: FulfillmentType[] = [];
    if (this.pickupEnabled) {
      networkDeliveryMethods.push(FulfillmentType.shipToStore);
    }
    if (this.deliveryEnabled) {
      networkDeliveryMethods.push(FulfillmentType.shipToCustomer);
    }

    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.STORE_ITEM, item));
    uiInputs.push(new UiInput(UiInputKey.ITEM_FILTER_BY, itemFilterBy));
    uiInputs.push(new UiInput(UiInputKey.NETWORK_DELIVERY_METHODS, networkDeliveryMethods));

    this.props.getLocalInventory(this.props.settings.deviceIdentity, uiInputs);
  }

  private handleAddToBasket(quantity: number, fulfillmentType?: FulfillmentType): void {
    let itemLookupKey: ItemLookupKey = this.state.selectedStoreItem.itemLookupKeys[0];
    const { itemSearchCriteria } = this.props;

    if (this.state.selectedStoreItem === this.props.item && itemSearchCriteria &&
        itemSearchCriteria.keyType && itemSearchCriteria.keyValue) {
      itemLookupKey = new ItemLookupKey(itemSearchCriteria.keyType, itemSearchCriteria.keyValue);
    }

    this.props.addItemToBasket(itemLookupKey, quantity, fulfillmentType);
  }

  private getUnitPrice(price: Price): string {
    return price && price.amount && price.amount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions());
  }

  private renderImageViewer(item: PriceInquiry): JSX.Element {
    return !!item.imageUrl && (
      <Carousel
          images={item.images}
          thumbnails={Theme.isTablet}
          style={this.styles.carousel}
          imageHeight={this.styles.imageCell.height}
          settings={this.props.settings}
      />
    );
  }

  private renderColorVariants(): JSX.Element {
    if (this.props.variants) {
      return (
        <ItemVariants
          groupName={"colors"}
          options={Array.from(this.props.variants.colors.keys())}
          selectedItem={this.state.colorSelected}
          onSelection={(colorSelected) => {
            this.setState({colorSelected}, () => {
              this.matchAndSetStoreItem();
            });
          }}
        />
      );
    }
  }

  private renderSizeVariants(): JSX.Element {
    if (this.props.variants) {
      return (
        <ItemVariants
          groupName={"sizes"}
          options={Array.from(this.props.variants.sizes.keys())}
          selectedItem={this.state.sizeSelected}
          onSelection={(sizeSelected) => {
            this.setState({sizeSelected}, () => {
              this.matchAndSetStoreItem();
            });
          }}
        />
      );
    }
  }

  private renderSeasonVariants(): JSX.Element {
    if (this.props.variants) {
      return (
        <ItemVariants
          groupName={"seasons"}
          options={Array.from(this.props.variants.seasons.keys())}
          selectedItem={this.state.seasonSelected}
          onSelection={(seasonSelected) => {
            this.setState({seasonSelected}, () => {
              this.matchAndSetStoreItem();
            });
          }}
        />
      );
    }
  }

  /**
   * If we found the combination of color and size in are variants we will
   * set the state of selectedStoreItem to that variant else it will be undefined.
   */
  private matchAndSetStoreItem(): void {
    const index = _.findIndex(this.props.variants.items, (item) => {
      const colorName = getColorName(item, this.props.settings.primaryLanguage);
      const sizeName = getSizeName(item, this.props.settings.primaryLanguage);
      const seasonName = getSeasonName(item, this.props.settings.primaryLanguage);
      const { colors, sizes, seasons } = this.props.variants;

      return (
        ((colors.size && colorName === this.state.colorSelected) || !colors.size) &&
        ((sizes.size && sizeName === this.state.sizeSelected) || !sizes.size) &&
        ((seasons.size && seasonName === this.state.seasonSelected) || !seasons.size)
      );
    });

    if (index >= 0) {
      this.setState({ selectedStoreItem: this.props.variants.items[index] }, () => {
        if (this.shouldValidateInventory) {
          this.fetchInventory();
        }
      });
    } else {
      this.setState({ selectedStoreItem: undefined });
    }
  }

  private disableAddItemToBasket(): boolean {
    const { selectedStoreItem } = this.state;
    return selectedStoreItem === undefined || selectedStoreItem.itemLookupKeys.length === 0;
  }

  private getItemAttributesByOrder(attribute: string): JSX.Element {
    const attributesFromStoreItem = this.getAttributes(this.state.selectedStoreItem || this.props.item);

    if (attribute.toLowerCase() === colorAttributeType.toLowerCase()) {
      return ((this.props.isReadOnly && attributesFromStoreItem.colorSelected) || !this.props.isReadOnly) && (
        <ProductInquiryAttribute
          isReadOnly={this.props.isReadOnly}
          variantLabel={`${I18n.t("color")}: `}
          variantInfoLabel={attributesFromStoreItem.colorSelected}
          renderVariants={this.renderColorVariants}
        />
      );
    } else if (attribute.toLowerCase() === sizeAttributeType.toLowerCase()) {
      return ((this.props.isReadOnly && attributesFromStoreItem.sizeSelected) || !this.props.isReadOnly) && (
        <ProductInquiryAttribute
          isReadOnly={this.props.isReadOnly}
          variantLabel={`${I18n.t("size")}: `}
          variantInfoLabel={attributesFromStoreItem.sizeSelected}
          renderVariants={this.renderSizeVariants}
        />
      );
    } else if (attribute.toLowerCase() === seasonAttributeType.toLowerCase()) {
      return ((this.props.isReadOnly && attributesFromStoreItem.seasonSelected) || !this.props.isReadOnly) && (
        <ProductInquiryAttribute
          isReadOnly={this.props.isReadOnly}
          variantLabel={`${I18n.t("season")}: `}
          variantInfoLabel={attributesFromStoreItem.seasonSelected}
          renderVariants={this.renderSeasonVariants}
        />
      );
    }
  }

  private get isProductInquiry(): boolean {
    return !this.props.isReadOnly && !this.disableAddItemToBasket();
  }

  private getRightButton(): JSX.Element {
    if (this.props.item && this.isProductInquiry) {
      return <BasketButton testID={this.testID} onPress={this.popToMain} />;
    }

    return <View />;
  }

  private getSearchButton(): JSX.Element {
    return (
      <TouchableOpacity
        style={this.styles.searchButton}
        onPress={this.pushProductInquiry}
        {...getTestIdProperties(this.testID, "search-button")}>
        <VectorIcon name={"Search"} height={this.styles.searchButtonIcon.height} fill={this.styles.navigationText}/>
      </TouchableOpacity>
    );
  }

  private get shouldValidateInventory(): boolean {
    return this.omniChannelConfig && this.omniChannelConfig.inventory &&
        this.omniChannelConfig.inventory.validateInventory;
  }

  private get shouldPickupAtAnotherStore(): boolean {
    return getDeliveryTypePresentAndEnabled(this.omniChannelConfig, "pickupAtAnotherStore");
  }

  private get fillStyle(): any {
    const item = this.state.selectedStoreItem || this.props.item;

    return [
      this.styles.fill,
      ...[!item.imageUrl && this.styles.noImageFill]
    ];
  }

  private get carryoutEnabled(): boolean {
    return getDeliveryTypePresentAndEnabled(this.omniChannelConfig,"carryout");
  }

  private get pickupEnabled(): boolean {
    return getDeliveryTypePresentAndEnabled(this.omniChannelConfig,"pickUpHere");
  }

  private get deliveryEnabled(): boolean {
    return getDeliveryTypePresentAndEnabled(this.omniChannelConfig,"deliverIt");
  }

  private get displayInventoryCounts(): boolean {
    return this.omniChannelConfig && this.omniChannelConfig.display &&
        this.omniChannelConfig.display.displayInventoryCounts;
  }

  private get nearbyLocationEnabled(): boolean {
    return getNearbyLocationPresentAndEnabled(this.omniChannelConfig);
  }

  private resetItemDetails(prevProps: Props): void {
    const itemChangedOnProps: boolean = prevProps.item !== this.props.item;

    if (itemChangedOnProps &&
      ((this.state.selectedStoreItem && this.props.item !== this.state.selectedStoreItem) ||
      (this.state.selectedStoreItem && prevProps.item !== this.state.selectedStoreItem))
    ) {
        this.setState({ ...this.getAttributes(this.props.item) }, () => {
          this.handleInventoryRefresh();
        });
    }
  }

  private getAttributes(selectedStoreItem: StoreItem): any {
    const colorSelected = selectedStoreItem && getColorName(selectedStoreItem, this.props.settings.primaryLanguage);
    const sizeSelected = selectedStoreItem && getSizeName(selectedStoreItem, this.props.settings.primaryLanguage);
    const seasonSelected = selectedStoreItem && getSeasonName(selectedStoreItem, this.props.settings.primaryLanguage);

    return { colorSelected, sizeSelected, seasonSelected, selectedStoreItem };
  }

  private pushFindNearbyLocation = () => {
    this.props.navigation.push("findNearbyLocation", {
      item: this.props.item
    });
  }

  private popToMain = () => {
    this.props.navigation.dispatch(popTo("main"));
  }

  private pushProductInquiry = () => {
    this.props.navigation.push("productInquiry");
  }
}

const mapStateToProps = (state: AppState): StateProps => ({
  order: state.businessState.stateValues.get("transaction.order"),
  inventory: state.inventory,
  retailLocations: state.retailLocations
});

const mapDispatchToProps = {
  getLocalInventory: getInventory.request,
  getRetailLocation: getRetailLocationAction.request,
  getRetailLocations: getRetailLocationsAction.request
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductInquiryDetail);
