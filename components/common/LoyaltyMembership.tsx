import * as React from "react";
import { Text, View, ViewStyle } from "react-native";
import * as _ from "lodash";

import {
  getLoyaltyPointsValue,
  ICustomerLoyaltyMembership,
  IDisplayBehavior,
  ILoyaltyMembershipActivity,
  shouldShowLoyaltyField
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { loyaltyMembershipStyles } from "./styles";
import { renderNumber } from "./utilities";

export interface Props {
  estimated: boolean;
  loyaltyActivityLine?: ILoyaltyMembershipActivity;
  style?: ViewStyle;
  displayBehavior?: IDisplayBehavior;
  displayLoyaltyBalancesWithoutRTP?: boolean;
  customerMembershipLine?: ICustomerLoyaltyMembership;
}

export interface State {}

export default class LoyaltyMembership extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(loyaltyMembershipStyles());
  }

  public render(): JSX.Element {
    const loyaltyPlanDescription: string = this.props.displayLoyaltyBalancesWithoutRTP ? this.props.customerMembershipLine &&
        this.props.customerMembershipLine.loyaltyPlan && this.props.customerMembershipLine.loyaltyPlan.description ||
        this.props.customerMembershipLine.loyaltyPlan.name : this.props.loyaltyActivityLine.loyaltyPlanDescription();
    const membershipDescription: string = this.props.displayLoyaltyBalancesWithoutRTP ? this.props.customerMembershipLine &&
        this.props.customerMembershipLine.membershipType && this.props.customerMembershipLine.membershipType.description ||
        this.props.customerMembershipLine.membershipType.name : this.props.loyaltyActivityLine.membershipTypeDescription();
    return (
      <View style={[this.styles.root, this.props.style ? this.props.style : {}]}>
        <View style={this.styles.row}>
          <Text style={[this.styles.text, this.styles.textBold]}>{loyaltyPlanDescription}</Text>
        </View>
        <View style={this.styles.row}>
          <Text style={this.styles.text}>{membershipDescription}</Text>
        </View>
        { shouldShowLoyaltyField("showCurrentTransactionRegularPoints", this.props.displayBehavior) &&
          <View style={this.styles.row}>
            { this.renderDetailTitle("regularPointsEarned") }
            { this.renderDetailValue(getLoyaltyPointsValue("regularPointsEarned", this.props.displayLoyaltyBalancesWithoutRTP, this.props.loyaltyActivityLine, this.props.customerMembershipLine))}
          </View>
        }
        { shouldShowLoyaltyField("showCurrentTransactionConditionalPoints", this.props.displayBehavior) &&
          <View style={this.styles.row}>
            { this.renderDetailTitle("conditionalPointsEarned") }
            { this.renderDetailValue(getLoyaltyPointsValue("conditionalPointsEarned", this.props.displayLoyaltyBalancesWithoutRTP, this.props.loyaltyActivityLine, this.props.customerMembershipLine))}
          </View>
        }
        { shouldShowLoyaltyField("showCurrentTransactionTotalPoints", this.props.displayBehavior) &&
          <View style={this.styles.row}>
            { this.renderDetailTitle("totalPointsEarned", true) }
            { this.renderDetailValue(getLoyaltyPointsValue("totalPointsEarned", this.props.displayLoyaltyBalancesWithoutRTP, this.props.loyaltyActivityLine, this.props.customerMembershipLine), true)}
          </View>
        }
        { shouldShowLoyaltyField("showTotalBalance", this.props.displayBehavior) &&
          <View style={this.styles.row}>
            { this.renderDetailTitle(this.props.estimated ? "estimatedPointBalance" : "pointBalance")}
            { this.renderDetailValue(getLoyaltyPointsValue(this.props.estimated ? "estimatedPointBalance" : "pointBalance", this.props.displayLoyaltyBalancesWithoutRTP, this.props.loyaltyActivityLine,
                this.props.customerMembershipLine))}
          </View>
        }
        { shouldShowLoyaltyField("showAvailableBalance", this.props.displayBehavior) &&
          <View style={[this.styles.row, this.styles.extraPadding]}>
            { this.renderDetailTitle(this.props.estimated ? "estimatedAvailableBalance" : "availableBalance")}
            { this.renderDetailValue(getLoyaltyPointsValue(this.props.estimated ? "estimatedAvailableBalance" : "availableBalance", this.props.displayLoyaltyBalancesWithoutRTP, this.props.loyaltyActivityLine,
                this.props.customerMembershipLine))}
          </View>
        }
      </View>
    );
  }

  private renderDetailTitle(textToTranslate: string, bold?: boolean): JSX.Element {
    return (
      <Text style={[this.styles.text, bold ? this.styles.textBold : {}]} adjustsFontSizeToFit numberOfLines={1}>
        { I18n.t(textToTranslate)}
      </Text>
    );
  }

  private renderDetailValue(amount: number, bold?: boolean): JSX.Element {
    return (
      <Text style={[this.styles.value, bold ? this.styles.textBold : {}]}
            adjustsFontSizeToFit numberOfLines={1}>
        { renderNumber(amount) }
      </Text>
    );
  }

}
