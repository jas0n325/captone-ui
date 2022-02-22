import * as React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import I18n from "../../../config/I18n";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import ActionButton from "./ActionButton";
import { productActionPanelStyle } from "./styles";
import { IFeatureActionButtonItemProps } from "./utilities";
import VectorIcon from "./VectorIcon";


interface StateProps {
  featureActionButtonProps: IFeatureActionButtonItemProps;
  stateValues: Map<string, any>;
}

interface Props extends StateProps {
  isReturn: boolean;
  isReturnWithTransactionItem: boolean;
  isOfflineReturnItem: boolean;
  isEligibleForSubscription: boolean;
  isTenderLineAvailable: boolean;
  isItemWithExtensibilityForms?: boolean;
  onProductInformation: () => void;
  onChangeQuantity: () => void;
  onChangePrice: () => void;
  onItemDiscount: () => void;
  markAsGift: () => void;
  onAssignSalesperson: () => void;
  onVoidItem: () => void;
  onCommentItem: () => void;
  onTaxPress: () => void;
  onReturnReasonChange: () => void;
  onItemSubscription: () => void;
  onAdditionalInfo: () => void;
}

class ProductActionPanel extends React.PureComponent<React.PropsWithChildren<Props>> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(productActionPanelStyle());
  }

  public render(): JSX.Element {
    return (
      <ScrollView style={this.styles.root}>
        <TouchableOpacity style={this.styles.infoButton} onPress={this.props.onProductInformation} >
          <VectorIcon
            name="Information"
            fill={this.styles.infoButtonIcon.color}
            height={this.styles.infoButtonIcon.fontSize}
          />
          <Text style={this.styles.infoButtonText}>{I18n.t("productInformation")}</Text>
        </TouchableOpacity>
        <View style={this.styles.actionsPanel}>
          <View style={this.styles.actions}>
            { this.props.featureActionButtonProps.isQuantityChangeVisible &&
              <ActionButton style={this.styles.btnAction}
                            icon={{icon: "QuantityChange", size: this.styles.btnActionIcon.fontSize}}
                            title={I18n.t("changeQuantity")}
                            titleStyle={this.styles.btnActionText}
                            onPress={this.props.onChangeQuantity}
                            disabled={this.props.isReturnWithTransactionItem ? true : this.props.isReturn ?
                                !this.props.featureActionButtonProps.isQuantityChangeOnReturnEnabled :
                                !this.props.featureActionButtonProps.isQuantityChangeEnabled}
                            allowTextWrap={true} />
            }
            { this.props.featureActionButtonProps.isPriceChangeVisible &&
              <ActionButton style={this.styles.btnAction}
                            icon={{icon: "PriceOverride", size: this.styles.btnActionIcon.fontSize }}
                            title={I18n.t("overridePrice")}
                            titleStyle={this.styles.btnActionText}
                            onPress={this.props.onChangePrice}
                            disabled={this.props.isReturnWithTransactionItem ||
                                !this.props.featureActionButtonProps.isPriceChangeEnabled}
                            allowTextWrap={true}/>
            }
            { this.props.featureActionButtonProps.isItemDiscountVisible &&
              <ActionButton style={this.styles.btnAction}
                            icon={{icon: "Discount", size: this.styles.btnActionIcon.fontSize}}
                            title={I18n.t("discounts")}
                            titleStyle={this.styles.btnActionText}
                            onPress={this.props.onItemDiscount}
                            disabled={this.disableItemDiscount()}
                            allowTextWrap={true}/>
            }
            { this.props.featureActionButtonProps.isMarkGiftReceiptItemVisible &&
              <ActionButton style={this.styles.btnAction}
                            icon={{icon: "GiftReceipt", size: this.styles.btnActionIcon.fontSize}}
                            title={I18n.t("giftReceipt")}
                            titleStyle={this.styles.btnActionText}
                            onPress={this.props.markAsGift}
                            disabled={this.props.isReturnWithTransactionItem || this.props.isReturn ||
                                !this.props.featureActionButtonProps.isMarkGiftReceiptItemEnabled}
                            allowTextWrap={true}/>
            }
            {
                this.taxButton()
            }
            {
              this.props.featureActionButtonProps.isAssignSalespersonItemVisible &&
              <ActionButton style={this.styles.btnAction}
                            icon={{icon: "Salesperson", size: this.styles.btnActionIcon.fontSize}}
                            title={I18n.t("salesperson")}
                            titleStyle={this.styles.btnActionText}
                            onPress={this.props.onAssignSalesperson}
                            disabled={this.disableSalesperson()}
                            allowTextWrap={true}/>
            }
            {
              this.props.featureActionButtonProps.isMarkCommentItemVisible &&
              <ActionButton style={this.styles.btnAction}
                            icon={{icon: "Comment", size: this.styles.btnActionIcon.fontSize}}
                            title={I18n.t("comments")}
                            titleStyle={this.styles.btnActionText}
                            onPress={this.props.onCommentItem}
                            disabled={this.disableComments()}
                            allowTextWrap={true}
              />
            }
            {
              this.props.featureActionButtonProps.isReturnReasonChangeVisible &&
              this.props.isReturnWithTransactionItem &&
              <ActionButton style={this.styles.btnAction}
                            icon={{icon: "Reason", size: this.styles.btnActionIcon.fontSize}}
                            title={I18n.t("returnReason")}
                            titleStyle={this.styles.btnActionText}
                            onPress={this.props.onReturnReasonChange}
                            disabled={!this.props.featureActionButtonProps.isReturnReasonChangeEnabled}
                            allowTextWrap={true}
              />
            }
            {
              this.itemSubscriptionButton()
            }
            { this.props.featureActionButtonProps.isVoidItemVisible &&
              <ActionButton style={this.styles.btnAction}
                            icon={{icon: "Void", size: this.styles.btnActionIcon.fontSize}}
                            title={I18n.t("voidItem")}
                            titleStyle={this.styles.btnActionText}
                            onPress={this.props.onVoidItem}
                            disabled={!this.props.featureActionButtonProps.isVoidItemEnabled}
                            allowTextWrap={true}/>
            }
            {
              this.props.isItemWithExtensibilityForms &&
              <ActionButton style={this.styles.btnAction}
                            icon={{icon: "Note", size: this.styles.btnActionIcon.fontSize}}
                            title={I18n.t("additionalInfo")}
                            titleStyle={this.styles.btnActionText}
                            onPress={this.props.onAdditionalInfo}
                            allowTextWrap={true}/>
            }
            {
             this.useHiddenButton() &&  this.styles.lastBtn && <View style={this.styles.lastBtn} />
            }
          </View>
          {this.props.children}
        </View>
      </ScrollView>
    );
  }

  // FIXME: This won't work correctly when exactly 3 buttons are enabled. This needs to be updated
  // to cover any time the extra invisible button isn't needed. When there is a full row, plus the
  // invisible button, the cancel button gets pushed when it shouldn't.
  private useHiddenButton(): boolean {

    // Use the hidden button if any of the buttons are not being displayed.
    const visibleButtonArray = [
      this.props.featureActionButtonProps.isQuantityChangeVisible,
      this.props.featureActionButtonProps.isPriceChangeVisible,
      this.props.featureActionButtonProps.isItemDiscountVisible,
      this.props.featureActionButtonProps.isMarkGiftReceiptItemVisible,
      this.props.featureActionButtonProps.isMarkItemTaxOverrideVisible,
      this.props.featureActionButtonProps.isAssignSalespersonItemVisible,
      this.props.featureActionButtonProps.isMarkCommentItemVisible,
      this.props.featureActionButtonProps.isVoidItemVisible
    ];
    return !!(visibleButtonArray.length % 3);

  }

  private disableItemDiscount(): boolean {
   return this.props.isReturnWithTransactionItem || this.props.isOfflineReturnItem ||
        !this.props.featureActionButtonProps.isItemDiscountEnabled;
  }

  private disableSalesperson(): boolean {
    return this.props.isReturnWithTransactionItem || this.props.isOfflineReturnItem ||
        !this.props.featureActionButtonProps.isAssignSalespersonItemEnabled;
  }

  private disableComments(): boolean {
    return this.props.isReturnWithTransactionItem || this.props.isOfflineReturnItem ||
        !this.props.featureActionButtonProps.isCommentItemEnabled;
  }

  private disableItemSubscription(): boolean {
    return this.props.isReturnWithTransactionItem || this.props.isReturn ||
        !this.props.isEligibleForSubscription || !this.props.featureActionButtonProps.isItemSubscriptionEnabled;
  }

  private taxButton = (): JSX.Element => {
    return (
      (this.props.featureActionButtonProps.isMarkItemTaxOverrideVisible ||
        this.props.featureActionButtonProps.isItemTaxExemptVisible) &&
       <ActionButton style={this.styles.btnAction}
                     icon={{icon: "TaxExempt", size: this.styles.btnActionIcon.fontSize}}
                     title={I18n.t("tax")}
                     titleStyle={this.styles.btnActionText}
                     onPress={this.props.onTaxPress}
                     disabled={this.props.isReturnWithTransactionItem ||
                        this.props.isTenderLineAvailable ||
                        !(this.props.featureActionButtonProps.isItemTaxOverrideEnabled ||
                        this.props.featureActionButtonProps.isItemTaxExemptEnabled)}
                     allowTextWrap={true}
       />
    );
  }

  private itemSubscriptionButton = (): JSX.Element => {
    return (
        this.props.featureActionButtonProps.isItemSubscriptionVisible &&
        <ActionButton style={this.styles.btnAction}
                      icon={{icon: "Subscription", size: this.styles.btnActionIcon.fontSize}}
                      title={I18n.t("subscription")}
                      titleStyle={this.styles.btnActionText}
                      onPress={this.props.onItemSubscription}
                      disabled={this.disableItemSubscription()}
                      allowTextWrap={true}
        />
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    featureActionButtonProps: state.uiState.featureActionButtonProps,
    stateValues: state.businessState.stateValues
  };
};

export default connect(mapStateToProps)(ProductActionPanel);
