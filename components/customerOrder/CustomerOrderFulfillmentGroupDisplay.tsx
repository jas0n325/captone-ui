import * as React from "react";
import {Text, View} from "react-native";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";
import _ = require("lodash");

import { CustomerOrderTypeCodeEnum } from "@aptos-scp/scp-component-canonical-transaction";
import { AddressFormat, formatAddress, getAddressFormatorDefault } from "@aptos-scp/scp-component-store-selling-features";
import {
  BusinessUnit,
  CustomerOrderLineItemCollection,
  DeliveryContact,
  DeliveryDestination,
  FulfillmentGroup,
  FulfillmentGroupCollection,
  OrderTypeCodeEnum,
  PostalAddress,
  ShipmentTracking
} from "@aptos-scp/scp-types-orders";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import StatusTag, { STATUS_TAG_NAME_LABEL, StatusType } from "../common/StatusTag";
import { customerOrderDisplayStyles } from "./styles";
import { AppState, SettingsState } from "../../reducers";
import SectionLine from "../common/SectionLine";
import { CustomerOrderFulfillmentType, formatPersonName, getFufillmentGroupItems } from "../common/utilities/customerOrderUtilities";
import CustomerOrderItemCollectionDisplay from "./CustomerOrderItemCollectionDisplay";
import { getTestIdProperties } from "../common/utilities";
import CustomerOrderTrackingLink from "./CustomerOrderTrackingLink";

interface StateProps {
  settings: SettingsState;
  i18nLocation: string
}

interface Props extends StateProps{
    fulfillmentGroups: FulfillmentGroupCollection
    customerOrderItems: CustomerOrderLineItemCollection
    preferredLanguage?: string,
    orderType?: OrderTypeCodeEnum
}

interface State {
}

class CustomerOrderFulfillmentGroupDisplay extends React.PureComponent<Props, State> {
  private styles: any;
  private testID: string;

  constructor(props: Props) {
    super(props);
    this.testID = "CustomerOrderFulfillmentGroupDisplay";
    this.styles = Theme.getStyles(customerOrderDisplayStyles());
  }

  public render(): JSX.Element {
    return (
      <KeyboardAwareFlatList
        data={this.props.fulfillmentGroups}
        keyExtractor={(item) => item.fulfillmentGroupId.toString()}
        renderItem={({ item }) => this.renderFulfillmentGroup(item as FulfillmentGroup)}
        ListHeaderComponent={this.renderSectionHeader(I18n.t("items"))}
        ItemSeparatorComponent={() => <View style={this.styles.groupSeparator} />}
      />
    );
  }

  private renderSectionHeader(textForHeader: string): JSX.Element {
    return (
      <View style={this.styles.listHeader}>
        <Text
          {...getTestIdProperties(this.testID, "sectionHeader")}
          style={this.styles.listHeaderText}>
            {textForHeader}
        </Text>
      </View>
    );
  }

  private renderFulfillmentGroup(group: FulfillmentGroup): JSX.Element {
    return (
      <View style={this.styles.fulfillmentGroupContainer}>
        <View style={this.styles.customerOrderRow}>
          <View style={this.styles.customerOrderData}>
            <View>
              { this.renderFulfillmentTypeTag(group.fulfillmentType) }
              { this.renderFulfillmentContactInfo(group.deliveryDestination.deliveryContact) }
              { this.renderFulfillmentDestination(group.fulfillmentType as CustomerOrderFulfillmentType, group.deliveryDestination) }
            </View>
          </View>
        </View>
        {
          this.props.customerOrderItems && this.props.customerOrderItems.length > 0 &&
          <CustomerOrderItemCollectionDisplay
            customerLineItems={getFufillmentGroupItems(group, this.props.customerOrderItems)}
            preferredLanguage={this.props.preferredLanguage}/>
        }
        {this.renderFulfillmentGroupLink(group)}
      </View>
    );
  }

  private renderFulfillmentTypeTag(fulfillmentType: ("ShipToCustomer" | "StorePickup")): JSX.Element {
    let tagType: string;

    if (this.props.orderType && this.props.orderType === CustomerOrderTypeCodeEnum.Reservation) {
      tagType = "Reserved";
    } else if (fulfillmentType === "ShipToCustomer") {
      tagType = "DeliveryTruck"
    } else if (fulfillmentType === "StorePickup") {
      tagType = "Store";
    }

    return (
      <View style={this.styles.tagLine}>
        <StatusTag
          testID={this.testID}
          type={StatusType.Icon}
          name={tagType}
          labelCode={STATUS_TAG_NAME_LABEL[tagType]}
          wrapperStyle={this.styles.tagCell}
        />
      </View>
    )
  }

  private renderFulfillmentContactInfo(deliveryContacts: DeliveryContact[]): JSX.Element {
    let contactName: string = "";
    let contactPhone: string = "";
    let contactEmail: string = "";

    if (deliveryContacts && deliveryContacts.length > 0){
      const deliveryContact: DeliveryContact = deliveryContacts[0];
      contactName = formatPersonName(deliveryContact.contactPerson);

      const telephone = deliveryContact.phone && deliveryContact.phone.length > 0 && deliveryContact.phone[0];
      const email = deliveryContact.email && deliveryContact.email.length > 0 && deliveryContact.email[0];
      if (telephone && telephone.phoneNumber) {
        contactPhone = telephone.phoneNumber;
      }
      if (email && email.address) {
        contactEmail = email.address;
      }
    }

    return (
      <View style={this.styles.fulfillmentInfoContainer}>
        <View>
          <Text
            {...getTestIdProperties(this.testID, "contactName")}
            style={this.styles.contactText}>
              {contactName}
          </Text>
          <Text
            {...getTestIdProperties(this.testID, "contactPhone")}
            style={this.styles.contactText}>
              {contactPhone}
          </Text>
          <Text
            {...getTestIdProperties(this.testID, "contactEmail")}
            style={this.styles.contactText}>
              {contactEmail}
          </Text>
        </View>
      </View>
    )
  }

  private renderFulfillmentDestination(fulfillmentType: CustomerOrderFulfillmentType, deliveryDestination: DeliveryDestination): JSX.Element {
    if (deliveryDestination) {
      if (fulfillmentType === CustomerOrderFulfillmentType.StorePickup) {
        const pickupStore: BusinessUnit = deliveryDestination.pickupStore;
        let storeName: string;
        let storeId: string;
        if (pickupStore) {
          storeName = pickupStore.name;
          storeId = pickupStore.businessUnitId;
        }

        return (
          <View style={this.styles.fulfillmentInfoContainer}>
            <View>
              <Text
                {...getTestIdProperties(this.testID, "storeName")}
                style={this.styles.storeLabel}>
                  {I18n.t("storeName")}
              </Text>
              <Text
                {...getTestIdProperties(this.testID, "storeId")}
                style={this.styles.storeText}>
                  {storeName} ({storeId})
              </Text>
            </View>
          </View>
        )
      } else if (fulfillmentType === CustomerOrderFulfillmentType.ShipToCustomer) {
        const address: PostalAddress = deliveryDestination.address;
        return (
          <View style={this.styles.fulfillmentInfoContainer}>
            <View>
              <Text
                {...getTestIdProperties(this.testID, "shippingAddress-label")}
                style={this.styles.storeLabel}>
                  {I18n.t("shippingAddress")}
              </Text>
              {
                address &&
                this.renderDestinationAddress(address)
              }
            </View>
          </View>
        )
      }
    }
  }

  private renderDestinationAddress = (postalAddress: PostalAddress): JSX.Element[] | JSX.Element => {
    const {
      addressLine1, addressLine2, addressLine3, addressLine4,
      city, firstAdminDivision, secondAdminDivision, postalCode, countryCode
    } = postalAddress;
    const address: AddressFormat = {
      address1: addressLine1,
      address2: addressLine2,
      address3: addressLine3,
      address4: addressLine4,
      city,
      state: firstAdminDivision,
      district: secondAdminDivision,
      postalCode,
      countryCode
    };
    const addressFormatConfig = countryCode && getAddressFormatorDefault(
      this.props.settings.configurationManager,
      countryCode,
      this.props.i18nLocation
    );
    let formattedAddress: string[];
    if (addressFormatConfig && addressFormatConfig.formatLines){
      formattedAddress = formatAddress(addressFormatConfig.formatLines, address);
    }

    return (
      formattedAddress && formattedAddress.length ? formattedAddress.map((line) =>
        <SectionLine
          testID={`${this.testID}-{address}`}
          styles={this.styles}>
            {line}
        </SectionLine>)
        :
        <React.Fragment>
          <SectionLine styles={this.styles}
            testID={`${this.testID}-address-city`}
            isVisible={(!!addressLine1 || !!city)}>
            {addressLine1}, {city}
          </SectionLine>
          <SectionLine styles={this.styles}
            testID={`${this.testID}-address-city`}
            isVisible={(!!firstAdminDivision || !!postalCode)}>
            {firstAdminDivision}-{postalCode}
          </SectionLine>
        </React.Fragment>
    );
  }

  private isTrackingLinkHidden = (shipmentTracking: ShipmentTracking): boolean => {
    return (!shipmentTracking ||
        (!!shipmentTracking && _.isEmpty(shipmentTracking.trackingURL) && _.isEmpty(shipmentTracking.trackingId)));
  }

  private renderFulfillmentGroupLink = (group: FulfillmentGroup): JSX.Element => {
    if (group?.fulfillmentType !== 'ShipToCustomer') {
      return undefined;
    }

    return (
        <View>
          {
            !this.isTrackingLinkHidden(group.shipmentTracking) &&
            <CustomerOrderTrackingLink
              trackingLinkLabel={I18n.t("trackItem")}
              trackingId={group.shipmentTracking.trackingId}
              trackingUrl={group.shipmentTracking.trackingURL}
            />
          }
        </View>
    )
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    settings: state.settings,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

export default connect(mapStateToProps)(CustomerOrderFulfillmentGroupDisplay);
