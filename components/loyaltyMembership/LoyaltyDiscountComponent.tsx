import _ from "lodash";
import * as React from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  ICustomerLoyaltyMembership,
  ILoyaltyRewardReason,
  LoyaltyPlanPoints,
  LOYALTY_DISCOUNT_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  addRedemption,
  businessOperation,
  calculateLoyaltyMembership,
  changeLoyaltyMembership,
  removeRedemption,
  sceneTitle
} from "../../actions";
import {
  AppState,
  BusinessState,
  ISelectedRedemptions,
  SettingsState
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { RenderSelectOptions } from "../common/FieldValidation";
import { warnBeforeLosingChanges } from "../common/utilities";
import { NavigationProp } from "../StackNavigatorParams";
import { LoyaltyDiscountComponentProps } from "./interfaces";
import LoyaltyDiscount from "./LoyaltyDiscount";
import { loyaltyDiscountStyle } from "./styles";

interface StateProps {
  businessState: BusinessState;
  loyaltyInProgress: boolean;
  loyaltyError: Error;
  loyaltyMemberships: ICustomerLoyaltyMembership[];
  selectedLoyaltyMembership: ICustomerLoyaltyMembership;
  appliedRedemptions: ILoyaltyRewardReason[];
  availableRedemptions: ILoyaltyRewardReason[];
  selectedRedemptions: ISelectedRedemptions[];
  settings: SettingsState;
}

interface DispatchProps {
  addRedemption: ActionCreator;
  removeRedemption: ActionCreator;
  calculateLoyaltyMembership: ActionCreator;
  changeLoyaltyMembership: ActionCreator;
  performBusinessOperation: ActionCreator;
  sceneTitle: ActionCreator;
}

interface Props
  extends DispatchProps,
    StateProps,
    LoyaltyDiscountComponentProps {
  navigation: NavigationProp;
}

interface State {
  appliedRedemptions: ILoyaltyRewardReason[];
}

class LoyaltyDiscountComponent extends React.PureComponent<Props, State> {
  private loyaltyMembershipOptions: RenderSelectOptions[];
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(loyaltyDiscountStyle());

    this.state = {
      appliedRedemptions:
        props.businessState.displayInfo.transactionDiscountDisplayLines
          .filter((discountLine) => discountLine.isLoyaltyDiscount)
          .map((discountLine) => {
            return {
              loyaltyPlanKey: discountLine.loyaltyPlanKey,
              reasonTypeKey: discountLine.redemptionCode
            };
          })
    };
  }

  public componentDidMount(): void {
    this.props.calculateLoyaltyMembership(
      this.props.settings.deviceIdentity,
      [],
      this.state.appliedRedemptions
    );
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.loyaltyInProgress && !this.props.loyaltyInProgress) {
      if (
        !this.props.loyaltyError &&
        this.props.loyaltyMemberships &&
        this.props.loyaltyMemberships.length > 0
      ) {
        this.loyaltyMembershipOptions = this.props.loyaltyMemberships.map(
          (value) => {
            return {
              code: value.loyaltyPlan.loyaltyPlanKey,
              description:
                value.loyaltyPlan.description || value.loyaltyPlan.name
            };
          }
        );
      } else {
        setTimeout(
          () =>
            Alert.alert(
              I18n.t(
                this.props.loyaltyError
                  ? "loyaltyMembershipApiError"
                  : "loyaltyMembershipsNoRedemptions"
              ),
              undefined,
              [{ text: I18n.t("close"), onPress: () => this.props.onCancel() }],
              { cancelable: true }
            ),
          500
        );
      }
    }

    if (
      !_.isEqual(
        prevProps.businessState.displayInfo.transactionDiscountDisplayLines,
        this.props.businessState.displayInfo.transactionDiscountDisplayLines
      )
    ) {
      this.props.onCancel();
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <LoyaltyDiscount
          customer={this.props.businessState.stateValues.get(
            "transaction.customer"
          )}
          loyaltyMembership={this.props.selectedLoyaltyMembership}
          availableRedemptions={this.props.availableRedemptions}
          selectedRedemptions={this.props.selectedRedemptions}
          onChangePlan={this.onPlanChange.bind(this)}
          onSelectRedemption={this.onSelectRedemption.bind(this)}
          onVoidRedemption={this.onVoidRedemption.bind(this)}
          onSave={this.onSave.bind(this)}
          onCancel={() =>
            warnBeforeLosingChanges(
              this.hasChange(this.props.appliedRedemptions),
              () => this.props.onCancel()
            )
          }
        />
      </BaseView>
    );
  }

  private hasChange(redemptions: ILoyaltyRewardReason[]): boolean {
    return !_.isEqual(
      redemptions.map((redemption) => {
        const { loyaltyPlanKey, reasonTypeKey } = redemption;
        return { loyaltyPlanKey, reasonTypeKey };
      }),
      this.state.appliedRedemptions
    );
  }

  private onPlanChange(loyaltyPlanKey: string): void {
    this.props.sceneTitle("reasonCodeList", "loyaltyPlans");
    this.props.navigation.push("reasonCodeList", {
      currentSelectedOption: this.loyaltyMembershipOptions.find(
        (option) => option.code === loyaltyPlanKey
      ),
      options: this.loyaltyMembershipOptions,
      onOptionChosen: this.changeLoyaltyMembership.bind(this)
    });
  }

  private changeLoyaltyMembership(selectedOption: RenderSelectOptions): void {
    this.props.changeLoyaltyMembership(selectedOption.code);
  }

  private onSelectRedemption(redemption: ILoyaltyRewardReason): void {
    const { stateValues } = this.props.businessState;
    const returnSubTotal: Money = stateValues.get("transaction.returnSubTotal");
    const transactionSubTotal: Money = stateValues.get("transaction.subTotal");

    let transactionAmount = returnSubTotal
      ? transactionSubTotal.minus(returnSubTotal)
      : transactionSubTotal;
    this.props.businessState.displayInfo.transactionDiscountDisplayLines
      .filter((discountLine) => discountLine.isLoyaltyDiscount)
      .forEach((discountLine) => {
        transactionAmount = transactionAmount.plus(discountLine.amount);
      });

    let remainingTransactionAmount = new Money(
      transactionAmount.amount,
      transactionAmount.currency
    );
    this.props.appliedRedemptions.forEach((appliedRedemption) => {
      remainingTransactionAmount = remainingTransactionAmount.minus(
        new Money(appliedRedemption.rewardAmount)
      );
    });

    if (
      remainingTransactionAmount.gt(new Money("0", transactionAmount.currency))
    ) {
      const rewardAmount = new Money(redemption.rewardAmount);
      const isLosingPoints = rewardAmount.gt(remainingTransactionAmount);

      Alert.alert(
        !isLosingPoints
          ? I18n.t("redeemRedemption")
          : I18n.t("redeemRedemptionLosingPoint"),
        undefined,
        [
          { text: I18n.t("cancel"), style: "cancel" },
          {
            text: I18n.t("apply"),
            onPress: () => this.props.addRedemption(redemption)
          }
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert(
        I18n.t("balanceDueDiscountNotAllowed"),
        undefined,
        [{ text: I18n.t("close"), style: "cancel" }],
        { cancelable: true }
      );
    }
  }

  private onVoidRedemption(redemption: ILoyaltyRewardReason): void {
    this.props.removeRedemption(redemption);
  }

  private onSave(): void {
    const redemptions: ILoyaltyRewardReason[] = [];
    const loyaltyPlans: string[] = [];
    const discountLines =
      this.props.businessState.displayInfo.transactionDiscountDisplayLines.filter(
        (discountLine) => discountLine.isLoyaltyDiscount
      );
    const discounts: number[] = [];
    this.props.appliedRedemptions.forEach((redemption) => {
      const { loyaltyPlanKey, reasonTypeKey } = redemption;
      const discountLine = discountLines.find(
        (line) =>
          line.loyaltyPlanKey === loyaltyPlanKey &&
          line.reasonCode === reasonTypeKey &&
          discounts.indexOf(line.lineNumber) === -1
      );
      if (discountLine) {
        redemptions.push({
          loyaltyPlanKey,
          reasonTypeKey,
          requestId: discountLine.lineNumber
        });
        discounts.push(discountLine.lineNumber);
      } else {
        redemptions.push({ loyaltyPlanKey, reasonTypeKey });
      }

      if (loyaltyPlans.indexOf(loyaltyPlanKey) === -1) {
        loyaltyPlans.push(loyaltyPlanKey);
      }
    });

    if (this.hasChange(redemptions)) {
      const customer = this.props.businessState.stateValues.get(
        "transaction.customer"
      );
      const loyaltyPlanPoints: LoyaltyPlanPoints[] = [];
      loyaltyPlans.forEach((loyaltyPlanKey: string) => {
        const loyaltyMembership = this.props.loyaltyMemberships.find(
          (l) => l.loyaltyPlanKey === loyaltyPlanKey
        );

        const {
          availablePointBalance,
          loyaltyPlan
        } = loyaltyMembership;
        const customerLoyaltyMembership = customer.loyaltyMemberships.find(
          (membership: ICustomerLoyaltyMembership) =>
            membership.loyaltyPlanKey === loyaltyPlan.loyaltyPlanKey
        );

        const pointBalance = loyaltyPlan.currentTransactionPointsAvailableImmediately ?
            availablePointBalance :
            customerLoyaltyMembership.availablePointBalance;

        loyaltyPlanPoints.push({
          loyaltyPlanKey,
          availablePointBalance: pointBalance
        });
      });

      this.props.performBusinessOperation(
        this.props.settings.deviceIdentity,
        LOYALTY_DISCOUNT_EVENT,
        [
          new UiInput(UiInputKey.REDEEMED_REDEMPTIONS, redemptions),
          new UiInput(UiInputKey.LOYALTY_PLANS, loyaltyPlanPoints)
        ]
      );
    } else {
      this.props.onCancel();
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  const {
    inProgress,
    error,
    loyaltyMemberships,
    selectedLoyaltyMembership,
    appliedRedemptions,
    availableRedemptions,
    selectedRedemptions
  } = state.loyaltyMembershipState;
  return {
    businessState: state.businessState,
    loyaltyInProgress: inProgress,
    loyaltyError: error,
    loyaltyMemberships,
    selectedLoyaltyMembership,
    appliedRedemptions,
    availableRedemptions,
    selectedRedemptions,
    settings: state.settings
  };
};

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  addRedemption: addRedemption.request,
  removeRedemption: removeRedemption.request,
  calculateLoyaltyMembership: calculateLoyaltyMembership.request,
  changeLoyaltyMembership: changeLoyaltyMembership.request,
  performBusinessOperation: businessOperation.request,
  sceneTitle: sceneTitle.request
})(LoyaltyDiscountComponent);
