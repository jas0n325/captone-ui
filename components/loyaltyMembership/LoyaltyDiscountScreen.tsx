import _ from "lodash";
import * as React from "react";
import LoyaltyDiscountComponent from "./LoyaltyDiscountComponent";
import { NavigationScreenProps } from "../StackNavigatorParams";

interface Props extends NavigationScreenProps<"loyaltyDiscount"> {}

const LoyaltyDiscountScreen = (props: Props) => {
  return (
    <LoyaltyDiscountComponent
      {...props.route.params}
      navigation={props.navigation}
    />
  );
};

export default LoyaltyDiscountScreen;
