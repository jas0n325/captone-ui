import * as React from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";
import { ILoyaltyRewardReason } from "@aptos-scp/scp-component-store-selling-features";

import Theme from "../../styles";
import { loyaltyRedemptionStyles } from "./styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions, renderNumber } from "./utilities";
import VectorIcon from "./VectorIcon";

export interface Props {
  allowVoid: boolean;
  style?: ViewStyle;
  redemption: ILoyaltyRewardReason;
  onSelect?: () => void;
  onVoid?: () => void;
}

export interface State {}

export default class LoyaltyRedemption extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(loyaltyRedemptionStyles());
  }

  public render(): JSX.Element {
    if (!this.props.allowVoid) {
      return (
        <TouchableOpacity style={this.styles.mainPanel} onPress={this.props.onSelect}>
          {this.getDetails()}
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={[this.styles.mainPanel, this.props.allowVoid ? this.styles.voidablePanel : {}]}>
          {this.getDetails()}
        </View>
      );
    }
  }

  private getDetails(): JSX.Element {
    return (
      <View style={[this.styles.root, this.props.allowVoid ? this.styles.roundedBorder :
          this.styles.bottomBorder, this.props.style ? this.props.style : {}]}>
        <View style={this.styles.textPanel}>
          <Text style={this.styles.amountText}>
            {new Money(this.props.redemption.rewardAmount).toLocaleString
              (getStoreLocale(), getStoreLocaleCurrencyOptions())}
          </Text>
          <Text style={this.styles.descriptionText}>{this.props.redemption.description}</Text>
        </View>
        <View style={[this.styles.amountPanel, this.props.allowVoid ? this.styles.voidable : {}]}>
          <Text style={[this.styles.amountText, this.styles.tar]}>
            {renderNumber(this.props.redemption.pointsToDeduct)}
          </Text>
          {this.props.allowVoid &&
          <TouchableOpacity style={this.styles.voidIcon} onPress={this.props.onVoid}>
            <VectorIcon
              name="Clear"
              height={this.styles.icon.fontSize}
              width={this.styles.icon.fontSize}
              fill={this.styles.icon.color}
              stroke={this.styles.icon.color}
            />
          </TouchableOpacity>
          }
        </View>
      </View>
    );
  }
}
