import * as React from "react";
import { FlatList, Text, View } from "react-native";

import { ILoyaltyRewardReason } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import LoyaltyRedemption from "./LoyaltyRedemption";
import { loyaltyRedemptionStyles } from "./styles";


interface Props {
  preventScroll?: boolean;
  style?: any;
  loyaltyPlan?: string;
  allowVoid: boolean;
  loyaltyRedemptions: ILoyaltyRewardReason[];
  onSelect?: (redemption: ILoyaltyRewardReason) => void;
  onVoid?: (redemption: ILoyaltyRewardReason) => void;
}

interface State {}

export default class LoyaltyRedemptionList extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(loyaltyRedemptionStyles());
  }

  public render(): JSX.Element {
    return (
      <View style={[this.styles.listArea, this.props.style || {} ]}>
        {this.props.loyaltyPlan &&
        <View style={ this.styles.subtitleArea}>
          <Text style={this.styles.subtitleText}>
            {`${I18n.t("redeemed")}: ${this.props.loyaltyPlan}`}
          </Text>
        </View>
        }
        {this.props.preventScroll && this.props.loyaltyRedemptions.map((redemption) =>
            <LoyaltyRedemption
                allowVoid={this.props.allowVoid}
                redemption={redemption}
                onSelect={() => this.props.onSelect(redemption)}
                onVoid={() => this.props.allowVoid ? this.props.onVoid(redemption) : undefined}
            />
        )}
        {!this.props.preventScroll &&
          <FlatList
              data={this.props.loyaltyRedemptions}
              renderItem={({ item }) =>
                  <LoyaltyRedemption
                      allowVoid={this.props.allowVoid}
                      redemption={item}
                      onSelect={() => this.props.onSelect(item)}
                      onVoid={() => this.props.allowVoid ? this.props.onVoid(item) : undefined}
                  />
              }
              keyExtractor={(item) => `${item.loyaltyPlanKey}_${item.reasonTypeKey}` }
          />
        }
      </View>
    );
  }
}
