import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import DiscountTypeSelection from "./DiscountTypeSelection";

interface Props extends NavigationScreenProps<"discountTypeSelection"> {}

const DiscountTypeSelectionScreen = (props: Props) => {
  return <DiscountTypeSelection {...props.route.params} navigation={props.navigation}/>;
};

export default DiscountTypeSelectionScreen;
