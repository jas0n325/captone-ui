import {
  Customer,
  ICustomerLoyaltyMembership
} from "@aptos-scp/scp-component-store-selling-features";

export interface LoyaltyEnrollmentScreenProps {
  customer: Customer;
  onSave: (
    loyaltyPlanKey: string,
    membershipTypeKey: string,
    emailAddress?: string
  ) => void;
  feedbackNoteMessage?: string;
  returnToCustomerScene?: string;
  emailAddress?: string;
}

export interface LoyaltyDiscountComponentProps {
  onCancel: () => void;
}

export interface LoyaltyMembershipDetailScreenProps {
  customer: Customer;
  loyaltyMemberships: ICustomerLoyaltyMembership[];
  loyaltyPlanKey: string;
  onLoyaltyEnrollment: (
    loyaltyPlanKey: string,
    membershipTypeKey: string,
    emailAddress?: string
  ) => void;
  customerEmailAddress?: string;
  returnToCustomerScene?: string;
  displayLoyaltyEnrollButton: boolean;
}
