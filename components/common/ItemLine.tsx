import * as React from "react";
import { ImageURISource, Text, View, ViewStyle } from "react-native";
import * as Device from "react-native-device-detection";
import { connect } from "react-redux";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_ITEM_SUBSCRIPTION_EVENT,
  FormattedAmountSuffix,
  IDiscountDisplay,
  IItemDisplayLine,
  IPromotionDisplay,
  isFeatureConfigPresentAndEnabled,
  ITEM_RETURN_LINE_TYPE,
  Order
} from "@aptos-scp/scp-component-store-selling-features";
import { TaxExemptionType } from "@aptos-scp/scp-component-taxation";

import I18n from "../../../config/I18n";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import { AspectPreservedImage } from "./AspectPreservedImage";
import StatusTag, { STATUS_TAG_NAME_LABEL, StatusType } from "./StatusTag";
import { itemLineStyles } from "./styles";
import {
  getFeatureAccessConfig,
  getItemAttributeDisplayOrderConfig,
  getItemAttributesOrder,
  getItemQuantity,
  getLineAdjustmentText,
  printAdjustmentAmount,
  printAmount
} from "./utilities";
import { isDeliveryFulfillmentGroup, isPickupFulfillmentGroup } from "./utilities/subscriptionUtils";

interface IStatusTagInfo {
  taxOverrideSuffix: string;
  isPickup: boolean;
  isDelivery: boolean;
  hasComment: boolean;
  hasStatusTag: boolean;
  showSubscription: boolean;
}

interface StateProps {
  configManager: IConfigurationManager;
  order: Order;
  retailLocationLocale: string;
}

interface Props extends StateProps {
  style?: ViewStyle;
  line: IItemDisplayLine;
  hideImage?: boolean;
  hidePrice?: boolean;
  hideQuantity?: boolean;
  showReservedQuantity?: boolean;
  testID?: string;
}

interface State {
  adjustedRowWidth: number;
  adjustedRowHeight: number;
}

class ItemLine extends React.Component<Props, State> {
  private styles: any;
  private readonly itemAttributesDisplayOrder?: Set<string>;
  private hiddenTypes: string[];
  private itemSubscriptionEnabled: boolean;
  private displayReturnValue: boolean;

  public constructor(props: Props) {
    super(props);

    this.state = {
      adjustedRowWidth: undefined,
      adjustedRowHeight: undefined
    };

    this.itemAttributesDisplayOrder = getItemAttributeDisplayOrderConfig(this.props.configManager);
    this.styles = Theme.getStyles(itemLineStyles());
    const itemDisplayBehaviors = this.props.configManager && this.props.configManager.getFunctionalBehaviorValues() &&
        this.props.configManager.getFunctionalBehaviorValues().itemDisplayBehaviors;
    this.hiddenTypes =  itemDisplayBehaviors && itemDisplayBehaviors.hideDisplayKeyForItemTypes;
    this.displayReturnValue = itemDisplayBehaviors && itemDisplayBehaviors.displayReturnValue;

    this.itemSubscriptionEnabled = isFeatureConfigPresentAndEnabled(APPLY_ITEM_SUBSCRIPTION_EVENT, this.props.configManager);
  }

  public render(): JSX.Element {
    const { configManager, line } = this.props;
    const itemImageSource: ImageURISource = this.establishImageSourceToRender(configManager, line);

    // Note: The currency formatting below relies on the device's locale, not the currency of the value provided.  We
    // will need to format the amount based on the currency in the Money object, which might be able to be handled by
    // the Money.toLocaleString(), or might need a different approach.

    // There should always be an extendedAmount.
    const extendedAmount: string = printAmount(line.extendedAmountExcludingTransactionDiscounts);
    const hasImage: boolean = itemImageSource !== undefined && !this.props.hideImage;
    const hasAdjustments: boolean = line.lineAdjustments.length > 0;
    const isReturn: boolean = line.lineType === ITEM_RETURN_LINE_TYPE;

    return (
      <View style={[this.styles.root, this.props.style ? this.props.style : {}]}>
        <View style={this.styles.row} onLayout={(event) => this.measureAdjustedRowHeight(event)}>
          {hasImage &&
            <View style={this.styles.imageCell} onLayout={(event) => this.measureAdjustedImageWidth(event)}>
              <AspectPreservedImage
                testID={this.props.testID}
                desiredSource={itemImageSource}
                rowWidth={this.state.adjustedRowWidth > 0
                    ? this.state.adjustedRowWidth
                    : (this.styles.row.width || this.styles.imageSize.width)
                }
                rowHeight={this.state.adjustedRowHeight > 0
                    ? this.state.adjustedRowHeight
                    : (this.styles.row.height || this.styles.imageSize.height)
                }
                defaultSource={require("../../../../assets/img/no-image.png")}
                defaultSourceWidth={this.styles.imageSize.width}
                defaultSourceHeight={this.styles.imageSize.height}
                style={this.styles.image}
              />
            </View>
          }
          { this.getItemLine(line, extendedAmount, hasAdjustments, isReturn) }
        </View>
        { this.getStatusLine(line, extendedAmount, hasAdjustments, isReturn) }
      </View>
    );
  }

  private getStatusTagInfo(line: IItemDisplayLine, hasAdjustments: boolean, isReturn: boolean): IStatusTagInfo {
    const taxOverrideSuffix = !!line.taxOverride && ` ${I18n.t("taxOverrideSuffix", { defaultValue: FormattedAmountSuffix.TAX_OVERRIDE })}`;

    const isPickup: boolean = isPickupFulfillmentGroup(this.props.order, line && line.fulfillmentGroupId);
    const isDelivery: boolean = isDeliveryFulfillmentGroup(this.props.order, line && line.fulfillmentGroupId);
    const hasComment = line.comment && line.comment.length > 0;

    const showSubscription: boolean = this.itemSubscriptionEnabled && !isPickup && !isDelivery && !isReturn &&
        (line.eligibleForSubscription || line.subscribed);

    const hasStatusTag: boolean = isPickup || isDelivery || line.giftReceipt || hasAdjustments || isReturn ||
        hasComment || showSubscription;

    return { taxOverrideSuffix, isPickup, isDelivery, hasComment, showSubscription, hasStatusTag };
  }

  private getStatusLine(line: IItemDisplayLine,
                        extendedAmount: string,
                        hasAdjustments: boolean,
                        isReturn: boolean): React.ReactNode {
    const {
      taxOverrideSuffix,
      isPickup,
      isDelivery,
      hasComment,
      showSubscription,
      hasStatusTag
    } = this.getStatusTagInfo(line, hasAdjustments, isReturn);


    return hasStatusTag &&
      <View style={this.styles.giftOrTotalLine}>
        <View style={this.styles.itemTags}>
          {
            showSubscription && line.subscribed &&
            this.renderStatusTag("Subscribed", "Checkmark", I18n.t(
                this.getSubscriptionFeaturesValues()?.subscriptionAddedTagText?.i18nCode,
                { defaultValue: this.getSubscriptionFeaturesValues()?.subscriptionAddedTagText?.default })
            )
          }
          {
            showSubscription && !line.subscribed &&
            this.renderStatusTag("Subscribe", undefined, I18n.t(
                this.getSubscriptionFeaturesValues()?.subscriptionAvailableTagText?.i18nCode,
                { defaultValue: this.getSubscriptionFeaturesValues()?.subscriptionAvailableTagText?.default }),
                StatusType.Caution
            )
          }
          { isPickup && this.renderStatusTag("Store") }
          { isDelivery && this.renderStatusTag("DeliveryTruck") }
          { line.giftReceipt && this.renderStatusTag("GiftReceipt") }
          { hasComment && this.renderStatusTag("CommentReceipt") }
          { isReturn && this.renderStatusTag("Returns") }
        </View>
        {
          !this.props.hidePrice && hasAdjustments &&
          <View style={this.styles.totalAmountCell}>
            <Text style={this.styles.itemPriceText}>
              {extendedAmount}{taxOverrideSuffix}
            </Text>
          </View>
        }
      </View>;
  }

  private renderStatusTag(name: string, iconName?: string, customLabel?: string, customType?: StatusType): React.ReactNode {
    return (
      <StatusTag
        type={customType || StatusType.Icon}
        name={name}
        labelCode={customLabel ? undefined : STATUS_TAG_NAME_LABEL[name]}
        label={customLabel}
        wrapperStyle={this.styles.tagCell}
        iconName={iconName}
      />
    );
  }

  private getSubscriptionFeaturesValues(): any {
    return getFeatureAccessConfig(this.props.configManager, APPLY_ITEM_SUBSCRIPTION_EVENT);
  }

  private getItemLine(
      line: IItemDisplayLine,
      extendedAmount: string,
      hasAdjustments: boolean,
      isReturn: boolean
  ): JSX.Element {
    const itemIdKeyType = line.itemIdKeyType && line.itemIdKeyType.toLowerCase();
    const exemptions = this.renderItemTaxExemptionInformation(line);
    const itemAttributesDisplayOrder = (this.itemAttributesDisplayOrder) ? [...this.itemAttributesDisplayOrder] : [];
    return (
      <View style={this.styles.descriptionCell}>
        {(line.itemShortDescription !== undefined && line.itemShortDescription.trim().length > 0) &&
        <View style={this.styles.descriptionCellLine}>
          <Text style={this.styles.itemDescriptionText} numberOfLines={2} ellipsizeMode={"tail"}>
            {line.itemShortDescription}
          </Text>
        </View>
        }
        { this.renderDeviceSpecificDescriptionCellLine(line, itemIdKeyType,
              isReturn ?
                  printAmount(line.originalUnitPrice.amount.times(-1)) :
                  printAmount(line.originalUnitPrice.amount)) }
        <View style={this.styles.descriptionCellLine}>
          <View style={this.styles.textCell}>
            {(line.itemAdditionalDescription !== undefined && line.itemAdditionalDescription.trim().length > 0) &&
            <Text style={this.styles.itemDetailsText} numberOfLines={1} ellipsizeMode={"tail"}>
              {line.itemAdditionalDescription}
            </Text>
            }
            {itemAttributesDisplayOrder.length > 0 &&
              itemAttributesDisplayOrder.map((attribute: string) =>
                  this.getItemAttributes(attribute, line, this.styles.itemDetailsText)
              )
            }
            {isReturn && line.reasonDescription &&
            <Text style={this.styles.itemDetailsText} numberOfLines={1} ellipsizeMode={"tail"}>
              {I18n.t("itemReturnReason")}{line.reasonDescription}
            </Text>
            }
          </View>
          <View>
            {this.renderPriceAndQuantity(line, extendedAmount, hasAdjustments, isReturn)}
            {(!this.props.hidePrice && !hasAdjustments && !line.taxOverride && !exemptions) &&
            <Text style={this.styles.itemPriceText}>
              {extendedAmount} {!!exemptions && I18n.t("taxExemptedSuffix",
                {defaultValue: FormattedAmountSuffix.TAX_EXEMPT })}
            </Text>
            }
          </View>
        </View>
        { line.subscribed && this.renderSubscriptionData(line) }
        {!!exemptions && this.getTaxExemptionWithUnitPrice(line, hasAdjustments, exemptions, extendedAmount)}
        {hasAdjustments ? this.getLineAdjustments(line, isReturn) : undefined}
        {!!line.taxOverride && this.getTaxOverrideWithExtendedAmount(line, extendedAmount)}
      </View>
    );
  }

  private renderSubscriptionData(line: IItemDisplayLine): React.ReactNode {
    const quantity = line.subscriptionQuantity;

    const deliveryFrequencyText = line.deliveryfrequencyDescription;

    let frequency: string;
    if (deliveryFrequencyText) {
      frequency = I18n.t(
        "frequencyWithValue",
        {frequency: deliveryFrequencyText}
      );
    }

    return (
      <View style={this.styles.descriptionCellLine}>
        <View style={this.styles.textCell}>
          {
            quantity &&
            <Text style={this.styles.itemDetailsText} numberOfLines={1}>
              {I18n.t("subscriptionQtyWithValue", { quantity })}
            </Text>
          }
          {
            frequency &&
            <Text style={this.styles.itemDetailsText} numberOfLines={1}>
              {frequency}
            </Text>
          }
        </View>
      </View>
    );
  }

  private renderPriceAndQuantity(line: IItemDisplayLine,
    extendedAmount: string,
    hasAdjustments: boolean,
    isReturn: boolean
    ): JSX.Element {
    const isHiddenType = this.hiddenTypes && this.hiddenTypes.indexOf(line.itemType) > -1;
    return(
      <View>
        {
        !Theme.isTablet && !isHiddenType && !this.props.hidePrice &&
        <View style={this.styles.amountCell}>
          <Text style={this.styles.itemDetailsText}>
            { isReturn ? printAmount(line.originalUnitPrice.amount.times(-1)) :
                printAmount(line.originalUnitPrice.amount)}
          </Text>
        </View>
        }
        {
        !Theme.isTablet && isHiddenType && !this.props.hideQuantity &&
        <Text style={this.styles.itemQuantityTextNonMerch}>
          {`${I18n.t("quantityAbbreviation")}: `}
          {getItemQuantity(
              line,
              this.props.showReservedQuantity)}
        </Text>
        }
        {
        isHiddenType && !this.props.hidePrice &&
        <Text style={this.styles.itemOriginalPriceText}>
          {printAmount(line.originalUnitPrice.amount)}
        </Text>
        }
      </View>
    );
  }

  private renderItemTaxExemptionInformation(line: IItemDisplayLine): string {
    const exemptedTaxAuthorities: string[] = !!line.taxAuthority && line.taxAuthority
        .filter((authority) => !!authority.taxExemption &&
            (authority.taxExemption.taxExemptType === TaxExemptionType.Item ||
            authority.taxExemption.taxExemptType === TaxExemptionType.Transaction ))
        .map((authority) => authority.taxAuthority.taxAuthorityName);
    const exemptions: string = (!!exemptedTaxAuthorities && exemptedTaxAuthorities.length > 0) ?
        `${I18n.t("itemTaxExemptionLabel")} - ${exemptedTaxAuthorities.join(", ")}` : undefined;
    return exemptions;
  }

  private renderDeviceSpecificDescriptionCellLine(line: IItemDisplayLine, itemIdKeyType: string,
                                                  originalUnitPrice: string): JSX.Element {
    const isHiddenType = this.hiddenTypes && this.hiddenTypes.indexOf(line.itemType) > -1;

    return (
      <React.Fragment>
        {!Theme.isTablet && !isHiddenType &&
        <View style={this.styles.descriptionCellLine}>
          {!line.maskedCardNumber &&
            <Text style={this.styles.itemDetailsText}>
              {I18n.t(itemIdKeyType, {defaultValue: itemIdKeyType})}: {line.itemIdKey}
            </Text>
          }
          {line.maskedCardNumber &&
            <Text style={this.styles.itemDetailsText}>
              {line.maskedCardNumber}
            </Text>
          }
          {!this.props.hideQuantity &&
            <Text style={this.styles.itemQuantityText}>
              {`${I18n.t("quantityAbbreviation")}: `}
              {getItemQuantity(
                  line,
                  this.props.showReservedQuantity)}
            </Text>
          }
        </View>
        }
        {Theme.isTablet && !isHiddenType &&
        <View style={this.styles.descriptionCellLine}>
          {!line.maskedCardNumber &&
            <Text style={this.styles.itemDetailsText}>
              {I18n.t(itemIdKeyType, {defaultValue: itemIdKeyType})}: {line.itemIdKey}
            </Text>
          }
          {line.maskedCardNumber &&
            <Text style={this.styles.itemDetailsText}>
              {line.maskedCardNumber}
            </Text>
          }
          {!this.props.hidePrice &&
            <View style={this.styles.amountCell}>
              <Text style={this.styles.itemDetailsText}>{originalUnitPrice}</Text>
            </View>
          }
        </View>
        }
      </React.Fragment>
    );
  }

  private establishImageSourceToRender(configurationManager: IConfigurationManager,
                                       line: IItemDisplayLine): ImageURISource {
    //
    // Establish image source using configuration policy for line item image display
    const lineItemImageConfiguration = configurationManager.getFunctionalBehaviorValues().lineItemImage;

    switch (lineItemImageConfiguration.imageSource) {
      case "ImageFromItemData":
      case "ImageFromUrlPattern":
        //
        // In these cases we always want to display an image.  So, if the imageURL within the line item is empty
        // set it to our "default" image.  Otherwise, return the expected value.
        if (line.itemImageUrl && (line.itemImageUrl.length > 0)) {
          let imageUrl = line.itemImageUrl;
          if (lineItemImageConfiguration.imageSource === "ImageFromUrlPattern") {
            //
            // Resolution Factor -- iOS devices with higher resolution need "2x" and/or "3x" images to keep images
            // clear when actually rendered on the device.  Requesting an image larger than we actually need
            // makes a larger network demand, so we only want to do this if we need to.  Hence, the detection
            // of iOS devices.
            let resolutionFactor: number = 1;
            if (Device.isIos) {
              resolutionFactor = 2;
            }
            imageUrl = imageUrl.replace(/{{width}}/g, `${this.styles.imageSize.width * resolutionFactor}`);
            imageUrl = imageUrl.replace(/{{height}}/g, `${this.styles.imageSize.height * resolutionFactor}`);
          }
          return {uri: imageUrl};
        } else {
          return require("../../../../assets/img/no-image.png");
        }
        // tslint:disable-next-line:no-switch-case-fall-through
      default:
        //
        // In this case we're not using images.
        return undefined;
    }
  }

  private measureAdjustedRowHeight(event: any): void {
    const rowHeight: number = event.nativeEvent.layout.height;
    const imagePadding: number = (this.styles.imageCell && this.styles.imageCell.padding)
        ? this.styles.imageCell.padding : 0;
    const rowBorderBottomWidth: number = (this.styles.row && this.styles.row.borderBottomWidth)
        ? this.styles.row.borderBottomWidth : 0;
    const rowHeightAdjustment: number = (imagePadding * 2) - rowBorderBottomWidth;
    this.setState({
      adjustedRowHeight: (rowHeight - rowHeightAdjustment)
    });
  }

  private measureAdjustedImageWidth(event: any): void {
    const rowWidth: number = event.nativeEvent.layout.width;
    const imagePadding: number = (this.styles.imageCell && this.styles.imageCell.padding)
        ? this.styles.imageCell.padding : 0;
    const rowWidthAdjustment: number = (imagePadding * 2);
    this.setState({
      adjustedRowWidth: (rowWidth - rowWidthAdjustment)
    });
  }

  private getLineAdjustments(line: IItemDisplayLine, isReturn: boolean): JSX.Element {
    const unitPrice: string = isReturn ? printAmount(line.unitPriceExcludingTransactionDiscounts.amount.times(-1)) :
        printAmount(line.unitPriceExcludingTransactionDiscounts.amount);
    return (
      <View style={this.styles.discountCellLine}>
        {line.lineAdjustments.map((lineAdjustment: IPromotionDisplay | IDiscountDisplay) =>
            <View style={this.styles.discountLine}>
              <View style={this.styles.textCell}>
                <Text style={[this.styles.itemDetailsText, this.styles.discountText]} numberOfLines={1}
                      ellipsizeMode={"middle"}>
                  {getLineAdjustmentText(lineAdjustment, this.props.configManager)}
                </Text>
              </View>
              <View style={this.styles.amountCell}>
                <Text style={[this.styles.itemDetailsText, this.styles.discountText]}>
                {printAdjustmentAmount(((lineAdjustment as any).adjustmentAmount || lineAdjustment.amount))}
                </Text>
              </View>
            </View>
        )}
        {!this.props.hidePrice &&
        <View style={this.styles.descriptionCellLine}>
          <View />
          <View style={this.styles.totalAmountCell}>
            <Text style={[this.styles.itemAmountText, this.styles.activeUnitPriceText]}>{unitPrice}</Text>
          </View>
        </View>
        }
        {!this.props.hidePrice && !isReturn && this.displayReturnValue && line.returnUnitPrice &&
        <View style={this.styles.descriptionCellLine}>
          <View style={this.styles.textCell}>
            <Text style={this.styles.itemReturnPriceText}>
              {I18n.t("returnPrice")}: {printAmount(line.returnUnitPrice.amount)}
            </Text>
          </View>
        </View>
        }
      </View>
    );
  }

  private getTaxOverrideWithExtendedAmount(line: IItemDisplayLine,
                                           extendedAmount: string): JSX.Element {
    const label = I18n.t("taxOverrideRate", { taxRate: line.taxOverride.taxRate });
    const taxAmount = printAmount(line.totalLineTax);

    return (
      <View style={this.styles.taxOverrideLine}>
        <View style={[this.styles.taxOverrideColumnSize(1.8), this.styles.taxOverrideColumnAlign]}>
          <View style={this.styles.textCell}>
            <Text style={[this.styles.itemDetailsText, this.styles.discountText]} numberOfLines={1}
                  ellipsizeMode={"middle"}>
              {label}
            </Text>
          </View>
          <View style={this.styles.amountCell}>
            <Text style={[this.styles.itemDetailsText]}>
              {taxAmount}
            </Text>
          </View>
        </View>
        <View style={this.styles.taxOverrideColumnSize()}>
          <Text style={[this.styles.itemAmountText]}>
            {extendedAmount} {I18n.t("taxOverrideSuffix", { defaultValue: FormattedAmountSuffix.TAX_OVERRIDE })}
          </Text>
        </View>
      </View>
    );
  }

  private getItemAttributes(attribute: string, line: IItemDisplayLine, styles: any): JSX.Element {
    const getItemAttributesOrders = getItemAttributesOrder(attribute, line, this.props.retailLocationLocale);
    if (getItemAttributesOrders.attributes) {
      return (
        <Text style={styles} numberOfLines={1} ellipsizeMode={"tail"}>
          {`${getItemAttributesOrders.attributename}: ${getItemAttributesOrders.attributes}`}
        </Text>
      );
    } else {
      return null;
    }
  }

  private getTaxExemptionWithUnitPrice( line: IItemDisplayLine,
                                        hasAdjustments: boolean = false,
                                        exemptions: string,
                                        extendedAmount: string): JSX.Element {

    return (
      <View style={this.styles.descriptionCellLine}>
        <View style={this.styles.textCell}>
          <Text style={this.styles.itemTaxExemptText}>{exemptions}</Text>
        </View>
        <View>
          {(!this.props.hidePrice && !hasAdjustments && !line.taxOverride) &&
            <Text style={[this.styles.itemAmountText, hasAdjustments && this.styles.activeUnitPriceText]}>
              {extendedAmount} {I18n.t("taxExemptedSuffix", {defaultValue: FormattedAmountSuffix.TAX_EXEMPT })}
            </Text>
          }
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    configManager: state.settings.configurationManager,
    order: state.businessState.stateValues.get("transaction.order"),
    retailLocationLocale: state.settings.primaryLanguage
  };
};

export default connect(mapStateToProps)(ItemLine);
