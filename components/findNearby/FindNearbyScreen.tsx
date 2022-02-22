import _ from "lodash";
import * as React from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { connect } from "react-redux";
import WebView, { WebViewMessageEvent } from "react-native-webview";

import { IConfigurationValues, PosError, SSC_DO_REMOTE_POST_API_ERROR_CODE, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  getAddressFormatorDefault,
  getDefaultPhoneFormat,
  getItemFilterBy,
  IProximitySearch,
  IProximitySearchRequest,
  isValidOrder,
  Order,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { IAddress, IFulfillmentGroup } from "@aptos-scp/scp-types-commerce-transaction";
import { ItemFilterBy } from "@aptos-scp/scp-types-inventory";

import I18n from "../../../config/I18n";
import { ActionCreator, getProximityInventory, getProximitySearchAction, getRetailLocationAction } from "../../actions";
import { AppState, ProximitySearchState, RetailLocationsState, SettingsState } from "../../reducers";
import { ProximityInventoryState } from "../../reducers/proximityInventory";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import { NavigationScreenProps } from "../StackNavigatorParams";
import FindNearby, { DistanceFromOrigin, RetailLocation } from "./FindNearby";
import { FindNearbyScreenProps } from "./interfaces";
import { findNearbyStyles } from "./styles";
import StoreOperationDetails from "./StoreOperationDetails";
import {
  getGoogleMapsAPIKey,
  getMapViewOfNearbyRetailLocationsPresentAndEnabled,
  getDeliveryTypePresentAndEnabled
} from "../common/utilities";
import VectorIcon from "../common/VectorIcon";


interface StateProps {
  proximitySearch: ProximitySearchState;
  retailLocations: RetailLocationsState;
  settings: SettingsState;
  proximityInventory: ProximityInventoryState;
  order: Order;
  i18nLocation: string
}

interface DispatchProps {
  getProximitySearch: ActionCreator;
  getRetailLocation: ActionCreator;
  getLocalProximityInventory: ActionCreator;
}

export class ProximitySearchRequest implements IProximitySearchRequest {
  geocoordinates?: {
    latitude?: string;
    longitude?: string;
  };
  searchRadius: {
    value?: string;
    unitOfMeasure?: string;
  };
  retailLocationId: string;
  address: IAddress;
}

interface Props extends FindNearbyScreenProps, StateProps, DispatchProps, NavigationScreenProps<"findNearbyLocation"> {}

interface State {
  isAvailableOnly: boolean;
  retailLocations: RetailLocation[];
  retailLocationId: string;
  inventory: number;
}

interface LocationData {
  retailLocationId: string;
  latitude: number;
  longitude: number;
  retailLocationText: number;
  active: number;
}

class FindNearbyScreen extends React.PureComponent<Props, State> {
  private styles: any;
  private readonly omniChannelConfig: IConfigurationValues;
  private testID: string;

  constructor(props: Props) {
    super(props);

    this.testID = "FindNearbyScreen";
    this.styles = Theme.getStyles(findNearbyStyles());
    this.props.proximitySearch.proximitySearch = [];
    const functionalBehaviorValues = props.settings.configurationManager.getFunctionalBehaviorValues();
    this.omniChannelConfig = functionalBehaviorValues.omniChannelBehaviors;
    this.props.proximitySearch.proximitySearch = [];
    this.state = {
      isAvailableOnly: false,
      retailLocations: null,
      retailLocationId: null,
      inventory: undefined
    };
  }

  public componentDidMount(): void {
    this.props.getRetailLocation();
    const proximitySearchRequest: ProximitySearchRequest = new ProximitySearchRequest();
    if (this.props.retailLocations.retailLocation) {
      if (this.omniChannelConfig?.inventory?.searchRadiusForNearbyRetailLocations) {
        const radiusForNearbyRetailLocationsValues =
            this.omniChannelConfig.inventory.searchRadiusForNearbyRetailLocations;
        if (radiusForNearbyRetailLocationsValues) {
          const radiusForNearbyRetailLocations: DistanceFromOrigin = new DistanceFromOrigin();
          radiusForNearbyRetailLocations.value = radiusForNearbyRetailLocationsValues.value.toString();
          radiusForNearbyRetailLocations.unitOfMeasure = radiusForNearbyRetailLocationsValues.unitOfMeasure;
          proximitySearchRequest.searchRadius = radiusForNearbyRetailLocations;
        }
      }
      proximitySearchRequest.retailLocationId = this.props.retailLocations.retailLocation.retailLocationId;
      proximitySearchRequest.geocoordinates = this.props.retailLocations.retailLocation.geocoordinates;
      if (this.props.retailLocations.retailLocation.address) {
        proximitySearchRequest.address = this.props.retailLocations.retailLocation.address;
      }
      this.props.proximitySearch.proximitySearch = [];
      this.props.getProximitySearch(proximitySearchRequest);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.proximitySearch.proximitySearch !== this.props.proximitySearch.proximitySearch) {
      if (!this.props.proximitySearch.inProgress) {
        if (this.props.proximitySearch?.proximitySearch?.length === 0) {
          setTimeout(() => Alert.alert(I18n.t("noResults"), undefined,
            [{ text: I18n.t("ok"), onPress: () => { this.props.navigation.pop(); } }],
            { cancelable: true }), 250);
        }
      }
      if (this.shouldValidateInventory && this.props.proximitySearch.proximitySearch.length > 0) {
        this.fetchInventory();
      }
    }
  }

  public availableSwitch = (data: RetailLocation[], availableOnly: boolean) => {
    this.setState({ isAvailableOnly: availableOnly, retailLocations: data });
  }

  public render(): JSX.Element {
    const isNotConnected = this.checkNotConnected();

    let result = this.props.proximitySearch.proximitySearch.sort((a, b) => {
      if (Number(a.distanceFromOrigin.value) - Number(b.distanceFromOrigin.value)) {
        return Number(a.distanceFromOrigin.value) - Number(b.distanceFromOrigin.value);
      }
    });

    result = this.state.isAvailableOnly && this.state.retailLocations ?
      result.filter(o => this.state.retailLocations.some(({ locationData }) =>
        o.locationData.retailLocationId === locationData.retailLocationId)) : result;

    this.getSelectedStoreDetails(result);
    return (
      <BaseView style={this.styles.root}>
        {
          !Theme.isTablet &&
          <Header
            testID={this.testID}
            isVisibleTablet={true}
            title={I18n.t("findNearby")}
            backButton={{ name: "Back", action: this.pop }}
          />
        }
        {
          Theme.isTablet &&
          <Header
            testID={this.testID}
            isVisibleTablet={true}
            title={I18n.t("findNearby")}
            backButton={{ name: "Back", action: this.pop, title: I18n.t("productInquiry") }}
          />
        }
        {
          !Theme.isTablet && this.props.proximitySearch.proximitySearch &&
          <>
            <FindNearby
              testID={this.testID}
              item={this.props.route.params["item"]}
              inventory={this.props.proximityInventory.inventory}
              validateInventory={this.shouldValidateInventory}
              displayInventoryCounts={this.displayInventoryCounts}
              settings={this.props.settings}
              retailLocationList={result as any}
              navigation={this.props.navigation}
              isNotConnected={isNotConnected}
              icon={(fill: string) => <VectorIcon name="Store" height={this.styles.iconHeight.height} fill={fill} />}
              isVisiblePickup={this.shouldPickupAtAnotherStore}
              selectedRetailLocationId={this.getSelectedRetailLocationId()}
            />
          </>
        }
        {
          Theme.isTablet &&
          <>
            <View style={this.styles.rootForTablet}>
              <View style={!this.mapViewEnabled ? [this.styles.leftPanel, this.styles.leftPanelForMap] : this.styles.leftPanel}>
                {isNotConnected ? this.renderTabletNotConnected() : this.renderMap()}
              </View>
              <View style={this.styles.rightPanel}>
                <FindNearby
                  testID={this.testID}
                  item={this.props.route.params["item"]}
                  inventory={this.props.proximityInventory.inventory}
                  validateInventory={this.shouldValidateInventory}
                  displayInventoryCounts={this.displayInventoryCounts}
                  settings={this.props.settings}
                  retailLocationList={result as any}
                  availableSwitch={this.availableSwitch.bind(this)}
                  selectedInventory={this.selectedInventory.bind(this)}
                  navigation={this.props.navigation}
                  setRetailLocationId={this.setRetailLocationId.bind(this)}
                  retailLocationId={this.state.retailLocationId}
                  isNotConnected={isNotConnected}
                  icon={(fill: string) => <VectorIcon name="Store" height={this.styles.iconHeight.height} fill={fill} />}
                  isVisiblePickup={this.shouldPickupAtAnotherStore}
                  selectedRetailLocationId={this.getSelectedRetailLocationId()}
                />
              </View>
            </View>
          </>
        }
      </BaseView>
    );
  }

  public onMessage(event: WebViewMessageEvent): void {
    const { data } = event.nativeEvent;
    this.setRetailLocationId(data);
  }

  public setRetailLocationId = (id: string) => {
    this.setState({ retailLocationId: id });
  }

  public selectedInventory = (inventoryCount: number) => {
    this.setState({ inventory: inventoryCount });
  }

  private moveElementToTop(reatailLocations: IProximitySearch[], fromIndex: number, toIndex: number): void {
    if (fromIndex > 0 && toIndex >= 0) {
      const reatailLocation = reatailLocations[fromIndex];
      reatailLocations.splice(fromIndex, 1);
      reatailLocations.splice(toIndex, 0, reatailLocation);
    }
  }

  private renderMap() : JSX.Element {
    const indexNumber = 1;

    let result = this.props.proximitySearch.proximitySearch.sort((a, b) => {
      if (Number(a.distanceFromOrigin.value) - Number(b.distanceFromOrigin.value)) {
        return Number(a.distanceFromOrigin.value) - Number(b.distanceFromOrigin.value);
      }
    });

    this.getSelectedStoreDetails(result);
    result = this.state.isAvailableOnly && this.state.retailLocations ?
      result.filter(o => this.state.retailLocations.some(({ locationData }) =>
        o.locationData.retailLocationId === locationData.retailLocationId)) : result;

    if (this.state.retailLocationId === null && result.length > 0) {
      this.setState({ retailLocationId: result[0].locationData.retailLocationId });
    }

    const selectedRetailLocation = this.state.retailLocationId ?
      result.find(x => x.locationData?.retailLocationId === this.state.retailLocationId) : null;

    const content: Array<LocationData> = [];
    if (result.length > 0) {
      result.map((marker, index) => {
        if (marker.locationData.retailLocationId === this.state.retailLocationId) {
          content.push({
            retailLocationId: marker.locationData.retailLocationId, latitude: parseFloat(marker.locationData.geocoordinates.latitude),
            longitude: parseFloat(marker.locationData.geocoordinates.longitude), retailLocationText: index + 1, active: 1
          });
        } else {
          content.push({
            retailLocationId: marker.locationData.retailLocationId, latitude: parseFloat(marker.locationData.geocoordinates.latitude),
            longitude: parseFloat(marker.locationData.geocoordinates.longitude), retailLocationText: index + 1, active: 0
          });
        }
      });
    }
    return (
      <ScrollView>
        {
          this.mapViewEnabled && Platform.OS === "ios" && _.isEmpty(this.googleMapsAPIKey) ?
            <MapView style={this.styles.map}
              ref={mapRef => mapRef?.fitToElements(true)}
              zoomEnabled={true}
              scrollEnabled={true}
              zoomControlEnabled={true}
              zoomTapEnabled={true}
              initialRegion={{
                latitude: parseFloat(this.props.retailLocations?.retailLocation?.geocoordinates.latitude),
                longitude: parseFloat(this.props.retailLocations?.retailLocation?.geocoordinates.longitude),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0922 + (this.styles.map.width / this.styles.map.height)
              }}>
              {
                result.map((marker, index) => {
                  return (
                    marker.locationData.geocoordinates &&
                    <Marker
                      key={marker.locationData.id}
                      coordinate={{
                        latitude: parseFloat(marker.locationData.geocoordinates.latitude),
                        longitude: parseFloat(marker.locationData.geocoordinates.longitude)
                      }}
                      onPress={() => this.setRetailLocationId(marker.locationData.retailLocationId)}
                    >
                      <View
                        style={this.state.retailLocationId && (
                          this.state.retailLocationId === marker.locationData.retailLocationId)
                          ? [this.styles.circle, this.styles.circleSelected]
                          : this.styles.circle}
                      >
                        <Text style={this.styles.pinText}>{indexNumber + index}</Text>
                      </View>
                    </Marker>
                  )
                })
              }
            </MapView>
            :
            !(_.isEmpty(this.googleMapsAPIKey)) && this.mapViewEnabled &&
            <WebView
              onMessage={this.onMessage.bind(this)}
              startInLoadingState={true}
              source={{
                html:
                  ` <script src="https://maps.googleapis.com/maps/api/js?key=${this.googleMapsAPIKey}"></script>
                      <div id="map" style="width:100%;height:100%;"></div>
                        <script type="text/javascript">

                        var locations = ${JSON.stringify(content)};

                        var map = new google.maps.Map(document.getElementById('map'), {
                          zoom: 10,
                          center: new google.maps.LatLng(${parseFloat(this.props.retailLocations?.retailLocation?.geocoordinates.latitude)},
                                                          ${parseFloat(this.props.retailLocations?.retailLocation?.geocoordinates.longitude)}),
                          mapTypeId: google.maps.MapTypeId.ROADMAP
                        });
                        var bounds = new google.maps.LatLngBounds();
                        var marker, i;
                        for (i = 0; i < locations.length; i++) {
                          marker = new google.maps.Marker({
                            position: new google.maps.LatLng(locations[i].latitude, locations[i].longitude),
                            draggable:false,
                            map: map,
                            icon: {
                              path: google.maps.SymbolPath.CIRCLE,
                              fillOpacity: 1,
                              strokeOpacity: 0.9,
                              strokeWeight: 0,
                              scale: 15,
                              fillColor: locations[i].active === 0 ? '${this.styles.circle.backgroundColor}' : '${this.styles.circleSelected.backgroundColor}',
                              optimized: false
                            },
                            label: {text: locations[i].retailLocationText.toString(), color: "${this.styles.pinText.color}"}
                          });
                          bounds.extend(marker.position);
                          google.maps.event.addListener(marker, 'click', (function(marker, i) {
                            return function() {
                              window.ReactNativeWebView.postMessage(locations[i].retailLocationId);
                            }
                          })(marker, i));
                        }
                        map.fitBounds(bounds);
                    </script>
                  `
              }} style={this.styles.androidMap} />
        }
        { selectedRetailLocation ?
          <StoreOperationDetails
            retailLocationAddress={selectedRetailLocation.locationData?.address}
            item={this.props.route.params["item"]}
            selectedRetailLocationId={selectedRetailLocation.locationData.retailLocationId}
            selectedInventory={this.state.inventory}
            name={selectedRetailLocation.locationData?.name}
            phoneNumbers={selectedRetailLocation.locationData?.phoneNumbers}
            addressFormat=
            {getAddressFormatorDefault(this.props.settings.configurationManager, selectedRetailLocation.locationData?.address?.countryCode,
                this.props.i18nLocation)}
            phoneFormat=
            {getDefaultPhoneFormat(this.props.settings.configurationManager, selectedRetailLocation.locationData?.address?.countryCode,
                this.props.i18nLocation)}
            hoursOfOperationKey={selectedRetailLocation.locationData?.hoursOfOperationKey}
            isVisiblePickup={this.shouldPickupAtAnotherStore}
            navigation={this.props.navigation}
            currentRetailLocationId={this.getSelectedRetailLocationId()}
          /> : null
        }
      </ScrollView>
    );
  }

  private getSelectedStoreDetails(result: IProximitySearch[]): void {
    let selectedRetailLocationIndex: number;
    if (isValidOrder(this.props.order) && result.length > 0) {
      this.props.order.fulfillmentGroups.forEach((fulfillmentGroup: IFulfillmentGroup) => {
        const fulfillmentRetailLocationId = fulfillmentGroup?.deliveryLocation?.retailLocationId;
        if (fulfillmentRetailLocationId && fulfillmentRetailLocationId !== result[0].locationData.retailLocationId) {
          selectedRetailLocationIndex = result.findIndex(x => x.locationData.retailLocationId === fulfillmentRetailLocationId);
          this.moveElementToTop(result, selectedRetailLocationIndex, 0);
        }
      });
    }
  }

  private checkNotConnected(): boolean {
    const error = this.props.proximitySearch.error as PosError;
    return error && error.errorCode === SSC_DO_REMOTE_POST_API_ERROR_CODE;
  }

  private renderTabletNotConnected(): JSX.Element {
    return (
      <View style={this.styles.offline}>
        <View style={this.styles.offlineIcon}>
          <VectorIcon name={"Offline"} fill={this.styles.offlineIcon.color} height={this.styles.offlineIcon.fontSize} />
        </View>
        <View style={this.styles.offlineText}>
          <Text>{I18n.t("offlineReference")}</Text>
        </View>
      </View>
    );
  }

  private get mapViewEnabled(): boolean {
    return getMapViewOfNearbyRetailLocationsPresentAndEnabled(this.omniChannelConfig);
  }

  private get googleMapsAPIKey(): string {
    return getGoogleMapsAPIKey(this.omniChannelConfig);
  }

  private get shouldValidateInventory(): boolean {
    return this.omniChannelConfig?.inventory?.validateInventory;
  }

  private get displayInventoryCounts(): boolean {
    return this.omniChannelConfig?.display?.displayInventoryCounts;
  }

  private get shouldPickupAtAnotherStore(): boolean {
    return getDeliveryTypePresentAndEnabled(this.omniChannelConfig, "pickupAtAnotherStore");
  }

  private fetchInventory(): void {
    const item = this.props.route.params["item"];
    const configMgr = this.props.settings.configurationManager;
    const itemFilterBy: ItemFilterBy[] = getItemFilterBy(item, configMgr);
    const retailLocationIds = this.props.proximitySearch.proximitySearch.map(x => x.locationData.retailLocationId);

    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.RETAIL_LOCATION_IDS, retailLocationIds));
    uiInputs.push(new UiInput(UiInputKey.STORE_ITEM, item));
    uiInputs.push(new UiInput(UiInputKey.ITEM_FILTER_BY, itemFilterBy));

    this.props.getLocalProximityInventory(this.props.settings.deviceIdentity, uiInputs);
  }

  private pop = () => {
    this.props.navigation.pop();
  }

  private getSelectedRetailLocationId(): string {
    let selectedRetailLocationId: string;
    if (isValidOrder(this.props.order)) {
      this.props.order.fulfillmentGroups.forEach((fulfillmentGroup: IFulfillmentGroup) => {
        const fulfillmentRetailLocationId = fulfillmentGroup?.deliveryLocation?.retailLocationId;
        if (fulfillmentRetailLocationId) {
          selectedRetailLocationId = fulfillmentRetailLocationId;
        }
      });
    }
    return selectedRetailLocationId;
  }

}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    proximitySearch: state.proximitySearch,
    retailLocations: state.retailLocations,
    settings: state.settings,
    proximityInventory: state.proximityInventory,
    order: state.businessState.stateValues.get("transaction.order"),
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
};

const mapDispatchProps: DispatchProps = {
  getProximitySearch: getProximitySearchAction.request,
  getRetailLocation: getRetailLocationAction.request,
  getLocalProximityInventory: getProximityInventory.request
};

export default connect(mapStateToProps, mapDispatchProps)(FindNearbyScreen);
