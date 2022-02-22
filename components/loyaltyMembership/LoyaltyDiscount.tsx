import * as React from "react";
import {Alert, ScrollView, Text, TouchableOpacity, View} from "react-native";

import {
  Customer,
  ICustomerLoyaltyMembership,
  ILoyaltyRewardReason
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ISelectedRedemptions } from "../../reducers";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import Theme from "../../styles";
import FeedbackNote from "../common/FeedbackNote";
import Header from "../common/Header";
import LoyaltyRedemptionList from "../common/LoyaltyRedemptionList";
import { renderNumber } from "../common/utilities";
import VectorIcon from "../common/VectorIcon";
import { loyaltyDiscountStyle } from "./styles";

export interface Props {
  customer: Customer;
  loyaltyMembership: ICustomerLoyaltyMembership;
  availableRedemptions: ILoyaltyRewardReason[];
  selectedRedemptions: ISelectedRedemptions[];
  onChangePlan: (loyaltyPlanKey: string) => void;
  onSelectRedemption: (redemption: ILoyaltyRewardReason) => void;
  onVoidRedemption?: (redemption: ILoyaltyRewardReason) => void;
  onSave: () => void;
  onCancel: () => void;
}
export interface State {
}

export default class LoyaltyDiscount extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(loyaltyDiscountStyle());
  }

  public render(): JSX.Element {
    let remainingPoints = 0;
    if (this.props.loyaltyMembership) {
      const { availablePointBalance, loyaltyPlan } = this.props.loyaltyMembership;
      const loyaltyMembership = this.props.customer.loyaltyMemberships.find((membership) =>
          membership.loyaltyPlanKey === loyaltyPlan.loyaltyPlanKey);

      remainingPoints = loyaltyPlan.currentTransactionPointsAvailableImmediately ?
          availablePointBalance :
          loyaltyMembership.availablePointBalance;
      if (this.props.selectedRedemptions && this.props.selectedRedemptions.length > 0) {
        const selectedRedemptions = this.props.selectedRedemptions.find(
            (selected) => selected.loyaltyPlanKey === loyaltyPlan.loyaltyPlanKey);
        if (selectedRedemptions) {
          selectedRedemptions.redemptions.forEach((redemption) => {
            if (loyaltyPlan.loyaltyPlanKey === redemption.loyaltyPlanKey) {
              remainingPoints -= redemption.pointsToDeduct;
            }
          });
        }
      }
    }

    return (
      <View style={this.styles.root}>
        <Header
            title={I18n.t("loyalty")}
            backButton={{name: "Back", action: this.props.onCancel}}
            rightButton={{title: I18n.t("done"), action: () => this.props.onSave()}}
        />
        {this.props.loyaltyMembership &&
        <ScrollView style={this.styles.fill}>
          {!Theme.isTablet &&
          <View style={this.styles.memberPlan}>
            <Text style={this.styles.remainingPoints}>{I18n.t("remainingPoints")}</Text>
            <Text style={this.styles.remainingPoints}>
              {renderNumber(remainingPoints)}
            </Text>
          </View>
          }
          <TouchableOpacity
              style={[this.styles.memberPlan, this.styles.borderBottom]}
              onPress={() => this.props.onChangePlan(this.props.loyaltyMembership.loyaltyPlan.loyaltyPlanKey)}
          >
            <View style={this.styles.memberPlanText}>
              <Text style={this.styles.memberPlanTitleText}>{I18n.t("plan")}</Text>
              <Text style={this.styles.memberPlanNameText}>
                {this.props.loyaltyMembership.loyaltyPlan.description || this.props.loyaltyMembership.loyaltyPlan.name}
              </Text>
            </View>
            <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
            />
          </TouchableOpacity>
          {this.props.availableRedemptions && this.props.availableRedemptions.length > 0 &&
          <View style={this.styles.redemptions}>
            <LoyaltyRedemptionList
                allowVoid={false}
                loyaltyRedemptions={this.props.availableRedemptions}
                onSelect={(redemption) => {
                  if (redemption.pointsToDeduct <= remainingPoints) {
                    this.props.onSelectRedemption(redemption);
                  } else {
                    Alert.alert(I18n.t("insufficientRemainingPoints"), undefined,
                        [{ text: I18n.t("ok") }], { cancelable: true });
                  }
                }}
                />
          </View>
          }
          {!Theme.isTablet && this.props.selectedRedemptions && this.props.selectedRedemptions.length > 0 &&
          this.props.selectedRedemptions.map((selectedRedemption) =>
            <LoyaltyRedemptionList
                allowVoid={true}
                loyaltyPlan={selectedRedemption.loyaltyPlan}
                loyaltyRedemptions={selectedRedemption.redemptions}
                onVoid={(redemption) => this.props.onVoidRedemption(redemption)}
            />
          )
          }
          {!this.props.availableRedemptions || this.props.availableRedemptions.length === 0 &&
          <View style={this.styles.redemptions}>
            <FeedbackNote
                message={I18n.t("loyaltyMembershipsNoDiscounts")}
                messageType={FeedbackNoteType.Info}
                style={this.styles}
            />
          </View>
          }
          {Theme.isTablet &&
          <View style={this.styles.actions}>
            <TouchableOpacity
                style={[this.styles.btnPrimary, this.styles.button]}
                onPress={() => this.props.onSave()}
            >
              <Text style={this.styles.btnPrimaryText}>
                {I18n.t("done")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[this.styles.btnSeconday, this.styles.button]}
                onPress={() => this.props.onCancel()}
            >
              <Text style={this.styles.btnSecondayText}>
                {I18n.t("cancel")}
              </Text>
            </TouchableOpacity>
          </View>
          }
        </ScrollView>
        }
      </View>
    );
  }
}

