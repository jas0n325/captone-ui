import * as React from "react";
import { FlatList, Text, View } from "react-native";
import * as _ from "lodash";

import {
  ICustomerLoyaltyMembership,
  IDisplayBehavior,
  ILoyaltyMembershipActivity
} from "@aptos-scp/scp-component-store-selling-features";
import { IConfigurationManager, IConfigurationValues } from "@aptos-scp/scp-component-store-selling-core";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import LoyaltyMembership from "./LoyaltyMembership";
import { loyaltyMembershipListStyles } from "./styles";

interface Props {
  preventScroll?: boolean;
  style?: any;
  estimated: boolean;
  loyaltyActivities?: ILoyaltyMembershipActivity[];
  configuration?: IConfigurationManager;
  loyaltyMemberships?: ICustomerLoyaltyMembership[];
  displayLoyaltyBalancesWithoutRTP?: boolean;
}


export default class LoyaltyMembershipList extends React.Component<Props> {
  private styles: any;
  private displayBehavior: IDisplayBehavior;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(loyaltyMembershipListStyles());

    const customerConfig: IConfigurationValues = props.configuration && props.configuration.getCustomerValues();
    this.displayBehavior = customerConfig && _.get(customerConfig, "loyalty.displayBehavior");
  }

  public render(): JSX.Element {
    return (
      <View style={[this.styles.root, this.props.style || {} ]}>
        <View style={ this.styles.subtitleArea}>
          <Text style={this.styles.subtitleText}>{I18n.t("loyaltyCaps")}</Text>
        </View>
        {
          this.props.preventScroll &&
          (this.props.displayLoyaltyBalancesWithoutRTP ? this.props.loyaltyMemberships.map(this.renderCustomerMembership) :
              this.props.loyaltyActivities.map(this.renderLoyaltyActivity))
        }
        { !this.props.preventScroll && !this.props.displayLoyaltyBalancesWithoutRTP &&
          <FlatList
              data={this.props.loyaltyActivities}
              renderItem={({ item }) => this.renderLoyaltyActivity(item)}
              keyExtractor={(item) => item.loyaltyActivityId }
          />
        }
        {
          !this.props.preventScroll && this.props.displayLoyaltyBalancesWithoutRTP &&
          <FlatList
              data={this.props.loyaltyMemberships}
              renderItem={({ item }) => this.renderCustomerMembership(item)}
          />
        }
      </View>

    );
  }

  private renderLoyaltyActivity = (loyaltyActivity: ILoyaltyMembershipActivity) => {
    return (
      <LoyaltyMembership
        estimated={this.props.estimated}
        loyaltyActivityLine={loyaltyActivity}
        displayBehavior={this.displayBehavior}
        displayLoyaltyBalancesWithoutRTP={this.props.displayLoyaltyBalancesWithoutRTP}
      />
    );
  }
  private renderCustomerMembership = (customerMembership: ICustomerLoyaltyMembership) => {
    return (
      <LoyaltyMembership
        estimated={this.props.estimated}
        displayBehavior={this.displayBehavior}
        displayLoyaltyBalancesWithoutRTP={this.props.displayLoyaltyBalancesWithoutRTP}
        customerMembershipLine={customerMembership}
      />
    );
  }
}
