import * as React from "react";
import { ImageURISource, Text, View } from "react-native";
import { connect } from "react-redux";
import { Field, formValueSelector } from "redux-form";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { IItemDisplayLine, ISubscriptionInfo } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, sceneTitle } from "../../actions";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import { AspectPreservedImage } from "../common/AspectPreservedImage";
import {
  renderNumericInputField,
  renderOptionsSelect,
  RenderSelectOptions,
  renderSwitch
} from "../common/FieldValidation";
import {
  establishImageSourceToRender,
  getItemAttributeDisplayOrderConfig,
  getItemAttributesOrder,
  printAmount
} from "../common/utilities";
import { NavigationProp } from "../StackNavigatorParams";
import { getFrequencyFieldName, getQuantityFieldName, getSubscribedFieldName } from "./constants";
import { subscribableItemLineStyle } from "./styles";

interface StateProps {
  subscription: ISubscriptionInfo;
  configManager: IConfigurationManager;
  retailLocationLocale: string;
}

interface DispatchProps {
  sceneTitle: ActionCreator;
}

interface Props extends StateProps, DispatchProps {
  line: IItemDisplayLine;
  onSubscriptionChange: (subscribe: boolean) => void;
  onOptionChosen: (chosenOption: RenderSelectOptions) => void;
  onClose: () => void;
  isValid: boolean;
  currentFrequency: RenderSelectOptions;
  isCheckout: boolean;
  frequencyList: RenderSelectOptions[];
  navigation: NavigationProp;
}

class SubscribableItemLine extends React.Component<Props> {
  private styles: any;
  private readonly itemAttributesDisplayOrder: Set<string>;

  constructor(props: Props) {
    super(props);

    this.itemAttributesDisplayOrder = getItemAttributeDisplayOrderConfig(this.props.configManager);
    this.styles = Theme.getStyles(subscribableItemLineStyle(props.isCheckout));
  }

  private get itemIdKey(): string {
    const itemIdKeyType = this.props.line?.itemIdKeyType?.toLowerCase();
    return `${I18n.t(itemIdKeyType, {defaultValue: itemIdKeyType})}: ${this.props.line.itemIdKey}`;
  }

  private get subscriptionDiscount(): number {
    // TODO: Add subscription discount functionality in DSS-10355
    return 0;
  }

  public render(): React.ReactNode {
    const itemAttributesDisplayOrder = (this.itemAttributesDisplayOrder) ? [...this.itemAttributesDisplayOrder] : [];

    return (
      <View style={this.styles.item}>
        {
          (!Theme.isTablet || this.props.isCheckout) &&
          <>
            <View style={this.styles.detailRow}>
              { this.renderItemImage() }
              <View style={this.styles.detailArea}>
                <View style={this.styles.detailRow}>
                  <Text
                    style={[this.styles.fill, this.styles.itemDescription]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    { this.props.line.itemShortDescription }
                  </Text>
                </View>
                <View style={this.styles.detailRow}>
                  <Text style={[this.styles.fill, this.styles.itemDetailText]}>
                    { this.itemIdKey }
                  </Text>
                </View>
                <View style={this.styles.attributes}>
                  {
                    !!itemAttributesDisplayOrder.length &&
                    itemAttributesDisplayOrder.map((attribute: string) => this.getItemAttributes(
                      attribute,
                      this.props.line,
                      [this.styles.fill, this.styles.itemDetailText]
                    ))
                  }
                </View>
              </View>
            </View>
            <View style={this.styles.quantityPriceRow}>
              <View style={this.styles.quantity}>
                <Text style={this.styles.quantityText}>
                  { this.props.line.quantity }
                </Text>
              </View>
              <View style={this.styles.price}>
                <Text
                  style={[
                    this.styles.originalPrice,
                    !!this.subscriptionDiscount && this.styles.lineThroughOriginalPrice
                  ]}
                >
                  { printAmount(this.props.line.unitPriceExcludingTransactionDiscounts.amount) }
                </Text>
              </View>
            </View>
          </>
        }
        <View style={this.styles.subscribe}>
          <View style={this.styles.subscribeMessage}>
            <Field
              name={getSubscribedFieldName(this.props.line.lineNumber)}
              component={renderSwitch}
              onValueChange={this.handleSubscriptionToggle.bind(this)}
              currentValue={this.props.subscription?.subscribed}
              scene="itemSubscription"
              style={this.styles.switchPanel}
              switchText={I18n.t("subscribe")}
            />
            <Field
              name={getQuantityFieldName(this.props.line.lineNumber)}
              component={renderNumericInputField}
              style={this.styles.inputContainer}
              border={this.styles.inputTextPanel}
              inputStyle={this.styles.input}
              errorStyle={this.styles.inputError}
              persistPlaceholderStyle={this.styles.persistPlaceholderStyle}
              placeholder={I18n.t("subscriptionQty")}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (!this.props.subscription?.subscribed && this.props.isValid) {
                  this.props.onSubscriptionChange(true);
                }
              }}
              precision={0}
              persistPlaceholder
              trimLeadingZeroes
            />
            <Field
              name={getFrequencyFieldName(this.props.line.lineNumber)}
              component={renderOptionsSelect}
              placeholder={I18n.t("frequency")}
              onOptionChosen={this.props.onOptionChosen}
              selectedOption={this.props.currentFrequency}
              options={this.props.frequencyList}
              scene={"frequency"}
              disabled={false}
              errorStyle={this.styles.inputError}
            />
          </View>
        </View>
      </View>
    );
  }

  private handleSubscriptionToggle(newValue: boolean): void {
    if (newValue) {
      this.props.sceneTitle("reasonCodeList", "frequency");
      this.props.navigation.push("reasonCodeList", {
        options: this.props.frequencyList,
        onOptionChosen: this.props.onOptionChosen,
        onClose: this.props.onClose,
        currentSelectedOption: this.props.currentFrequency,
        multiSelect: false
      });
    }
    this.props.onSubscriptionChange(newValue);
  }

  private renderItemImage(): React.ReactNode {
    const itemImageSource: ImageURISource = establishImageSourceToRender(
      this.props.configManager,
      this.styles.imageSize.width,
      this.styles.imageSize.height,
      this.props.line.itemImageUrl
    );

    return itemImageSource && (
      <View style={this.styles.imageArea}>
        <AspectPreservedImage
          defaultSource={undefined}
          defaultSourceWidth={this.styles.imageSize.width}
          defaultSourceHeight={this.styles.imageSize.height}
          desiredSource={itemImageSource}
          rowWidth={this.styles.imageSize.width}
          rowHeight={this.styles.imageSize.height}
        />
      </View>
    ) || null;
  }

  private getItemAttributes(attribute: string, line: IItemDisplayLine, styles: any): JSX.Element {
    const getItemAttributesOrders = getItemAttributesOrder(attribute, line, this.props.retailLocationLocale);

    return getItemAttributesOrders.attributes && (
      <Text style={styles} numberOfLines={1} ellipsizeMode={"tail"}>
        {`${getItemAttributesOrders.attributename}: ${getItemAttributesOrders.attributes}`}
      </Text>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: Props): StateProps => {
  const selector = formValueSelector("itemSubscriptionForm");
  const subscription = selector(state, "subscriptions")?.find((subscriptionInfo: ISubscriptionInfo) => {
    return subscriptionInfo.lineNumber === ownProps.line.lineNumber;
  });

  return {
    subscription,
    configManager: state.settings.configurationManager,
    retailLocationLocale: state.settings.primaryLanguage
  };
};

const mapDispatchToProps: DispatchProps = {
  sceneTitle: sceneTitle.request
};

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(SubscribableItemLine);
