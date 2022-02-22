import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import FastDiscountDetails from "./FastDiscountDetails";

interface Props extends NavigationScreenProps<"fastDiscountSelection"> {}

const FastDiscountDetailsScreen = (props: Props) => {
  return <FastDiscountDetails {...props.route.params} navigation={props.navigation}/>;
};

export default FastDiscountDetailsScreen;
