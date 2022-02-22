import _ from "lodash";
import * as React from "react";

import NonMerch from "./NonMerch";
import { NavigationScreenProps } from "../StackNavigatorParams";

interface Props extends NavigationScreenProps<"nonMerch"> {}

const NonMerchScreen = (props: Props) => {
  return <NonMerch {...props.route.params} navigation={props.navigation} />;
};

export default NonMerchScreen;
