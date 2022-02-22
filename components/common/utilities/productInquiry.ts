import { IConfigurationValues } from "@aptos-scp/scp-component-store-selling-core";
import {
  FulfillmentGroup,
  getProductAttribute,
  getProductAttributeTranslation,
  IItemDisplayLine,
  StoreItem
} from "@aptos-scp/scp-component-store-selling-features";
import { FulfillmentType } from "@aptos-scp/scp-types-commerce-transaction";

import i18n from "../../../../config/I18n";


export const colorAttributeType = "Color";
export const sizeAttributeType = "Size";
const styleAttributeType = "Style";
export const seasonAttributeType = "Season";

export type ProductAttributeParent = StoreItem | IItemDisplayLine;

export function getColorName(attributeParent: ProductAttributeParent, retailLocationLocale: string): string {
  return getAttributeName(colorAttributeType, attributeParent, retailLocationLocale);
}

export function getSizeName(attributeParent: ProductAttributeParent, retailLocationLocale: string): string {
  return getAttributeName(sizeAttributeType, attributeParent, retailLocationLocale);
}

export function getStyleName(attributeParent: ProductAttributeParent, retailLocationLocale: string): string {
  return getAttributeName(styleAttributeType, attributeParent, retailLocationLocale);
}

export function getStyleCode(attributeParent: ProductAttributeParent): string {
  const styleAttribute = getProductAttribute(attributeParent.productAttributes, styleAttributeType);
  return styleAttribute && styleAttribute.code;
}

export function getSeasonName(attributeParent: ProductAttributeParent, retailLocationLocale: string): string {
  return getAttributeName(seasonAttributeType, attributeParent, retailLocationLocale);
}

export function getItemAttributesOrder(
  attribute: string,
  item: StoreItem | IItemDisplayLine,
  retailLocationLocale: string
): {"attributename": string, "attributes": string} {
  let itemAttributesName: string = i18n.t("color");
  let itemAttributes: string = getColorName(item, retailLocationLocale);

  if (attribute.toLowerCase() === sizeAttributeType.toLowerCase()) {
    itemAttributesName = i18n.t("size");
    itemAttributes = getSizeName(item, retailLocationLocale);
  } else if (attribute.toLowerCase() === seasonAttributeType.toLowerCase()) {
    itemAttributesName = i18n.t("season");
    itemAttributes = getSeasonName(item, retailLocationLocale);
  }
  return {"attributename": itemAttributesName, "attributes": itemAttributes};
}

export function getDeliveryTypePresentAndEnabled(
    omniChannelConfig: IConfigurationValues,
    deliveryTypeConfigKey: string
): boolean {
  let enabled: boolean = false;

  if (omniChannelConfig && omniChannelConfig.orders) {
    const { deliveryMethodsSupported } = omniChannelConfig.orders;
    enabled = deliveryMethodsSupported && deliveryMethodsSupported[deliveryTypeConfigKey] &&
        deliveryMethodsSupported[deliveryTypeConfigKey].enabled;
  }

  return enabled;
}

export function getNearbyLocationPresentAndEnabled(
  omniChannelConfig: IConfigurationValues
): boolean {
  let enabled: boolean = false;

  if (omniChannelConfig && omniChannelConfig.inventory) {
    const { enableFindNearby } = omniChannelConfig.inventory;
    enabled = !!enableFindNearby;
  }

  return enabled;
}

export function getMapViewOfNearbyRetailLocationsPresentAndEnabled(
  omniChannelConfig: IConfigurationValues
): boolean {
  return !!omniChannelConfig?.inventory?.enableMapViewOfNearbyRetailLocations;
}

export function getGoogleMapsAPIKey(
  omniChannelConfig: IConfigurationValues
): string {
  return omniChannelConfig?.inventory?.googleMapsAPIKey;
}

export function isItemFulfillmentType(fulfillmentGroup: FulfillmentGroup, fulfillmentType: FulfillmentType): boolean {
  return fulfillmentGroup && fulfillmentGroup.fulfillmentType === fulfillmentType;
}

function getAttributeName(
  attributeType: string,
  attributeParent: ProductAttributeParent,
  retailLocationLocale: string
): string {
  const attribute = getProductAttribute(attributeParent.productAttributes, attributeType);
  if (attribute) {
    const attributeTranslation = getProductAttributeTranslation(attribute, retailLocationLocale);
    return attributeTranslation && attributeTranslation.name;
  } else {
    return undefined;
  }
}
