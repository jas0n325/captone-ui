import * as React from "react";

import Quantity from "./Quantity";
import { NavigationScreenProps } from "../StackNavigatorParams";

interface Props extends NavigationScreenProps<"quantity"> {}

const QuantityScreen = (props: Props) => {
  return <Quantity {...props.route.params} navigation={props.navigation} />;
};

export default QuantityScreen;
