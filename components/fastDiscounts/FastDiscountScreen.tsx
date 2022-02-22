import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import FastDiscount from "./FastDiscount";

interface Props extends NavigationScreenProps<"fastDiscountScreen"> {}

const FastDiscountScreen = (props: Props) => {
  return <FastDiscount {...props.route.params} navigation={props.navigation} />;
};

export default FastDiscountScreen;
