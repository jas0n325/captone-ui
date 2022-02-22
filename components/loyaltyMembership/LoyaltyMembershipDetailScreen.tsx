import _ from "lodash";
import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { ICustomerLoyaltyMembership } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, sceneTitle} from "../../actions";
import { AppState, BusinessState, SettingsState} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { RenderSelectOptions } from "../common/FieldValidation";
import Header from "../common/Header";
import MembershipStatusIndicator from "../common/MembershipStatusIndicator";
import SectionLine from "../common/SectionLine";
import { getDisplayableDateOnly } from "../common/utilities";
import VectorIcon from "../common/VectorIcon";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { LoyaltyMembershipDetailScreenProps } from "./interfaces";
import { loyaltyMembershipDisplayStyle } from "./styles";

interface StateProps {
  settings: SettingsState;
  businessState: BusinessState;
}

interface DispatchProps {
  sceneTitle: ActionCreator;
}

interface Props extends LoyaltyMembershipDetailScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"loyaltyMembershipDetails"> {}

interface State {
  selectedOption: RenderSelectOptions;
  selectedLoyaltyMembership: ICustomerLoyaltyMembership;
}

class LoyaltyMembershipDetailScreen extends React.Component<Props, State> {
    private styles: any;
    private loyaltyMemberships: RenderSelectOptions[];

    constructor(props: Props) {
      super(props);

      this.styles = Theme.getStyles(loyaltyMembershipDisplayStyle());

      this.loyaltyMemberships = this.props.loyaltyMemberships.map((value) => {
        return {
          code: value.loyaltyPlan.loyaltyPlanKey,
          description: value.loyaltyPlan.description || value.loyaltyPlan.name

        };
      });

      const selectedOption = this.loyaltyMemberships.find((option) => option.code === this.props.loyaltyPlanKey);
      const selectedLoyaltyMembership = this.props.loyaltyMemberships.find(
          (value) => value.loyaltyPlanKey === this.props.loyaltyPlanKey);

      this.state = {
        selectedOption,
        selectedLoyaltyMembership
      };
    }

    public render(): JSX.Element {
      const loyaltyMembership = this.state.selectedLoyaltyMembership;
      const planName = _.get(loyaltyMembership, "loyaltyPlan.description") ||
          _.get(loyaltyMembership, "loyaltyPlan.name");
      return (
        <BaseView style={this.styles.fill}>
          <Header
            isVisibleTablet={Theme.isTablet}
            title={I18n.t("loyalty")}
            backButton={{
              title: Theme.isTablet && I18n.t("customerProfile"),
              name: "Back",
              action: this.pop
            }}
            rightButton={this.props.displayLoyaltyEnrollButton && {
              title: I18n.t("add"),
              action: this.pushLoyaltyEnrollment
            }}
          />
          <KeyboardAwareScrollView style={this.styles.root}>

            {/*Loyalty plan name/selector display*/}
            <View style={this.styles}>
              <View style={this.styles.membershipViewCommon}>
                <Text style={this.styles.smallText} >{I18n.t("plan")}</Text>
              </View>
              <TouchableOpacity
                  style={this.styles.membershipMain}
                  onPress={() => {
                    this.props.sceneTitle("reasonCodeList", "loyaltyPlans");
                    this.props.navigation.push("reasonCodeList", {
                      currentSelectedOption: this.state.selectedOption,
                      options: this.loyaltyMemberships,
                      onOptionChosen: this.changeLoyaltyMembershipDetail.bind(this)
                    });
                  }}
              >
                <View style={this.styles.membershipHeader}>
                  <SectionLine styles={this.styles.membershipViewTitle} >{planName}</SectionLine>
                    <VectorIcon
                        name="Forward"
                        stroke={this.styles.chevronIcon.color}
                        height={this.styles.chevronIcon.height}
                        width={this.styles.chevronIcon.width}
                    />
                </View>
              </TouchableOpacity>
            </View>

            { /*membership display */}
            <View style={this.styles.membershipViewStatus}>
              <SectionLine styles={this.styles}>
                {_.get(loyaltyMembership, "membershipType.description")}
              </SectionLine>
              <MembershipStatusIndicator
                membershipStatusKey={(_.get(loyaltyMembership, "membershipStatus.membershipStatusKey"))}
                membershipDescription={_.get(loyaltyMembership, "membershipStatus.description")} >
              </MembershipStatusIndicator>
            </View>

            {/* Points */}
            <View style={this.styles.membershipViewPoints}>
              <View style={this.styles.membershipViewAvailablePointsContainer}>
                <View style={this.styles.membershipViewAvailablePoints}>
                  <Text style={this.styles.mainText} >{I18n.t("availablePoints")}</Text>
                  <Text style={this.styles.availablePointsAmountText} >
                    {_.get(loyaltyMembership, "availablePointBalance")}
                  </Text>
                </View>
              </View>
              <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <View style={this.styles.membershipViewPendingAndTotalPoints}>
                  <View style={this.styles.membershipViewSecondaryPoints}>
                    <Text style={this.styles.secondaryGrayText} >{I18n.t("pending")}</Text>
                    <Text style={this.styles.secondaryBlackText} >
                      {_.get(loyaltyMembership, "pendingPointBalance")}
                    </Text>
                  </View>

                  <View style={this.styles.viewVerticalSeparator} />

                  <View style={this.styles.membershipViewSecondaryPoints}>
                    <Text style={this.styles.secondaryGrayText} >{I18n.t("total")}</Text>
                    <Text style={this.styles.secondaryBlackText} >
                      { this.getTotalPointsBalance() }
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={this.styles.membershipViewExpiredPoints}>
              <Text style={this.styles.smallText} >{I18n.t("lastPointsExpired")}</Text>
              <Text style={this.styles.smallBoldText} >
                {_.get(loyaltyMembership, "lastNumberOfPointsExpired")}
              </Text>
              <Text style={this.styles.smallBoldText} >
                { this.getFormattedDate(_.get( loyaltyMembership, "lastDatePointsExpired"), true)}
              </Text>
            </View>

            {/* Points dates */}
            <View style={this.styles.membershipViewPointsDatesWithBorder}>
              <Text style={this.styles.secondaryGrayLeftText} >{I18n.t("membserhipExpires")}</Text>
              <Text style={this.styles.secondaryBlackLeftText} >
                { this.getFormattedDate(_.get(loyaltyMembership, "terminationDate"))}
              </Text>
            </View>

            <View style={this.styles.membershipViewPointsDatesWithBorder}>
              <Text style={this.styles.secondaryGrayLeftText} >{I18n.t("joined")}</Text>
              <Text style={this.styles.secondaryBlackLeftText} >
                { this.getFormattedDate(_.get(loyaltyMembership, "joinDate"))}
              </Text>
            </View>

            <View style={this.styles.membershipViewPointsDatesWithBorder}>
              <Text style={this.styles.secondaryGrayLeftText} >{I18n.t("lastRenewal")}</Text>
              <Text style={this.styles.secondaryBlackLeftText} >
                { this.getFormattedDate(_.get(loyaltyMembership, "lastRenewalDate"))}
              </Text>
            </View>

            <View style={this.styles.membershipViewPointsDatesNoBorder}>
              <Text style={this.styles.secondaryGrayLeftText} >{I18n.t("lastActivity")}</Text>
              <Text style={this.styles.secondaryBlackLeftText} >
                { this.getFormattedDate(_.get(loyaltyMembership, "lastActivityDate"))}
              </Text>
            </View>

          </KeyboardAwareScrollView>
        </BaseView>
      );
    }

    private getFormattedDate(theDate: string, addParentheses?: boolean): string {
      return !theDate ? " " : addParentheses ? `(${getDisplayableDateOnly(theDate)})` : getDisplayableDateOnly(theDate);
    }

    private changeLoyaltyMembershipDetail(selectedOption: RenderSelectOptions): void {
      const loyaltyMembership = this.props.loyaltyMemberships.find(
          (value) => value.loyaltyPlanKey === selectedOption.code);
      this.setState({
        selectedOption,
        selectedLoyaltyMembership: loyaltyMembership
      });
    }

    private getTotalPointsBalance(): string {
      const loyaltyMembership = this.state.selectedLoyaltyMembership;

      return (( !loyaltyMembership.pendingPointBalance ? 0 : loyaltyMembership.pendingPointBalance )
        + (!loyaltyMembership.postedPointBalance ? 0 : loyaltyMembership.postedPointBalance)).toString();
    }

    private pop = () => {
      this.props.navigation.pop();
    }

    private pushLoyaltyEnrollment = () => {
      this.props.navigation.push("loyaltyEnrollment", {
        customer: this.props.customer,
        onSave: this.props.onLoyaltyEnrollment,
        returnToCustomerScene: this.props.returnToCustomerScene,
        emailAddress: this.props.customerEmailAddress
      });
    }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings,
    businessState: state.businessState
  };
}
export default connect<StateProps, DispatchProps, NavigationScreenProps<"loyaltyMembershipDetails">>(mapStateToProps, {
  sceneTitle: sceneTitle.request
})(withMappedNavigationParams<typeof LoyaltyMembershipDetailScreen>()(LoyaltyMembershipDetailScreen));
