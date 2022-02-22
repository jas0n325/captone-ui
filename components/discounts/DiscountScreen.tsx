import _ from "lodash";
import * as React from "react";

import DiscountComponent from "./DiscountComponent";
import { NavigationScreenProps } from "../StackNavigatorParams";

interface Props extends NavigationScreenProps<"discountScreen"> {}

const DiscountScreen = (props: Props) => {
  return <DiscountComponent {...props.route.params} navigation={props.navigation} />;
};

export default DiscountScreen;
