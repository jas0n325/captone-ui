import {
  ICustomerLoyaltyMembership,
  ILoyaltyMembershipActivity,
  ILoyaltyRewardReason,
  LoyaltyRewardResult
} from "@aptos-scp/scp-component-store-selling-features";
import { LoyaltyRedemptionType } from "@aptos-scp/scp-types-commerce-transaction";
import {
  ADD_REDEMPTION,
  CALCULATE_LOYALTY_MEMBERSHIP,
  CHANGE_LOYALTY_MEMBERSHIP,
  CLEAR_LOYALTY_MEMBERSHIP,
  LOAD_REWARD_REASONS,
  REMOVE_REDEMPTION
} from "../actions";
import { RequestState } from "./reducers";

export interface ISelectedRedemptions {
  loyaltyPlanKey: string;
  loyaltyPlan: string;
  redemptions: ILoyaltyRewardReason[];
}

export interface LoyaltyMembershipState extends RequestState {
  rewardReasons: ILoyaltyRewardReason[];
  error: Error;

  loyaltyMembershipActivities: ILoyaltyMembershipActivity[];
  loyaltyMemberships: ICustomerLoyaltyMembership[];
  redemptions: ILoyaltyRewardReason[];

  selectedLoyaltyMembership: ICustomerLoyaltyMembership;
  appliedRedemptions: ILoyaltyRewardReason[];
  availableRedemptions: ILoyaltyRewardReason[];
  selectedRedemptions: ISelectedRedemptions[];
}

const INITIAL_LOYALTY_STATE: any = {
  loyaltyMembershipActivities: undefined,
  loyaltyMemberships: undefined,
  redemptions: undefined,
  appliedRedemptions: [],

  selectedLoyaltyMembership: undefined,
  availableRedemptions: [],
  selectedRedemptions: []
};

const INITIAL_STATE: LoyaltyMembershipState = Object.assign({
  rewardReasons: undefined,
  error: undefined,
  inProgress: false
}, INITIAL_LOYALTY_STATE);

export default (state: LoyaltyMembershipState = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case LOAD_REWARD_REASONS.REQUEST:
    case LOAD_REWARD_REASONS.SUCCESS:
    case LOAD_REWARD_REASONS.FAILURE:
      return Object.assign({}, state, action.payload);

    case CALCULATE_LOYALTY_MEMBERSHIP.REQUEST:
      return Object.assign({}, state, INITIAL_LOYALTY_STATE, { inProgress: true },
          handleCalculateLoyaltyMembership(state.rewardReasons, action));

    case CALCULATE_LOYALTY_MEMBERSHIP.SUCCESS:
      return Object.assign({}, state, action.payload, handleLoyaltyMembershipResponse(state, action), {
        inProgress: false
      });
    case CALCULATE_LOYALTY_MEMBERSHIP.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });

    case CLEAR_LOYALTY_MEMBERSHIP.REQUEST:
      return Object.assign({}, state, INITIAL_LOYALTY_STATE);

    case CHANGE_LOYALTY_MEMBERSHIP.REQUEST:
      const { loyaltyPlanKey } = action.payload;
      const selectedLoyaltyMembership = state.loyaltyMemberships.find((membership) =>
          membership.loyaltyPlanKey === loyaltyPlanKey
      );
      return Object.assign({}, state, {
        selectedLoyaltyMembership,
        availableRedemptions: getAvailableRedemptions(state.redemptions, selectedLoyaltyMembership)
      });

    case ADD_REDEMPTION.REQUEST:
    case REMOVE_REDEMPTION.REQUEST:
      return Object.assign({}, state, handleAppliedRedemptionsUpdate(state, action));

    default:
      return state;
  }
};

/**
 * Return the already applied redemptions.
 *
 * @param redemptions
 * @param applied
 */
function getAppliedRedemptions(redemptions: ILoyaltyRewardReason[], applied: ILoyaltyRewardReason[]):
    ILoyaltyRewardReason[] {
  return applied.map((ar) => redemptions.find((r) =>
      r.loyaltyPlanKey === ar.loyaltyPlanKey && r.reasonTypeKey === ar.reasonTypeKey)).filter((r) => !!r);
}

/**
 * Return the available redemptions.
 *
 * @param redemptions
 * @param loyaltyMembership
 * @param applied
 */
function getAvailableRedemptions(redemptions: ILoyaltyRewardReason[], loyaltyMembership: ICustomerLoyaltyMembership):
    ILoyaltyRewardReason[] {
  if (loyaltyMembership) {
    return redemptions && redemptions.filter((r) => r.loyaltyPlanKey === loyaltyMembership.loyaltyPlanKey);
  } else {
    return redemptions && redemptions.map((redemption) => redemption);
  }
}

/**
 * Create the selected redemptions group by plan.
 *
 * @param loyaltyMemberships
 * @param applied
 */
function getSelectedRedemptions(loyaltyMemberships: ICustomerLoyaltyMembership[],
                                applied: ILoyaltyRewardReason[]): ISelectedRedemptions[] {
  const selected: ISelectedRedemptions[] = [];
  loyaltyMemberships.forEach((membership) => {
    const redemptions = applied.filter((r) => r.loyaltyPlanKey === membership.loyaltyPlan.loyaltyPlanKey);
    if (redemptions.length > 0) {
      redemptions.sort((a, b) => a.pointsToDeduct - b.pointsToDeduct);
      selected.push({
        loyaltyPlanKey: membership.loyaltyPlanKey,
        loyaltyPlan: membership.loyaltyPlan.description || membership.loyaltyPlan.name,
        redemptions
      });
    }
  });

  return selected;
}

/**
 * Handle the loyalty response.
 *
 * @param state
 * @param action
 */
function handleLoyaltyMembershipResponse(state: LoyaltyMembershipState, action: any): any {
  const { loyaltyAvailableRedemptions, loyaltyMembershipActivities } = action.payload;

  let memberships;
  let redemptions: any = [];
  if (loyaltyAvailableRedemptions) {
    // Get the available redemptions
    redemptions = loyaltyAvailableRedemptions.filter((redemption: ILoyaltyRewardReason) =>
        redemption.redemptionType === LoyaltyRedemptionType.FlatAmountFixed &&
        redemption.rewardResult === LoyaltyRewardResult.ImmediateDiscount);
    redemptions.sort((a: ILoyaltyRewardReason, b: ILoyaltyRewardReason) => a.pointsToDeduct - b.pointsToDeduct);

    // Get the loyalty memberships that have redemptions and sort them
    memberships = loyaltyMembershipActivities.filter(
        (activity: ILoyaltyMembershipActivity) => redemptions.find((redemption: ILoyaltyRewardReason) =>
            redemption.loyaltyPlanKey === activity.membership.loyaltyPlanKey)).map(
        (activity: ILoyaltyMembershipActivity) => activity.membership);
  } else {
    memberships = loyaltyMembershipActivities.map(
        (activity: ILoyaltyMembershipActivity) => activity.membership);
  }

  // Filter the loyalty membership to remove duplicates
  const loyaltyPlanKeys: string[] = [];
  const loyaltyMemberships: ICustomerLoyaltyMembership[] = [];
  memberships.forEach((membership: ICustomerLoyaltyMembership) => {
    if (loyaltyPlanKeys.indexOf(membership.loyaltyPlanKey) === -1) {
      loyaltyMemberships.push(membership);
      loyaltyPlanKeys.push(membership.loyaltyPlanKey);
    }
  });
  loyaltyMemberships.sort((a: ICustomerLoyaltyMembership, b: ICustomerLoyaltyMembership) => {
    if (a.isDefault) {
      return -1;
    } else if (b.isDefault) {
      return 1;
    } else {
      return Number.parseInt(b.loyaltyPlanKey, 10) - Number.parseInt(a.loyaltyPlanKey, 10);
    }
  });
  const selectedLoyaltyMembership = loyaltyMemberships.length > 0 ? loyaltyMemberships[0] : undefined;

  // Get the redemptions that have already been applied
  const appliedRedemptions = getAppliedRedemptions(state.rewardReasons, state.appliedRedemptions);
  // Create the selected redemptions group by plan
  const selectedRedemptions: ISelectedRedemptions[] = getSelectedRedemptions(loyaltyMemberships,
      appliedRedemptions);
  const availableRedemptions = getAvailableRedemptions(redemptions, selectedLoyaltyMembership);

  return {
    loyaltyMemberships,
    redemptions,
    appliedRedemptions,

    selectedLoyaltyMembership,
    availableRedemptions,
    selectedRedemptions
  };
}

/**
 * Handle the update of the already applied redemptions.
 *
 * @param redemptions
 * @param action
 */
function handleCalculateLoyaltyMembership(redemptions: ILoyaltyRewardReason[], action: any): any {
  return {
    appliedRedemptions: redemptions ? getAppliedRedemptions(redemptions, action.payload.appliedRedemptions) :
        action.payload.appliedRedemptions
  };
}

/**
 * Handle the update of the applied redemptions.
 *
 * @param state
 * @param action
 */
function handleAppliedRedemptionsUpdate(state: LoyaltyMembershipState, action: any): any {
  const { redemption } = action.payload;
  const type = action.type;

  const appliedRedemptions = state.appliedRedemptions.map((r) => r);
  if (type === REMOVE_REDEMPTION.REQUEST) {
    appliedRedemptions.splice(appliedRedemptions.indexOf(redemption), 1);
  } else {
    appliedRedemptions.push(redemption);
  }

  return {
    appliedRedemptions,
    selectedRedemptions: getSelectedRedemptions(state.loyaltyMemberships, appliedRedemptions)
  };
}
