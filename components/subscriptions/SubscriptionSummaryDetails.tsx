import * as React from "react";
import { Text, View } from "react-native";

import {
  AddressFormat,
  formatAddress,
  getAddressFormatorDefault,
  IItemDisplayLine
} from "@aptos-scp/scp-component-store-selling-features";
import { IAddress } from "@aptos-scp/scp-types-commerce-transaction";

import i18n from "../../../config/I18n";
import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import SectionLine from "../common/SectionLine";
import { printAmount } from "../common/utilities";
import { subscriptionSummaryDetailsStyles } from "./styles";


interface Props {
  subscribedItemDisplayLines: IItemDisplayLine[];
  deliveryContact: any;
  deliveryAddress: IAddress;
  settings: SettingsState;
  style?: any;
  i18nLocation: string
}

export default class SubscriptionSummaryDetails extends React.PureComponent<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(subscriptionSummaryDetailsStyles());
  }

  public render(): JSX.Element {
    return (
      <View style={[this.styles.root, this.props.style || {}]}>
        <View style={this.styles.topSection}>
          <Text style={this.styles.topText} numberOfLines={1} adjustsFontSizeToFit={true}>
            {i18n.t("subscription")}
          </Text>
        </View>
        {this.renderDeliveryDetails()}
        {this.renderSusbscribedItems()}
      </View>
    );
  }

  private renderDeliveryDetails(): JSX.Element {
    return (
      <View style={this.styles.section}>
        {this.renderDeliveryAddress()}
        { this.props.deliveryContact.emailAddress &&
          this.renderEmailAddress()
        }
      </View>
    );
  }

  private renderEmailAddress(): JSX.Element {
    return (
      <View style={this.styles.detailsRow}>
        <Text style={this.styles.detailsText} numberOfLines={1} adjustsFontSizeToFit={true}>
          {this.props.deliveryContact.emailAddress}
        </Text>
      </View>
    );
  }

  private renderDeliveryAddress = (): React.ReactNode[] | React.ReactNode => {
    const {
      addressLine1, addressLine2, addressLine3, addressLine4,
      city, stateOrProvince, postalCode, countryCode
    } = this.props.deliveryAddress;
    const address: AddressFormat = {
      address1: addressLine1,
      address2: addressLine2,
      address3: addressLine3,
      address4: addressLine4,
      city,
      state: stateOrProvince,
      district: undefined,
      postalCode,
      countryCode
    };
    const addressFormatConfig = countryCode && getAddressFormatorDefault(
      this.props.settings.configurationManager,
      countryCode,
      this.props.i18nLocation
    );
    const formattedAddress = formatAddress(addressFormatConfig.formatLines, address);

    return (
      formattedAddress && formattedAddress.length ?
        formattedAddress.map((line) =>
          <View style={this.styles.addressRow}>
            <Text style={this.styles.detailsText}>
              {line}
            </Text>
          </View>)
        :
        <>
          <SectionLine styles={this.styles.addressRow}
            isVisible={(!!addressLine1 || !!city)}>
            {addressLine1}, {city}
          </SectionLine>
          <SectionLine styles={this.styles.addressRow}
            isVisible={(!!stateOrProvince || !!postalCode)}>
            {stateOrProvince}-{postalCode}
          </SectionLine>
        </>
    );
  }

  private renderSusbscribedItems(): JSX.Element {
    return (
      <View style={this.styles.section}>
        {this.props.subscribedItemDisplayLines && this.props.subscribedItemDisplayLines.length > 0 &&
          this.props.subscribedItemDisplayLines.map((item: IItemDisplayLine) => {
            return (
              <View>
                <View style={this.styles.detailsRow}>
                  <Text style={this.styles.detailsText} numberOfLines={1} adjustsFontSizeToFit={true}>
                    {item.itemShortDescription}
                  </Text>
                  <Text style={[this.styles.detailsText, this.styles.amountText || {}]}>
                    {printAmount(item.extendedAmount)}
                  </Text>
                </View>
                <View style={this.styles.detailsRow}>
                  <Text style={this.styles.subDetailsText} numberOfLines={1} adjustsFontSizeToFit={true}>
                    {i18n.t("qty")}: {item.subscriptionQuantity}
                  </Text>
                </View>
                {
                  (item.deliveryInterval || item.deliveryCode) &&
                  <View style={this.styles.detailsRow}>
                    <Text style={this.styles.subDetailsText} numberOfLines={1} adjustsFontSizeToFit={true}>
                      {i18n.t("schedule")}: { item.deliveryfrequencyDescription }
                    </Text>
                  </View>
                }
              </View>
            )
          })
        }
      </View>
    );
  }
}
