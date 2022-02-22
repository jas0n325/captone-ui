import { DeviceIdentity, UiInput} from "@aptos-scp/scp-component-store-selling-core";
import {
  ILoyaltyMembershipActivity,
  ILoyaltyRewardReason
} from "@aptos-scp/scp-component-store-selling-features";
import { defineRequestType, RequestType, StandardAction } from "./actions";

export const CALCULATE_LOYALTY_MEMBERSHIP: RequestType = defineRequestType("CALCULATE_LOYALTY_MEMBERSHIP");
export const CLEAR_LOYALTY_MEMBERSHIP: RequestType = defineRequestType("CLEAR_LOYALTY_MEMBERSHIP");
export const LOAD_REWARD_REASONS: RequestType = defineRequestType("LOAD_REWARD_REASONS");
export const CHANGE_LOYALTY_MEMBERSHIP: RequestType = defineRequestType("CHANGE_LOYALTY_MEMBERSHIP");
export const ADD_REDEMPTION: RequestType = defineRequestType("ADD_REDEMPTION");
export const REMOVE_REDEMPTION: RequestType = defineRequestType("REMOVE_REDEMPTION");

export const calculateLoyaltyMembership = {
  request: (deviceIdentity: DeviceIdentity, uiInputs: UiInput[],
            appliedRedemptions: ILoyaltyRewardReason[]): StandardAction => {
    return {
      type: CALCULATE_LOYALTY_MEMBERSHIP.REQUEST,
      payload: {
        deviceIdentity,
        uiInputs,
        appliedRedemptions
      }
    };
  },
  success: (
      loyaltyMembershipActivities: ILoyaltyMembershipActivity[],
      loyaltyAvailableRedemptions: ILoyaltyRewardReason[]
  ): StandardAction => {
    return {
      type: CALCULATE_LOYALTY_MEMBERSHIP.SUCCESS,
      payload: {
        loyaltyMembershipActivities,
        loyaltyAvailableRedemptions,
        error: undefined
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: CALCULATE_LOYALTY_MEMBERSHIP.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const clearLoyaltyMembership = {
  request: (): StandardAction => {
    return {
      type: CLEAR_LOYALTY_MEMBERSHIP.REQUEST,
      payload: {
      }
    };
  }
};

export const loadRewardReasons = {
  request: (): StandardAction => {
    return {
      type: LOAD_REWARD_REASONS.REQUEST,
      payload: {
      }
    };
  },
  success: (rewardReasons: ILoyaltyRewardReason[]): StandardAction => {
    return {
      type: LOAD_REWARD_REASONS.SUCCESS,
      payload: {
        rewardReasons
      }
    };
  },
  failure: (): StandardAction => {
    return {
      type: LOAD_REWARD_REASONS.FAILURE,
      payload: {
      }
    };
  }
};

export const changeLoyaltyMembership = {
  request: (loyaltyPlanKey: string): StandardAction => {
    return {
      type: CHANGE_LOYALTY_MEMBERSHIP.REQUEST,
      payload: {
        loyaltyPlanKey
      }
    };
  }
};

export const addRedemption = {
  request: (redemption: ILoyaltyRewardReason): StandardAction => {
    return {
      type: ADD_REDEMPTION.REQUEST,
      payload: {
        redemption
      }
    };
  }
};

export const removeRedemption = {
  request: (redemption: ILoyaltyRewardReason): StandardAction => {
    return {
      type: REMOVE_REDEMPTION.REQUEST,
      payload: {
        redemption
      }
    };
  }
};
