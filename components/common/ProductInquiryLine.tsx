import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { ConfigurationBlockKey } from "@aptos-scp/scp-component-store-selling-core";
import { Price } from "@aptos-scp/scp-component-business-core";
import { ItemLookupKey, StoreItem } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import { getItemAttributeDisplayOrderConfig } from "../common/utilities/configurationUtils";
import ImageViewer from "./ImageViewer";
import { productInquiryLineStyle } from "./styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "./utilities";
import { getItemAttributesOrder } from "./utilities/productInquiry";
import VectorIcon from "./VectorIcon";


interface Props {
  settings: SettingsState;
  item: StoreItem;
  showProductDetail: (item: StoreItem) => void;
}

interface State {}

export default class ProductInquiryLine extends React.Component<Props, State> {
  private styles: any;
  private readonly itemAttributesDisplayOrder?: Set<string>;

  public constructor(props: Props) {
    super(props);
    this.itemAttributesDisplayOrder = getItemAttributeDisplayOrderConfig(this.props.settings.configurationManager);
    this.styles = Theme.getStyles(productInquiryLineStyle());
  }

  public render(): JSX.Element {
    const { item } = this.props;
    const itemAttributesDisplayOrder = [...this.itemAttributesDisplayOrder];
    return (
      <TouchableOpacity style={this.styles.row} onPress={() => this.props.showProductDetail(item)} >
        {
          Theme.isTablet && !!this.props.item.imageUrl &&
          <ImageViewer
            height={this.styles.imageSize.height}
            width={this.styles.imageSize.width}
            style={this.styles.imageCell}
            image={this.props.item.imageUrl}
            settings={this.props.settings}
          />
        }
        <View style={this.styles.details}>
          <View style={this.styles.descriptionLine}>
            <Text style={this.styles.itemDescriptionText} numberOfLines={2} ellipsizeMode={"tail"}>
              {item.name}
            </Text>
          </View>
          <View style={this.styles.descriptionLine}>
            <View style={this.styles.itemDescription}>
              {this.renderLookupKey(item.itemLookupKeys)}
              { itemAttributesDisplayOrder.map((attribute: string) =>
                    this.getItemAttributes(attribute, item, this.styles.itemDetailsText)
                )
              }
            </View>
            { this.renderPrice(item) }
          </View>
        </View>
        <View style={this.styles.arrowArea}>
          <VectorIcon name="Forward" height={this.styles.icon.fontSize} fill={this.styles.icon.color} />
        </View>
      </TouchableOpacity>
    );
  }

  private renderPrice(item:StoreItem): JSX.Element {
    const pricing = this.props.settings.configurationManager.getConfigurationValues(ConfigurationBlockKey.pricing);
    const treatTemporaryPriceAsSale = pricing?.pricingPolicies?.priceChange?.treatTemporaryPriceAsSale;
    if (!item.itemPermanentPrice && !item.itemTemporaryPrice) {
      return <View style={this.styles.itemAmount}>
        <Text style={this.styles.itemPriceText}>{this.getUnitPrice(item.price)}</Text>
      </View>;
    } else if (!item.itemTemporaryPrice) {
      return <View style={this.styles.itemAmount}>
        <Text style={this.styles.itemPriceText}>{this.getUnitPrice(item.itemPermanentPrice)}</Text>
      </View>;
    } else {
      if (treatTemporaryPriceAsSale && item.itemTemporaryPrice.amount.lt(item.itemPermanentPrice.amount)) {
        return <View style={this.styles.itemAmount}>
          <Text style={this.styles.itemPriceTextOverridden}>{this.getUnitPrice(item.itemPermanentPrice)}</Text>
          <Text style={this.styles.itemSalePriceText}>{this.getUnitPrice(item.itemTemporaryPrice)}</Text>
        </View>;
      } else {
        return <View style={this.styles.itemAmount}>
          <Text style={this.styles.itemPriceText}>{this.getUnitPrice(item.itemTemporaryPrice)}</Text>
        </View>;
      }
    }
  }

  private renderLookupKey(lookUpkeys: ItemLookupKey[]): JSX.Element {
    if (lookUpkeys.length >= 1) {
      const itemlookUpkey = lookUpkeys[0].type.toLowerCase();
      return <Text style={this.styles.itemDetailsText}>{`${I18n.t(itemlookUpkey, {
        defaultValue: itemlookUpkey
      })}: ${lookUpkeys[0].value}`}</Text>;
    } else {
      return null;
    }
  }

  private getUnitPrice(price: Price): string {
    return price && price.amount && price.amount.toLocaleString
      (getStoreLocale(), getStoreLocaleCurrencyOptions());
  }

  private getItemAttributes(attribute: string, item: StoreItem, styles: any): JSX.Element {
    const getItemAttributesOrders = getItemAttributesOrder(attribute, item, this.props.settings.primaryLanguage);
    if (getItemAttributesOrders.attributes) {
      return (
        <Text style={styles}>
          {`${getItemAttributesOrders.attributename}: ${getItemAttributesOrders.attributes}`}
        </Text>
      );
    } else {
      return null;
    }
  }
}
