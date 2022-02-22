import * as React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IDisplayInfo } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import { printAmount } from "../common/utilities";
import { ShippingMethod } from "./ShippingMethodScreen";
import { shippingMethodsStyles } from "./styles";
import VectorIcon from "../common/VectorIcon";

interface Props {
  displayInfo: IDisplayInfo;
  settings: SettingsState;
  currency: string;
  onAccept: () => void;
  setShippingMethod: (shippingMethod: ShippingMethod) => void;
  onCancel: () => void;
  shippingMethodList: ShippingMethod[];
  shippingMethodName: string;
  onBack: () => void;
}

export default class ShppingMethod extends React.Component<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(shippingMethodsStyles());
  }

  public renderResultTile(): JSX.Element {
    return (
      <View style={this.styles.resultHeader}>
        <Text style={this.styles.resultHeaderText}>{"Method"}</Text>
      </View>
    );
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <Header
          isVisibleTablet={true}
          title={I18n.t("delivery")}
          backButton={{ name: "Back", action: this.props.onBack }}
          rightButton={{
            title: I18n.t("continue"),
            action: () => { this.onContinue(); }
          }}
        />
        {this.renderResultTile()}
        {
          <View style={this.styles.optionsRoot}>
            <FlatList
              data={this.props.shippingMethodList}
              renderItem={this.renderShippingMethods}
              keyExtractor={this.keyExtractor}
              extraData={this.props.shippingMethodName}
            />
          </View>
        }
      </BaseView>
    );
  }

  private onContinue(): void {
    if (this.props.shippingMethodName) {
      this.props.onAccept();
    }
  }

  private renderAmount(amount: Money): JSX.Element {
    return (
      <Text style={this.styles.detailsText} adjustsFontSizeToFit numberOfLines={1}>
        {printAmount(amount)}
      </Text>
    );
  }

  private keyExtractor = (item: ShippingMethod, index: number): string => index.toString();

  private renderShippingMethods = ({ item }: { item: ShippingMethod }): JSX.Element => {
    return (
      <TouchableOpacity
        style={this.styles.shippingMethodChoiceButton}
        onPress={() => this.props.setShippingMethod(item)}
      >
        <View>
          <View style={this.styles.row}>
            <Text style={this.styles.shippingMethodChoiceButtonText}>
              {item.shippingFee.amount === ''
              || item.shippingFee.amount === '0'
              || item.shippingFee.amount === '0.00' ? 'Free' : (item.shippingFee.amount && this.props.currency) &&
              this.renderAmount(new Money(item.shippingFee.amount, this.props.currency))}</Text>
          </View>
          {item.displayName && <Text style={this.styles.normalText}>
            {I18n.t(item.displayName.i18nCode, { defaultValue: item.displayName.default })}</Text>}
          {item.description && <Text style={this.styles.normalText}>
            {I18n.t(item.description.i18nCode, { defaultValue: item.description.default })}</Text>}
        </View>
        {
          item.displayName &&
          this.props.shippingMethodName === I18n.t(item.displayName.i18nCode,
            { defaultValue: item.displayName.default }) &&
          <VectorIcon
            name="Checkmark"
            fill={this.styles.shippingMethodChoiceText.color}
            height={this.styles.checkIcon.fontSize}
          />
        }
      </TouchableOpacity>
    );
  }

}

